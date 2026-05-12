<template>
  <div class="label">
    <span class="label__text"> {{ label }} </span>
    <span v-if="required" class="label__star"> * </span>
  </div>
</template>

<script setup>
  const props = defineProps({
    label: {
      type: String,
      default: '',
    },
    required: {
      type: Boolean,
      default: false,
    },
  });
</script>

<style lang="scss" scoped>
  .label {
    @include flex($align: center);
    gap: space(2);

    &__text {
      @include typography(body-medium);
      color: var(--palette-text-on-main-10);
    }

    &__star {
      @include typography(body-medium);
      color: var(--palette-error);
    }
  }
</style>
