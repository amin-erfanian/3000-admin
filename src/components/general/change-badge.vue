<template>
  <div
    class="change"
    :class="`change--${
      changeValue ? (changeValue < 0 ? 'minus' : 'plus') : 'none'
    }`"
  >
    <template v-if="changeValue && !isNaN(Math.abs(changeValue))">
      <div>%</div>
      <div> {{ Math.abs(changeValue) }} </div>
    </template>
    <template v-else> - </template>
  </div>
</template>

<script setup>
  const props = defineProps({
    changeValue: {
      type: Number,
      required: false,
    },
    size: {
      type: String,
      default: 'medium',
      validator: (v) => ['small', 'medium', 'large'].includes(v),
    },
  });
</script>

<style lang="scss">
  .change {
    @include flex($align: center);
    gap: 2px;
    padding: 2px space();
    @include typography(body-small);
    color: var(--palette-text-on-main-10);
    border-radius: space();

    &--minus {
      color: var(--palette-change-minus-color);
      background-color: var(--palette-change-minus-bg);
    }

    &--plus {
      color: var(--palette-change-plus-color);
      background-color: var(--palette-change-plus-bg);
    }

    &--none {
      background-color: var(--palette-border-10);
    }
  }
</style>
