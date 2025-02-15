<template>
  <div>
    <input type="text" v-focus>

    <div>
      <button v-permission="['write']">编辑</button>
      <button v-permission="['delete']">删除</button>
      <button v-permission="['admin']">管理</button>
    </div>

    <div>
      <p v-time="Date.now()"></p>
      <p v-time="1717372800000"></p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
const vFocus = {
  mounted: (el) => {
    el.focus()
  }
}


// export default {
//   directives: {
//     focus: {
//       mounted: (el) => el.focus()
//     }
//   }
// }
</script>

<style lang="scss" scoped>

</style>