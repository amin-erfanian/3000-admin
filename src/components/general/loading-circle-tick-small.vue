<template>
  <div ref="circle" class="loading-spinner" :class="spinnerClass">
    <svg class="loading-spinner__circle" view-box="0 0 16 16">
      <circle
        class="loading-spinner__path"
        cx="10"
        cy="10"
        r="8"
        fill="none"
        stroke-width="1"
      ></circle>
    </svg>
    <div class="loading-spinner__checkmark"></div>
  </div>
</template>

<script setup>
  import { ref, watch, computed } from 'vue';

  const props = defineProps({
    isLoading: {
      type: Boolean,
      default: true,
    },
    isLoadingComplete: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '#fafafa',
    },
  });

  const circle = ref(null);
  const dashArray = ref(20);

  function animateCircle() {
    let progress = 0;
    const duration = 2100;
    const startTime = performance.now();

    function animate() {
      const currentTime = performance.now();
      const timePassed = currentTime - startTime;

      // if (circle.value.classList.contains('loading-spinner--spinning')) {
      //   circle.value.classList.remove('loading-spinner--spinning');
      // }

      progress = Math.min(timePassed / duration, 1);
      dashArray.value = 20 + progress * 105;
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }

  watch(
    () => props.isLoadingComplete,
    (value) => {
      if (value) animateCircle();
    },
  );

  // Spinner class based on states
  const spinnerClass = computed(() => ({
    'loading-spinner--spinning': props.isLoading && !props.isLoadingComplete,
    'loading-spinner--fulfilled': props.isLoadingComplete,
  }));
</script>

<style lang="scss" scoped>
  .loading-spinner {
    position: relative;
    $loading-color: v-bind(color);
    display: inline-block;
    width: 20px;
    height: 20px;
    // border: 1px solid red;

    &__circle {
      // border: 1px solid blue;
      width: 100%;
      height: 100%;
      animation: rotate 1s linear infinite;
    }

    // &--fulfilled &__circle {
    //   animation: none;
    // }

    &__path {
      stroke: $loading-color;
      stroke-linecap: round;
      stroke-dashoffset: 0;
      stroke-dasharray: v-bind(dashArray), 150;
    }

    @keyframes rotate {
      100% {
        transform: rotate(360deg);
      }
    }

    // @keyframes dash {
    //   0% {
    //     stroke-dasharray: 1, 150;
    //     stroke-dashoffset: 0;
    //   }
    //   50% {
    //     stroke-dasharray: 90, 150;
    //     stroke-dashoffset: -35;
    //   }
    //   100% {
    //     stroke-dasharray: 90, 150;
    //     stroke-dashoffset: -125;
    //   }
    // }

    &--fulfilled &__checkmark {
      display: block;
    }

    &__checkmark {
      display: none;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translateX(calc(-50% - 4.5px)) translateY(1px);

      &:after {
        opacity: 0;
        height: 7px;
        width: 3px;
        transform-origin: left top;
        border-right: 1.5px solid $loading-color;
        border-top: 1.5px solid $loading-color;
        position: absolute;
        left: 50%;
        content: '';
        transform: scaleX(-1) rotate(135deg);
        animation: checkmark 500ms ease-in-out forwards;
        animation-delay: 200ms;
      }

      @keyframes checkmark {
        0% {
          height: 0;
          width: 0;
          opacity: 1;
        }
        40% {
          height: 0;
          width: 3px;
          opacity: 1;
        }
        100% {
          height: 7px;
          width: 3px;
          opacity: 1;
        }
      }
    }
  }
</style>
