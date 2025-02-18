<template>
  <a :href="link.href" @click.prevent="navigate">
    <slot></slot>
  </a>
</template>

<script setup>
import { useLink } from 'vue-router'

const props = defineProps({
  to: {
    type: String,
    required: true
  }
})

const link = useLink({
  to: props.to
})

const navigate = () => {
  if (confirm('确定要跳转吗?')) {
    link.navigate()
  }
}

</script>