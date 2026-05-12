<template>
  <div
    class="skeleton-loading"
    :class="[skeletonAnimation]"
    :style="[skeletonBorder, skeletonBaseStyles]"
  ></div>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    width: {
      type: String,
      default: '150px',
    },
    height: {
      type: String,
      default: '50px',
    },
    size: {
      type: String,
      default: '50px',
    },
    isCircle: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '#d8d8d8',
    },
    radius: {
      type: String,
      default: '5px',
    },
    animation: {
      type: String,
      default: 'wave',
      validator: (value) => ['wave', 'blink', 'pulse'].includes(value),
    },
  });

  const skeletonBorder = computed(() => (props.radius ? { borderRadius: props.radius } : ''));

  const skeletonBaseStyles = computed(() => {
    return props.isCircle
      ? { borderRadius: '50px', width: props.size, height: props.size }
      : { width: props.width, height: props.height };
  });

  const skeletonAnimation = computed(() => `animation-${props.animation}`);
</script>

<style scoped lang="scss">
  .skeleton-loading {
    background-color: v-bind(color);
  }

  .animation-wave {
    background: linear-gradient(90deg, v-bind(color) 25%, #d2d2d2 50%, v-bind(color) 63%);
    background-size: 200% 100%;
    animation: loading-wave 1.5s infinite;
  }

  .animation-blink {
    animation: loading-blink 3s infinite;
  }

  .animation-pulse {
    animation: loading-pulse 1.5s infinite;
  }

  @keyframes loading-wave {
    0% {
      background-position: 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  @keyframes loading-blink {
    0%,
    50%,
    100% {
      opacity: 1;
    }
    25%,
    75% {
      opacity: 0.2;
    }
  }

  @keyframes loading-pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }
</style>
