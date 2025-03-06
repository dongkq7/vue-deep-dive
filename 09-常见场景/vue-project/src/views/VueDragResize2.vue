<template>
  <div class="crop">
    <h1>照片编辑器</h1>
    <div class="controls">
      <input type="file" accept="image/*" @change="onChange"/>
      <button :disabled="!imageUrl" @click="handleCrop">裁剪</button>
    </div>
    <div class="editor-container" v-if="imageUrl">
      <div class="image-container">
        <img :src="imageUrl" class="photo" alt="用户选择的图片">
        <!-- 裁剪区域 -->
        <vue-drag-resize
          v-model="cropArea"
          :key="imageUrl"
          class="crop-area"
          :resizable="true"
          :draggable="true"
          :min-width="50"
          :min-height="50"
          :parent="true"
          :parent-limitation="true"
          @resizing="onResizing"
          @dragging="onDragging"
        />
      </div>
    </div>
    <div class="preview" v-if="croppedImageUrl">
      <h2>裁剪后的图片</h2>
      <!-- 显示裁剪后的图像 -->
      <img :src="croppedImageUrl" alt="裁剪后的图像" />
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import VueDragResize from 'vue-drag-resize/src'

// 裁剪区域初始坐标尺寸
const cropArea = ref({
  x: 100,
  y: 100,
  w: 100,
  h: 100
})
const imageUrl = ref(null)

const photoRef = ref(null)
const onChange = (event) => {
  const file = event.target.files[0]
  const reader = new FileReader()
  // 读取文件，读取完成后会触发 onload 事件
  reader.readAsDataURL(file)
  reader.onload = async (e) => {
    imageUrl.value = e.target.result
    await nextTick()
    photoRef.value = document.querySelector('.photo')
  }
}

const onResizing = ({left, top, width, height}) => {
  cropArea.value = { x: left, y: top, w: width, h: height}
}

const onDragging = ({left, top}) => {
  cropArea.value = {...cropArea.value, x: left, y: top}
}

const croppedImageUrl = ref(null) // 存储裁剪后的图像的 URL
const handleCrop = () => {
  const photo = photoRef.value
  if (!photo) return
  // 创建一个新的 image 对象，用于存储裁剪后的图像
  const image = new Image()
  image.src = imageUrl.value // 设置图像的 URL
  // 该事件会在图像加载完成后触发
  image.onload = () => {
    // 主要需要做的工作，是将裁剪后的图像绘制到 canvas 上
    const canvas = document.createElement('canvas') // 创建一个 canvas 元素
    const ctx = canvas.getContext('2d') // 获取 canvas 的 2d 上下文对象
    // 从裁剪区域获取信息：坐标和尺寸
    const { x, y, w, h } = cropArea.value
    // 获取原始图像的尺寸
    const imageWidth = image.width
    const imageHeight = image.height
    // 获取显示图像的容器元素
    const containerWidth = photo.clientWidth
    const containerHeight = photo.clientHeight
    // 接下来来计算两个宽高比
    // 图像的宽高比
    const imageAspectRatio = imageWidth / imageHeight
    // 容器元素的宽高比
    const containerAspectRatio = containerWidth / containerHeight
    // 计算图像在容器中显示的宽高
    let displayWidth, displayHeight
    if (imageAspectRatio > containerAspectRatio) {
      // 图像更宽
      displayWidth = containerWidth
      displayHeight = containerWidth / imageAspectRatio
    } else {
      // 图像更高
      displayHeight = containerHeight
      displayWidth = containerHeight * imageAspectRatio
    }

    // 接下来需要计算图像在容器中的一个偏移量
    const offsetX = (containerWidth - displayWidth) / 2
    const offsetY = (containerHeight - displayHeight) / 2

    // 接下来还需要计算水平和垂直缩放比例
    const scaleX = imageWidth / displayWidth
    const scaleY = imageHeight / displayHeight

    // 为什么需要这些数据呢？因为一会儿绘制canvas的时候，需要使用这些数据

    // 设置 canvas 画布的宽高
    canvas.width = w * scaleX
    canvas.height = h * scaleY

    // 数据准备完毕后，接下来调用 canvas 方法来进行绘制
    ctx.drawImage(
      image, // 绘制的图像
      (x - offsetX) * scaleX, // 裁剪区域的 x 坐标
      (y - offsetY) * scaleY, // 裁剪区域的 y 坐标
      w * scaleX, // 裁剪区域的宽度
      h * scaleY, // 裁剪区域的高度
      0, // 绘制到 canvas 的 x 坐标
      0, // 绘制到 canvas 的 y 坐标
      w * scaleX, // 绘制到 canvas 的宽度
      h * scaleY // 绘制到 canvas 的高度
    )
    croppedImageUrl.value = canvas.toDataURL('image/png') // 将 canvas 转换为 base64 编码的 URL
    console.log('croppedImageUrl', croppedImageUrl.value)
  }
}
</script>

<style scoped>
.crop {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.controls {
  margin-bottom: 20px;
}

.editor-container {
  width: 80%;
  height: 60vh;
  background-color: #fff;
  border: 1px solid #ccc;
  position: relative;
  overflow: hidden;
}

.image-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.photo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.crop-area {
  border: 2px dashed #fff;
  background-color: rgba(133, 130, 130, 0.3);
}

.preview {
  margin-top: 20px;
  text-align: center;
}

.preview img {
  max-width: 100%;
  height: auto;
}
</style>