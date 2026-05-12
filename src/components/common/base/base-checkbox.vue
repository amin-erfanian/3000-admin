<template>
  <div class="check-box">
    <input
      class="check-box__icon"
      type="checkbox"
      :value="value"
      v-model="options"
      :name="name"
      :id="name"
    />
    <label :for="name" class="check-box__text">
      <slot />
    </label>
  </div>
</template>

<script setup>
  const props = defineProps({
    value: {
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  });

  const options = defineModel();
</script>

<style scoped lang="scss">
  $size: 1.4rem;
  $animation-duration: 0.5s;

  .check-box {
    gap: space(2);
    @include flex(row, nowrap, center);

    &__text {
      @include typography(body-medium);
      color: var(--palette-text-on-main-20);
      cursor: pointer;
      white-space: nowrap;
    }

    &__icon {
      @include flex(row, nowrap, center, center);
      width: $size;
      height: $size;
      cursor: pointer;
      accent-color: var(--palette-secondary);
    }
  }

  // @keyframes slide-show {
  //   from {
  //     clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
  //   }

  //   to {
  //     clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  //   }
  // }
</style>
