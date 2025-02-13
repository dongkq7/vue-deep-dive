<template>
  <div class="card">
    <div class="card-header">
      <!-- vue3.4之后，如果属性名与值一样可以简写 -->
      <slot name="header" :title>
        <div>默认标题</div>
      </slot>
    </div>
    <div class="card-body">
      <slot>
        <div>默认内容</div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const title = ref('标题2')
</script>

<style>
.card {
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 300px;
  margin: 20px;
}

.card-header {
  background-color: #f7f7f7;
  border-bottom: 1px solid #ececec;
  padding: 10px 15px;
  font-size: 16px;
  font-weight: bold;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.card-body {
  padding: 15px;
  font-size: 14px;
  color: #333;
}
</style>