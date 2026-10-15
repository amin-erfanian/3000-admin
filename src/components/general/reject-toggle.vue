<template>
  <button
    type="button"
    class="reject-toggle"
    :class="{ 'reject-toggle--active': active }"
    :aria-pressed="active"
    :aria-label="active ? 'لغو رد' : 'رد این مورد'"
    @click="emit('toggle')"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 8l8 8M16 8l-8 8" />
    </svg>
  </button>
</template>

<script setup>
  defineProps({
    active: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['toggle']);
</script>

<style scoped lang="scss">
  .reject-toggle {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    padding: 0;
    border: 1.5px solid var(--palette-error);
    border-radius: 50%;
    background-color: transparent;
    color: var(--palette-error);
    cursor: pointer;
    transition: all 0.15s ease;
    @include flex($align: center, $justify: center);

    svg {
      width: 100%;
      height: 100%;
      fill: none;
      stroke: currentColor;
      stroke-width: 2.2;
      stroke-linecap: round;
    }

    &--active {
      background-color: var(--palette-error);
      color: #ffffff;
    }
  }
</style>
