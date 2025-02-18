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