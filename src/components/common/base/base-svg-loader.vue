<template>
  <component :is="icon" />
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  path: {
    type: String,
    default: './icons'
  }
})

const icon = defineAsyncComponent(() => import(`${props.path}/${props.name}.icon.vue`))
</script>
