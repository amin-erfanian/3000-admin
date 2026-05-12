<template>
  <div class="search">
    <!-- Input -->
    <BaseTextInput
      v-model="query"
      type="text"
      placeholder="جستجوی کالا"
      name="search"
      variant="outlined"
      prependIcon="search"
    />
  </div>
</template>

<script setup>
  import BaseTextInput from '../common/base/base-text-input.vue';

  const query = defineModel();
</script>

<style scoped>
  .search {
    width: 100%;
  }
</style>
