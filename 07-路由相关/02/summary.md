#  一些零碎知识

## 1. 别名

通过 alias 可以设置别名。

假设你有一个路由 /user/:id/profile 显示用户的个人资料，你希望能够通过 /profile/:id 也能访问到同样的组件，那么此时就可以通过别名的方式来进行配置，例如：

```javascript
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/user/:id/profile',
      name: 'user-profile',
      component: UserProfile,
      alias: '/profile/:id' // 配置路由别名
    }
  ]
});
```

别名的好处：

- 提供不同的访问路径：为同一个路由提供了多种访问方式，更加灵活
- 兼容旧路径：有些时候需要更新路径，使用别名可以保证旧的路由依然有效
- 简化路径：特别是嵌套路由的情况下，路径可能会很长，别名可以简化路径

## 2. 命名视图

router-view 被称之为视图或者路由出口。

有些时候会存在这样的需求，那就是**一个路由对应多个组件**，而非一个组件。**不同的组件渲染到不同的视图里面**，此时需要给视图设置不同的 name 来加以区分。

例如：

```javascript
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      // 注意这里是 components，多了一个's'
      components: {
        default: Home,
        // LeftSidebar: LeftSidebar 的缩写
        LeftSidebar,
        // 它们与 <router-view> 上的 name 属性匹配
        RightSidebar,
      },
    },
  ],
})
```

在上面的 components 配置中，对应了多个组件，所以视图也就提供多个：

```vue
<router-view class="view left-sidebar" name="LeftSidebar" />
<router-view class="view main-content" />
<router-view class="view right-sidebar" name="RightSidebar" />
```

如果**视图没有设置名字，那么默认为 default**. 那些只配置了一个组件的路由，默认就渲染在 default 视图所在位置。

## 3. 重定向

通过 redirect 可以配置路由重定向，它允许你将一个路径重定向到另一个路径，当用户访问被重定向的路径时，浏览器的 URL 会自动更新到目标路径，并渲染目标路径对应的组件。

redirect 对应的值可以有多种形式：

1. 字符串

```javascript
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/home',
      redirect: '/'
    },
    {
      path: '/',
      component: HomeView
    }
  ]
});
```

在这个示例中，当用户访问 /home 时，会被重定向到 /，并渲染 HomeView 组件。

1. 对象：可以使用对象来更详细地定义重定向，包括传递路径参数和查询参数。

```javascript
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/user/:id',
      redirect: { name: 'profile', params: { userId: ':id' } }
    },
    {
      path: '/profile/:userId',
      name: 'profile',
      component: UserProfile
    }
  ]
});
```

在这个示例中，当用户访问 /user/123 时，会被重定向到 /profile/123，并渲染 UserProfile 组件。

1. 函数：重定向函数可以根据路由信息动态生成重定向目标路径。

```javascript
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/old-path/:id',
      redirect: to => {
        const { params } = to;
        return `/new-path/${params.id}`;
      }
    },
    {
      path: '/new-path/:id',
      component: NewPathComponent
    }
  ]
});
```

在这个示例中，当用户访问 /old-path/123 时，会被重定向到 /new-path/123，并渲染 NewPathComponent 组件。

## 4. 路由元数据

元数据（meta fields）是一种附加到路由配置中的属性，用来存储与路由相关的**附加信息**。

元数据经常用于权限控制、标题设置、面包屑导航、路由过渡之类的效果

1. 定义元数据：添加一个 meta 配置项，该配置项对应的是一个对象，对象里面就是你自定义要添加的信息

```javascript
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: HomeView,
      meta: { requiresAuth: true, title: 'Home' }
    },
    {
      path: '/about',
      component: AboutView,
      meta: { requiresAuth: false, title: 'About Us' }
    }
  ]
});
```

1. 访问元数据：在导航守卫的回调函数中，会自动传入 to 这个参数（你要起哪里），通过 to.meta 就可以拿到元数据信息

```javascript
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    next('/login');
  } else {
    next();
  }
});
```



## 5. 路由懒加载

在新项目的模板代码中，官方路由示例的写法如下：

```javascript
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router
```

可以看到，HomeView 是正常导入，而 AboutView 却有所不同。component 的配置对应的是一个返回 Promise 组件的函数，这种情况下，Vue Router 只会在第一次进入页面时才会获取这个函数，然后使用缓存数据。

这意味着你也可以使用更复杂的函数，只要它们返回一个 Promise ：

```javascript
const UserDetails = () =>
  Promise.resolve({
    /* 组件定义 */
  })
```

这样的组件导入方式被称之为动态导入，好处在于：

1. 当路由被访问的时候才加载对应组件，这样就会更加高效
2. 进行打包的时候方便做**代码分割**



另外注意，**路由中不要再使用异步组件**，也就是说下面的代码虽然可以使用，但是**没有必要**：

```javascript
import { defineAsyncComponent } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

const asyncAboutView = defineAsyncComponent(() =>
    import('../views/AboutView.vue')
)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ...
    {
      path: '/about',
      name: 'about',
      component: asyncAboutView
    }
  ]
})

export default router
```

究其原因，是因为 **Vue-router 内部会自动对动态导入做处理，转换为异步组件**，**开发者只需要书写动态导入组件的代码即可**，无需再显式使用 defineAsyncComponent，这样更加简洁方便一些。

# 二、路由匹配

前面所介绍的路由匹配：

1. 静态路由匹配：/about ---> /about
2. 动态路由匹配：/users/:id ---> /users/1、/users/2

路由匹配规则非常丰富。

## 1. 参数正则

```javascript
const routes = [
  // 这是一个动态路由
  { path: '/users/:userId' },
]
```

我们期望后面是一个用户的 id，/users/1、/users/2

/users/abc 这种形式依然能够匹配上

参数就可以设置为正则的方式.

```javascript
const routes = [
  // 这是一个动态路由
  // 第一个 \ 是转义字符
  // 后面的 \d 代表数字的意思
  // 最后的 + 表示数字可以有1个或者多个
  // 这里用于限制参数的类型
  { path: '/users/:userId(\\d+)' },
]
```

现在该路由后面的参数就只能匹配数字。



## 2. 重复参数

可以设置参数的重复次数，+ 表示 1 或者多次，* 表示 0 或者多次

```javascript
const routes = [
  // 注意这里是写在参数后面的，用于限制参数出现的次数
  { path: '/product/:name+' },
]
```

- /product/one：能够匹配，name 参数的值为 `["one"]`
- /product/one/two：能够匹配，name 参数的值为 `["one", "two"]`
- /product/one/two/three：能够匹配，name 参数的值为 `["one", "two", "three"]`
- /product：不能匹配，因为要求参数至少要有1个

此时，参数可以通过`$route.params.name`来获取

```javascript
const routes = [
  { path: '/product/:name*' },
]
```

- /product：能够匹配，name 参数的值为 `[]`
- /product/one：能够匹配，name 参数的值为 `["one"]`
- /product/one/two：能够匹配，name 参数的值为 `["one", "two"]`

可以和自定义正则一起使用，将重复次数符号放在自定义正则表达式后面：

```javascript
const routes = [
  // 前面的 (\\d+) 是限制参数的类型
  // 最后的 + 是限制参数的次数
  { path: '/product/:id(\\d+)+' },
]
```

- /product/123 ：能够匹配，id 参数的值为 `["123"]`
- /product/123/456：能够匹配，id 参数的值为 `["123", "456"]`
- /product/123/456/789：能够匹配，id 参数的值为 `["123", "456", "789"]`
- /product/abc：不能匹配，因为 abc 不是数字
- /product/123/abc：不能匹配，因为 abc 不是数字
- /product/：不能匹配，因为至少需要一个数字



## 3. 可选参数

可以通过使用 ? 修饰符(0 个或 1 个)将一个参数标记为可选：

```javascript
const routes = [
  { path: '/users/:userId?' }
];
```

- /users：能够匹配，可以没有 userId 这个参数
- /users/posva：能够匹配，userId 参数的值为 `"posva"`

```javascript
const routes = [
  // 这里就是对参数类型进行了限制
  // 参数可以没有，如果有的话，必须是数字
  { path: '/users/:userId(\\d+)?' }
];
```

- /users：能够匹配，因为可以没有参数
- /users/42：能够匹配，有参数并且参数是数字
- /users/abc：不匹配，因为参数不是数字



## 4.  sensitive与strict

默认情况下，所有路由是**不区分大小写**的，并且**能匹配带有或不带有尾部斜线的路由**。

例如，路由 /users 将匹配 /users、/users/、甚至 /Users/。

这种行为可以通过 strict 和 sensitive 选项来修改：

- sensitive：指定路径匹配是否对**大小写敏感**，默认 false
- strict：指定路径匹配是否严格要求**结尾的斜杠**，默认 false

它们既可以应用在整个全局路由上，又可以应用于当前路由上：

```javascript
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 这个sensitive是局部应用
    { path: '/users/:id', sensitive: true }
  ],
  strict: true, // 这个strict是全局应用
});

export default router;
```

- /users/posva：能够匹配
- /users/posva/：不能够匹配，因为 strict 是 true，不允许有多余的尾部斜线
- /Users/posva：不能够匹配，因为 sensitive 是 true，严格区分大小写

```javascript
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/users/:id?' }
  ],
  strict: true,
});

export default router;
```

- /users：能够匹配，因为 id 是可选
- /Users：能够匹配，因为默认不区分大小写
- /users/42：能够匹配，这里会匹配上 id 参数
- /users/：不能匹配，因为 strict 是 true，不允许有多余的尾部斜线
- /users/42/：不能匹配，因为 strict 是 true，不允许有多余的尾部斜线



最后官方推荐了一个 [路径排名调试工具](https://paths.esm.dev/?p=AAMeJSyAwR4UbFDAFxAcAGAIJXMAAA..)，可以用于了解为什么一个路由没有被匹配，或者报告一个 bug.

# 三、路由组件传参

路由组件传参是指**将参数直接以 props 的形式传递给组件**。



## 快速上手

回顾如何获取路由参数。假设有如下的动态路由：

```javascript
const routes = [
  { 
    path: '/users/:userId(\\d+)',
    component: User
  },
]
```

之后诸如 /users/1 就会匹配上该路由，其中 1 就是对应的参数。那么在组件中如何获取这个参数呢？

1. 要么用 $route.params
2. 要么就是 useRoute( ) 方法获取到当前的路由

这些方式**和路由是紧密耦合的**，这限制了组件的灵活性，因为它**只能用于特定的 URL**.

一种更好的方式，是将参数设置为组件的一个 props，这样能删除组件对 $route 的直接依赖。

1. 首先在路由配置中开启 props

```javascript
const routes = [
  { path: '/user/:userId(\\d+)', name: 'User', component: User, props: true }
]
```

1. 在组件内部设置 id 这个 props，之后路由参数就会以 props 的形式传递进来

```javascript
const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})
```



## 相关细节

路由参数设置成组件 props，支持不同的模式：

1. 布尔模式
2. 对象模式
3. 函数模式

### 1. 布尔模式

当 props 设置为 true 时，route.params 将被设置为组件的 props。

如果是命名视图，那么需要为每个命名视图定义 props 配置：

```javascript
const routes = [
  {
    path: '/user/:id',
    components: { default: User, sidebar: Sidebar },
    props: { default: true, sidebar: false }
  }
]
```

### 2. 对象模式

当 props 设置为一个对象时候，回头传递到组件内部 props 的信息就是这个对象。

```javascript
const routes = [
  {
    path: '/product/:name+',
    name: 'product',
    component: () => import('../views/ProductView.vue'),
    sensitive: true,
    strict: true,
    props: {
      new: true
    }
  }
]
const props = defineProps({
  new: {
    type: Boolean
  }
})
console.log(props.new) // true
```

### 3. 函数模式

可以创建一个返回 props 的函数。这允许你将参数转换为其他类型，将静态值与基于路由的值相结合。

```javascript
const routes = [
  {
    path: '/search',
    name: 'search',
    component: () => import('../views/SearchView.vue'),
    props: (route) => ({query: route.query.q})
  }
]
<template>
  <div>
    query: {{ query }}
  </div>
</template>

<script setup>
defineProps({
  query: {
    type: String
  }
})
</script>
```

### RouterView插槽设置props

还可以在 RouterView 里面设置 props，例如：

```vue
<RouterView v-slot="{ Component }">
  <component
    :is="Component"
    view-prop="value"
   />
</RouterView>
```

这种设置方式会让所有视图组件都接收 view-prop，相当于每个组件都设置了 view-prop 这个 props，使用时需考虑实际情况来用。

```vue
<template>
  <div class="about">
    <h1>This is an Home page</h1>
  </div>
</template>
<script setup>
const props = defineProps({
  viewProp: {
    type: String
  }
})

console.log(props.viewProp) // value
</script>
<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
```

# 四、内置组件与内置函数

## 内置组件

### RouterLink

2个样式类：

1. activeClass：当链接所指向的路径**匹配**当前路由路径时，应用于该链接的 CSS 类，默认类名为 `router-link-active`

```vue
<RouterLink to="/about" activeClass="my-active">About</RouterLink>
```

- 当前路径是 /about：会应用 my-active 样式类
- 当前路径是 /about/team：会应用 my-active 样式类

1. exactActiveClass：当链接所指向的路径**精确匹配**当前路由路径时，应用于该链接的 CSS 类，默认类名为 `router-link-exact-active`

```vue
<RouterLink to="/about" exactActiveClass="my-exact-active">About</RouterLink>
```

- 当前路径是 /about：会应用 my-exact-active 样式类
- 当前路径是 /about/team：不会应用 my-exact-active 样式类

### RouterView

称之为**视图**或**路由出口**

RouterView 组件暴露了一个插槽（作用域插槽），**这个插槽可以用来获取当前匹配的路由组件**。

```vue
<router-view v-slot="{ Component }">
  <component :is="Component" />
</router-view>
```

思考🤔：获取到当前所匹配的组件有啥用呢？

答案：主要就是为了方便扩展一些其他的功能。

**KeepAlive & Transition**

当在处理 KeepAlive 组件时，我们通常想要保持对应的路由组件活跃，而不是 RouterView 本身。为了实现这个目的，我们可以将 KeepAlive 组件放置在插槽内：

```vue
<router-view v-slot="{ Component }">
  <keep-alive>
    <component :is="Component" />
  </keep-alive>
</router-view>
```

类似地，插槽允许我们使用一个 Transition 组件来实现在路由组件之间切换时实现过渡效果：

```vue
<router-view v-slot="{ Component }">
  <transition>
    <component :is="Component" />
  </transition>
</router-view>
```

两者结合后的嵌套顺序：

```vue
<router-view v-slot="{ Component }">
  <transition>
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </transition>
</router-view>
```

**模板引用**

使用插槽可以让我们直接将模板引用放置在路由组件上。

```vue
<router-view v-slot="{ Component }">
  <!-- 我现在要引用组件内部的模板 -->
  <component :is="Component" ref="mainContent"/>
</router-view>
```

如果将 ref 挂在 router-view 上面，那么最终拿到的是 router-view 的引用，而非所匹配的组件本身。

## 内置函数

### useRouter和useRoute

**在 setup 中没有 this**，因此无法像 Vue2 那样通过 this.![img](https://cdn.nlark.com/yuque/__latex/63553e039d46d5f9ca46ca35310f326c.svg)route 来访问路由实例和当前路由

与之替代的就是通过 useRouter 和 useRoute 这两个内置函数。

```javascript
import { useRouter, useRoute } from 'vue-router'

const router = useRouter() // 拿到的就是整个路由实例
const route = useRoute() // 拿到的是当前路由

function pushWithQuery(query) {
  router.push({
    name: 'search',
    query: {
      ...route.query,
      ...query,
    },
  })
}
```

另外，在模板中可以直接访问`$router`和`$route`，所以如果只在模板中使用这些对象的话，那就不需要 useRouter 或 useRoute.

### useLink

useLink 主要用于**自定义导航组件的时候使用**。

```javascript
const {
  // 解析出来的路由对象
  route,
  // 用在链接里的 href
  href,
  // 布尔类型的 ref 标识链接是否匹配当前路由
  isActive,
  // 布尔类型的 ref 标识链接是否严格匹配当前路由
  isExactActive,
  // 导航至该链接的函数
  navigate
} = useLink(props) // 这里接收的props类似于RouterLink所有props
```

NavigationLink.vue

```vue
<template>
  <a :href="link.href" @click.prevent="navigate"></a>
</template>

<script setup>
import { useLink } from 'vue-router'

const props = defineProps({
  to: {
    type: String,
    required: true
  }
})

const link = useLink({
  to: props.to
})

const navigate = () => {
  if (confirm('确定要跳转吗?')) {
    link.navigate()
  }
}

</script>
```

App.vue

```vue
<template>
  <div id="app">
    <nav>
      <NavigateLink to="/">首页</NavigateLink>
      <NavigateLink to="/about">关于</NavigateLink>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script setup>
import NavigateLink from './components/NavigationLink.vue'
</script>
```

# 五、导航守卫

所谓导航守卫，就是在当你进行导航的时候将其拦截下来，从而方便做一些其他的事情。

## 快速上手

```javascript
// 全局导航守卫
router.beforeEach((to, from, next) => {
  // 回调函数里面决定了拦截下来后做什么
  console.log('from:', from)
  console.log('to:', to)
  console.log('导航到：', to.name)
  next() // 调用该方法代表放行
})
```

这是一个全局导航守卫，回调会自动传入 3 个参数：

- to：即将要**进入的目标路由**，是一个**对象**，对象里面有 path、fullPath、hash、params 等参数
- from：当前导航**正要离开的路由**，同样是一个对象，对象内部有上述参数
- next：是一个函数，表示导航放行



## 各种拦截守卫

整体分为 3 大类：

### 全局守卫

#### beforeEach

全局前置守卫，会**在解析组件守卫和异步路由组件之前被调用**

#### beforeResolve

全局解析守卫，在**导航被确认之前，但在所有组件内守卫和异步路由组件被解析之后调用**

#### afterEach

全局后置守卫，**在导航确认后触发**的钩子函数。该钩子函数执行后会触发 DOM 更新，用户看到新的页面。

- 思考🤔：既然导航都已经确认了，这里安插一个守卫干嘛呢？
- 全局后置守卫经常用于如下的场景：

1. 记录页面访问历史：可以使用 afterEach 来记录用户访问的页面，以便进行统计或分析。
2. 关闭加载指示器：在 beforeEach 中开启加载指示器，在 afterEach 中关闭它，以提供更好的用户体验。
3. 页面切换动画：在 afterEach 中触发页面切换动画或其他视觉效果，以提升用户体验。
4. 更新文档标题：在导航完成后更新页面标题，以反映当前页面内容。

### 路由守卫 

#### beforeEnter

针对特定路由设置的守卫，因此设置的方式也不再是在 router 路由实例上面设置，而是在某个路由配置中设置。

```javascript
const routes = [
  {
    path: '/users/:id',
    component: UserDetails,
    // 在路由的配置中进行设置，只针对特定的路由进行拦截
    beforeEnter: (to, from) => {
      // reject the navigation
      return false
    },
  },
]
```

相关细节：

1. beforeEnter 守卫**只在进入路由时触发**，**不会在 params、query 或 hash 改变时触发**。

- 从 /users/2 进入到 /users/3 这种不会触发
- 从 /users/2#info 进入到 /users/2#projects 这种也不会触发

1. 如果放在父级路由上，路由在具有相同父级的子路由之间移动时，它不会被触发。

```javascript
const routes = [
  {
    path: '/user',
    beforeEnter() {
      // ...
    },
    children: [
      { path: 'list', component: UserList },
      { path: 'details', component: UserDetails },
    ],
  },
]
```

从 /user/list 跳转到 /user/details 不会触发路由级别守卫。

### 组件守卫

这种守卫是组件级别，取决于是否进入或者离开某个组件

#### beforeRouteEnter

进入了该导航，组件开始渲染之前，需要注意没有这个钩子函数

#### beforeRouteUpdate

当前路由改变，但是该组件被复用时调用，例如对于一个带有动态参数的路径 /users/:id，在 /users/1 和 /users/2 之间跳转的时候会触发

#### beforeRouteLeave

离开了该导航，组件失活的时候

### 执行顺序

整体执行顺序：

1. 组件离开守卫
2. 全局前置守卫
3. 路由级别守卫
4. 全局解析守卫
5. 全局后置守卫
6. 组件进入守卫

如果是组件复用，参数变化的情况，执行顺序如下：

1. 全局前置守卫
2. 组件更新守卫
3. 全局解析守卫
4. 全局后置守卫



## 其他细节

### 路由级别守卫beforeEnter设置多个值

路由级别守卫，也就是 beforeEnter 可以**设置成一个数组，数组里面包含多个方法**，每个方法进行一项处理。

```javascript
const routes = [
  // ...
  {
    path: '/about',
    name: 'About',
    component: About,
    beforeEnter: [
      (to, from, next) => {
        console.log('Route beforeEnter step 1')
        next()
      },
      (to, from, next) => {
        console.log('Route beforeEnter step 2')
        next()
      }
    ]
  },
  // ...
]
```

### 在守卫内的全局注入

从 **Vue 3.3** 开始，你可以在导航守卫内使用 inject() 方法。这在注入像 pinia stores 这样的全局属性时很有用。

在 app.provide() 中提供的所有内容都可以在全局守卫里面获取到。

```javascript
// main.js
const app = createApp();
app.provide('global', 'some data');
// router.js
router.beforeEach(()=>{
  const data = inject('global');
  
  const userStore = useUserStore();
})
```



## 实战案例

使用导航守卫拦截未登录的用户，将未登录用户导航到登录页面。

角色：普通用户、管理员

页面：主页、用户页、管理员页、登录

未登录：主页、登录

用户身份登录：主页、用户页、登录

管理员身份登录：主页、用户页、管理员页、登录



# 六、过渡特效

## 快速上手

为路由切换添加过渡效果，其实就是使用 Transition 内置组件，没有其他新知识。

```vue
<template>
  <div id="app">
    <nav>
      <router-link to="/">主页</router-link>
      <router-link to="/user">用户页</router-link>
      <router-link to="/admin">管理员</router-link>
      <router-link to="/login">登录</router-link>
    </nav>
    <router-view v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: 0.1s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

如果不添加mode，那么旧组件的消失和新组件的进入是同时进行过渡的，所以会出现闪烁问题。

此时需要添加mode: 'out-in'，旧组件先消失，新组件再进入。

## 相关细节

### 单个路由的过渡

如果对不同的路由的过渡有需求，那么可以通过以下的设置来做：

1. meta：设置元数据，上面记录过渡的方式
2. RouterView 插槽，通过插槽拿到 route，从而拿到元数据里面的过渡方式
3. <Transition>组件设置不同的 name 值从而应用不同的过渡方式

```vue
<template>
  <div id="app">
    <nav>
      <router-link to="/">主页</router-link>
      <router-link to="/user">用户页</router-link>
      <router-link to="/admin">管理员</router-link>
    </nav>
    <router-view v-slot="{ Component, route }">
      <Transition :name="route.meta?.transition || 'fade'" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
  </div>
</template>
```

### 基于路由动态过渡

这里可以使用导航守卫（全局后置守卫）来添加过渡效果

```javascript
router.afterEach((to) => {
  switch (to.path) {
    case '/panel-left':
      to.meta.transition = 'slide-left'
      break
    case '/panel-right':
      to.meta.transition = 'slide-right'
      break
    default:
      to.meta.transition = 'fade'
  }
})
```

### 使用Key

Vue 可能会自动复用看起来相似的组件，从而忽略了任何过渡，可以添加一个 key 属性来强制过渡。

```vue
<template>
  <div id="app">
    <nav>
      <router-link to="/">主页</router-link>
      <router-link to="/user/1">用户页1</router-link>
      <router-link to="/user/2">用户页2</router-link>
      <router-link to="/admin">管理员</router-link>
    </nav>
    <router-view v-slot="{ Component, route }">
      <Transition  name="slide-left" mode="out-in">
        <component :is="Component" :key="route.path"/>
      </Transition>
    </router-view>
  </div>
</template>
```

# 七、滚动行为

在 Vue-router 可以自定义路由切换时页面如何滚动。

注意：这个功能只在支持 history.pushState 的浏览器中可用。

当创建一个 Router 实例，可以提供一个 scrollBehavior 方法：

```javascript
const router = createRouter({
  history: createWebHashHistory(),
  routes: [...],
  scrollBehavior (to, from, savedPosition) {
    // return 期望滚动到哪个的位置
        // 始终滚动到顶部
    return { top: 0 }
  }
})
```

第三个参数 savedPosition，只有当这是一个 popstate 导航时才可用（**由浏览器的 后退/前进 按钮触发**）。



## 快速入门

核心代码如下：

```javascript
const router = createRouter({
  history: createWebHistory(),
  routes,
  // 设置滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return { ...savedPosition, behavior: 'smooth' }
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})
```

savedPosition 是一个类似于 `{ left: XXX, top: XXX }`  这样的对象，如果存在就滚动到对应位置，否则滚动到 top 为 0 的位置。



## 相关细节

### 滚动到指定元素

以通过 el 传递一个 CSS 选择器或一个 DOM 元素。在这种情况下，top 和 left 将被视为该元素的相对偏移量。

```javascript
const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    // 始终在元素 #main 上方滚动 10px
    return {
      // 也可以这么写
      // el: document.getElementById('main'),
      el: '#main',
      // 在元素上 10 像素
      top: 10,
    }
  },
})
```

### 延迟滚动

有时候，我们需要在页面中滚动之前稍作等待。例如，当处理过渡时，我们希望等待过渡结束后再滚动。要做到这一点，你可以返回一个 Promise，它可以返回所需的位置描述符。

下面是一个例子，我们在滚动前等待 500ms：

```javascript
const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ left: 0, top: 0 })
      }, 500)
    })
  },
})
```

### 使用锚点链接进行滚动

在使用锚点连接进行滚动的时候，需要在scrollBehavior中进行如下配置：

```javascript
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
  }
})
```

这样通过锚点连接进行跳转才会生效

App.vue：

```vue
<template>
  <div id="app">
    <nav>
      <router-link to="/">主页</router-link>
      <router-link to="/about">关于</router-link>
      <router-link to="/about#section1">About第一小节</router-link>
      <router-link to="/about#section2">About第二小节</router-link>
      <router-link to="/about#section3">About第三小节</router-link>
    </nav>
    <div class="content">
      <router-view v-slot="{ Component, route }">
        <component :is="Component" />
      </router-view>
    </div>
  </div>
</template>
```

# 八、动态路由

