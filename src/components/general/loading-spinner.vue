<template>
  <div v-if="selectedSpinner.className" class="spinner" :class="spinnerClassModifier">
    <div v-for="index in selectedSpinner.spinnersNumber" :key="index" class="spinner__dot"></div>
  </div>
</template>

<script setup>
  import { reactive, computed } from 'vue';

  const props = defineProps({
    name: {
      type: String,
      default: 'three-bounce',
      validator: (value) => ['pulse', 'three-bounce', 'dual-ring'].includes(value),
    },
    animationDuration: {
      type: String,
      default: 'full',
      validator: (value) => ['full', 'half', 'quarter'].includes(value),
    },
  });

  const AllSpinners = reactive({
    'three-bounce': { className: 'spinner--three-bounce', spinnersNumber: 3 },
    pulse: { className: 'spinner--pulse', spinnersNumber: 1 },
    'dual-ring': { className: 'spinner--dual-ring', spinnersNumber: 0 },
  });

  const selectedSpinner = computed(() => AllSpinners[props.name]);

  const spinnerClassModifier = computed(() => [
    {
      'spinner--fade-in': props.animationDuration === 'full',
      'spinner--fade-in-half-second': props.animationDuration === 'half',
      'spinner--fade-in-quarter-second': props.animationDuration === 'quarter',
    },
    selectedSpinner.value.className,
  ]);
</script>

<style lang="scss" scoped>
  .spinner {
    color: var(--palette-primary);

    &__dot {
      width: 18px;
      height: 18px;
      color: var(--loading-color);
      width: var(--loading-size);
      height: var(--loading-size);
      background-color: currentColor;
    }

    &--fade-in {
      animation: spinner-fade-in 2s;
    }

    &--fade-in-half-second {
      animation: spinner-fade-in 1s;
    }

    &--fade-in-quarter-second {
      animation: spinner-fade-in 0.5s;
    }

    /* pulse spinner */
    &--pulse &__dot {
      border-radius: 100%;
      animation: spinner-scale-out 1s infinite ease-in-out;
    }

    /* three bounce spinner */
    &--three-bounce {
      height: 18px;
    }

    &--three-bounce &__dot {
      border-radius: 100%;
      display: inline-block;
      animation: spinner-bounce-delay 1.4s infinite ease-in-out;
      animation-fill-mode: both;
    }

    &--three-bounce &__dot:first-child {
      animation-delay: -0.32s;
    }

    &--three-bounce &__dot::nth-child(2) {
      animation-delay: -0.16s;
    }

    /* dual ring spinner */
    &--dual-ring {
      display: inline-block;
      color: var(--loading-color);
    }

    &--dual-ring:after {
      content: ' ';
      display: block;
      width: 27px;
      height: 27px;
      margin: 1px;
      border-radius: 50%;
      border: 5px solid currentColor;
      border-color: currentColor transparent currentColor transparent;
      animation: spinner-dual-ring 1.2s linear infinite;
    }
  }

  @keyframes spinner-fade-in {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes spinner-scale-out {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }

  @keyframes spinner-bounce-delay {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }

  @keyframes spinner-dual-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
