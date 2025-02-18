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
