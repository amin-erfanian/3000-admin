<template>
  <div class="carousel">
    <div
      @mousedown="startDrag"
      @touchstart="startDrag"
      class="carousel__container"
    >
      <div class="carousel__slider" ref="carouselRef" :style="carouselStyle">
        <div class="carousel__item" v-for="(item, index) in items" :key="index">
          <slot :item="item"></slot>
        </div>
        <div class="carousel__item">
          <slot name="add-item" />
        </div>
      </div>
    </div>

    <div v-if="showDots" class="carousel__dots">
      <div
        class="carousel__single-dot"
        :class="[
          state.currentIndex + 1 === dot && `carousel__single-dot--active`,
        ]"
        v-for="dot in dotsLength"
        :key="dot"
      ></div>
    </div>
  </div>
</template>

<script setup>
  import {
    ref,
    reactive,
    computed,
    onMounted,
    onBeforeUnmount,
    watch,
  } from 'vue';

  const props = defineProps({
    items: {
      type: Array,
      required: true,
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
    interval: {
      type: Number,
      default: 3000,
    },
    showPerSlide: {
      type: Number,
      default: 2,
    },
    slidingCount: {
      type: Number,
      default: 1,
    },
    showDots: {
      type: Boolean,
      default: true,
    },
    space: {
      type: String,
      default: 'medium',
      validator: (v) => ['large', 'medium', 'small'].includes(v),
    },
  });

  const showPerSlide = ref(props.showPerSlide);
  const slidingCount = ref(props.slidingCount);
  const carouselRef = ref(null);
  const state = reactive({
    currentIndex: 0,
    timer: null,
    isDragging: false,
    startPosition: 0,
    currentTranslate: 0,
    previousTranslate: 0,
    animationID: 0,
    isTransitioning: false,
  });

  const slideItemsCount = computed(
    () => showPerSlide.value / slidingCount.value,
  );

  const dotsLength = computed(() =>
    Math.ceil(props.items.length / slidingCount.value),
  );

  const carouselStyle = computed(() => ({
    transform: `translateX(${state.currentTranslate}px)`,
    transition: state.isTransitioning ? 'transform 0.5s ease' : 'none',
  }));

  const updateTranslateState = () => {
    const slideWidth =
      carouselRef.value.clientWidth / slideItemsCount.value +
      12 / slideItemsCount.value;
    state.currentTranslate = state.currentIndex * slideWidth;
    state.previousTranslate = state.currentTranslate;
  };

  const nextSlide = () => {
    const totalSlides = Math.ceil(props.items.length / slidingCount.value);
    if (state.isTransitioning) return;

    state.isTransitioning = true;

    if (state.currentIndex < totalSlides - 1) {
      state.currentIndex++;
    }

    updateTranslateState();
    setTimeout(() => {
      state.isTransitioning = false;
    }, 500);
  };

  const prevSlide = () => {
    const totalSlides = Math.ceil(props.items.length / slidingCount.value);
    if (state.isTransitioning) return;

    state.isTransitioning = true;

    if (state.currentIndex > 0) {
      state.currentIndex--;
    }

    updateTranslateState();
    setTimeout(() => {
      state.isTransitioning = false;
    }, 500);
  };

  const startDrag = (event) => {
    state.isDragging = true;
    state.startPosition = getPositionX(event);
    state.previousTranslate = state.currentTranslate;
    cancelAnimationFrame(state.animationID);
    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('mouseleave', endDrag);
    window.addEventListener('touchmove', drag);
    window.addEventListener('touchend', endDrag);
  };

  const drag = (event) => {
    if (!state.isDragging) return;
    const currentPosition = getPositionX(event);
    state.currentTranslate =
      state.previousTranslate + (currentPosition - state.startPosition);
  };

  const endDrag = () => {
    state.isDragging = false;
    const movedBy = state.currentTranslate - state.previousTranslate;

    const slideWidth = carouselRef.value.clientWidth / slideItemsCount.value;

    if (movedBy < -slideWidth / 2) prevSlide();
    if (movedBy > slideWidth / 2) nextSlide();

    updateTranslateState();

    window.removeEventListener('mousemove', drag);
    window.removeEventListener('mouseup', endDrag);
    window.removeEventListener('mouseleave', endDrag);
    window.removeEventListener('touchmove', drag);
    window.removeEventListener('touchend', endDrag);
  };

  const getPositionX = (event) => {
    return event.type.includes('mouse')
      ? event.pageX
      : event.touches[0].clientX;
  };

  const startAutoplay = () => {
    if (props.autoplay) {
      state.timer = setInterval(() => {
        nextSlide();
      }, props.interval);
    }
  };

  const stopAutoplay = () => {
    clearInterval(state.timer);
    state.timer = null;
  };

  onMounted(() => {
    startAutoplay();
    updateTranslateState();
    window.addEventListener('resize', updateTranslateState);
  });

  onBeforeUnmount(() => {
    stopAutoplay();
    window.removeEventListener('resize', updateTranslateState);
  });

  watch(() => props.items, updateTranslateState);
</script>

<style lang="scss" scoped>
  .carousel {
    box-sizing: border-box;
    direction: rtl;
    position: relative;
    width: calc(100%);
    margin: 0 auto;
    touch-action: pan-y;

    &__container {
      cursor: grab;
      width: 100%;
      padding: 0 space(2);
    }

    &__slider {
      @include flex($justify: space-between);
      width: 100%;
      transition: transform 0.5s ease;
      gap: space(3);
    }

    &__item {
      width: calc(
        (100% / v-bind(showPerSlide)) -
          (12px * (v-bind(showPerSlide) - 1) / v-bind(showPerSlide))
      );
      flex-grow: 1;
      flex-shrink: 0;
    }

    &__dots {
      @include flex($justify: center, $align: center);
      position: absolute;
      bottom: 5px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      gap: space(1.5);
    }

    &__single-dot {
      width: 4px;
      height: 4px;
      background-color: rgba(var(--palette-container-background-rgb), 0.5);
      border-radius: $circle;

      &--active {
        background-color: var(--palette-container-background);
      }
    }
  }
</style>
