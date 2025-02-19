<template>
  <Tree 
    :data="data"
    :show-checkbox="true"
    :transition="true"
    @updateChildCheck="updateChildCheck"
  />
</template>

<script setup>
import { ref } from 'vue'
import Tree from '../components/Tree.vue'

// 定义树形数据
const data = ref([
  {
    label: '水果',
    checked: false, // 添加初始勾选状态
    children: [
      {
        label: '苹果',
        checked: false,
        children: [
          {
            label: '红富士',
            checked: false
          },
          {
            label: '黄元帅',
            checked: false
          }
        ]
      },
      {
        label: '香蕉',
        checked: false,
        children: [
          {
            label: '大香蕉',
            checked: false
          },
          {
            label: '小香蕉',
            checked: false
          }
        ]
      }
    ]
  },
  {
    label: '游戏',
    checked: false,
    children: [
      {
        label: '英雄联盟',
        checked: false,
        children: [
          {
            label: '剑圣',
            checked: false
          },
          {
            label: '盖伦',
            checked: false
          },
          {
            label: '流浪法师',
            checked: false
          },
          {
            label: '女枪',
            checked: false
          }
        ]
      },
      {
        label: '王者荣耀',
        checked: false,
        children: [
          {
            label: '后羿',
            checked: false
          },
          {
            label: '鲁班七号',
            checked: false
          }
        ]
      }
    ]
  },
  {
    label: '电影',
    checked: false,
    children: [
      {
        label: '动作片',
        checked: true,
        children: [
          {
            label: '速度与激情',
            checked: false
          },
          {
            label: '碟中谍',
            checked: false
          }
        ]
      },
      {
        label: '爱情片',
        checked: false,
        children: [
          {
            label: '泰坦尼克号',
            checked: false
          },
          {
            label: '罗密欧与朱丽叶',
            checked: false
          }
        ]
      }
    ]
  }
])
const updateChildCheck = (data) => {
  console.log('最新数据...', data)
}
</script>

<style scoped>

</style>