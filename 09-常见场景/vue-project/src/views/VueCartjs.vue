<template>
  <div>
    <h1>Bar</h1>
    <div class="container">
      <Bar :data="data" :options="options"/>
    </div>
    <h1>Line</h1>
    <div class="container">
      <Line :data="data" :options="options2"/>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// 接下来需要从 chart.js 里面引入一些组件
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
} from 'chart.js'

import { Bar, Line } from 'vue-chartjs'
// 引入第三方插件，然后也需要注册一下
import zoomPlugin from 'chartjs-plugin-zoom'
// 首先需要注册从 chart.js 引入的组件
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, zoomPlugin)

const data = ref({
  // 图表的X轴
  labels: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ],
  datasets: [
    {
      label: '销售数据',
      backgroundColor: '#f87979', // 数据集的背景颜色
      data: [40, 20, 12, 39, 10, 40, 39, 80, 40, 20, 12, 11] // 数据集的数据(Y轴)
    }
  ]
})

const options = ref({
  responsive: true // 响应式，图表会根据容器大小自动调整
})

const data2 = ref({
  labels: ['January', 'February', 'March'],
  datasets: [
    {
      label: 'Dataset 1',
      backgroundColor: '#f87979',
      data: [40, 20, 12]
    }
  ]
})
const options2 = ref({
  responsive: true,
  plugins: {
    // 具体插件相关的配置，参阅这个插件的文档
    zoom: {
      zoom: {
        wheel: {
          enabled: true // 启用滚轮缩放
        },
        pinch: {
          enabled: true // 启用捏合缩放
        },
        mode: 'xy' // 允许沿X轴和Y轴缩放
      },
      pan: {
        enabled: true,
        mode: 'xy'
      }
    },
    title: {
      display: true,
      text: 'Line Chart with Zoom and Pan'
    },
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      enabled: true,
      mode: 'index',
      intersect: false
    }
  }
})
</script>

<style scoped>
.container {
  width: 600px;
  height: 300px;
}
</style>