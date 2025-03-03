<template>
  <div>
    <h1>懒加载示例</h1>
    <div class="image-grid">
      <img 
        v-for="(url, index) in imageUrls"
        v-observe-visibility="{
          callback: visibilityChange,
          once: true,
          intersection: {
            root: null,
            rootMargin: '0px',
            threshold: 0.2
          }
        }"
        :key="index"
        :data-src="url"
        :src="loadingImage" 
        :alt="`Image${index+1}`"
        @error="handleError"
      >
    </div>
  </div>
</template>

<script setup>
import { intersection } from 'lodash'
import { ref } from 'vue'

const imageUrls = ref([])

for(let i = 1; i <= 50; i++ ) {
  imageUrls.value.push(`https://via.placeholder.com/600x400?text=Image+${i}`)
}

// 加载图片的 url
const loadingImage = 'https://dummyimage.com/600x400/cccccc/000000&text=Loading'
// 错误图片的 url
const errorImage = 'https://dummyimage.com/600x400/ff0000/ffffff&text=Error'

function visibilityChange(visibility, entry) {
  const img = entry.target
  if (visibility) {
    img.src = img.dataset.src
  }
}

function handleError(e) {
  const img = e.target
  img.src = errorImage
}
</script>

<style scoped>
.image-grid {
  display: flex;
  flex-wrap: wrap;
}

.image-grid img {
  margin: 10px;
  width: 200px;
  height: 150px;
  object-fit: cover;
}
</style>