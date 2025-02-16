<template>
  <div class="container">
    <div class="btns">
      <button @click="show = !show">切换</button>
    </div>
    <!-- 之前是在特定的时间挂对应的 CSS 样式类 -->
    <!-- 现在是在特定的时间触发事件处理函数 -->
    <Transition @before-enter="beforeEnter" @enter="enter" @leave="leave">
      <p v-if="show" class="box">Hello World</p>
    </Transition>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { gsap } from 'gsap'
  const show = ref(true)

  function beforeEnter(el) {
    gsap.set(el, { opacity: 0, y: -20})
  }

  function enter(el, done) {
    gsap.to(el, {
      duration: 1,
      opacity: 1,
      y: 0,
      onComplete: done
    })
  }

  function leave(el, done) {
    gsap.to(el, {
      duration: 1,
      opacity: 0,
      y: -20,
      onComplete: done
    })
  }
</script>

<style scoped>
  .container {
    text-align: center;
  }
  .btns button {
    margin: 1em 0.5em;
  }
  .box {
    width: 200px;
    height: 50px;
    background-color: #42b983;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px auto;
  }
</style>