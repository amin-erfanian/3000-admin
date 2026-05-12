<template>
  <div
    class="skeleton"
    :style="{
      width: fullWidth ? '100%' : width,
      height: height,
      borderRadius: radius,
    }"
  ></div>
</template>

<script>
  export default {
    props: {
      width: {
        type: String,
        default: '100px',
      },
      height: {
        type: String,
        default: '16px',
      },
      radius: {
        type: String,
        default: '8px',
      },
      fullWidth: {
        type: Boolean,
        default: false,
      },
    },
  };
</script>

<style scoped>
  .skeleton {
    background-color: var(--palette-skeleton-container);
    display: inline-block; /* Allows width to respect content flow */
    position: relative;
    overflow: hidden;
  }

  /* Optional: Shimmer Animation */
  .skeleton::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent,
      var(--palette-container-background),
      transparent
    );
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
</style>
