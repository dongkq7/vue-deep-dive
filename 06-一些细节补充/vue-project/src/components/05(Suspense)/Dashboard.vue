<template>
  <div class="dashboard">
    <h1>控制台</h1>
    <Suspense @pending="onPending" @resolve="onResolve" @fallback="onFallback">
      <template #default>
        <!-- 所有异步组件加载完成后显示的内容 -->
        <div>
          <!-- 内容一：下面是好友状态组件（2s）-->
          <Profile />
          <!-- 内容二：活动提要（8s）、统计组件（5s） -->
          <Content />
        </div>
      </template>
      <template #fallback>
        <!-- 只要有任何一个异步状态没有完成，显示后备内容 -->
        <LoadingComponent />
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import Profile from './Profile.vue'
import Content from './Content.vue'
import LoadingComponent from './LoadingComponent.vue'

const onPending = () => {
  console.log('当前处于pending状态')
}

const onResolve = () => {
  console.log('异步组件加载完毕')
}

const onFallback = () => {
  console.log('当前处于fallback状态，显示后备内容')
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}
</style>
