<template>
  <div>
    <CardComponent>
      <!-- 使用具名插槽 -->
      <template v-slot:header="slotsProps">
        <div>{{ slotsProps.title }}</div>
      </template>
      <!-- 向默认插槽中插入内容 -->
      <div class="card-content">
        <img src="./assets/landscape.jpeg" alt="Beautiful landscape" class="card-image" />
        <p>探索未知的自然风光，记录下每一个令人惊叹的瞬间。加入我们的旅程，一起见证世界的壮丽。</p>
      </div>

    </CardComponent>
  </div>
</template>

<script setup>
// import CardComponent from './components/CardComponent.vue'
import CardComponent from './components/CardComponent.js'


</script>

<style scoped>
.card-image {
  width: 100%;
  height: auto;
  border-bottom: 1px solid #ececec;
}
</style>