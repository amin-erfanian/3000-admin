<template>
  <div class="product-media-slider" dir="rtl">
    <div v-if="normalizedMedia.length" class="product-media-slider__content">
      <div class="product-media-slider__main-wrap">
        <div
          class="product-media-slider__nav product-media-slider__nav--next"
          @click="nextItem"
        >
          <BaseIcon
            iconName="arrow-left"
            class="product-media-slider__nav-icon"
          />
        </div>

        <button
          class="product-media-slider__main"
          type="button"
          @click="openCurrent"
        >
          {{}}
          <img
            :src="normalizedMedia[currentIndex].src"
            :alt="normalizedMedia[currentIndex].title"
          />

          <span
            v-if="normalizedMedia[currentIndex].type === 'video'"
            class="product-media-slider__play"
          >
            ▶
          </span>
        </button>

        <div
          class="product-media-slider__nav product-media-slider__nav--prev"
          @click="prevItem"
        >
          <BaseIcon
            iconName="arrow-left"
            class="product-media-slider__nav-icon product-media-slider__nav-icon--prev"
          />
        </div>
      </div>

      <div class="product-media-slider__thumbs">
        <button
          v-for="(item, index) in normalizedMedia"
          :key="`${item.src}-${index}`"
          class="product-media-slider__thumb"
          :class="{
            'product-media-slider__thumb--active': index === currentIndex,
          }"
          type="button"
          @click="goTo(index)"
        >
          <img :src="item.src" :alt="item.title" />
          <span
            v-if="item.type === 'video'"
            class="product-media-slider__play product-media-slider__play--thumb"
          >
            ▶
          </span>
        </button>
      </div>
    </div>

    <span v-else class="product-media-slider__empty">—</span>

    <BaseModal
      v-model="showLightbox"
      title="رسانه‌های کالا"
      width="92vw"
      height="auto"
    >
      <div class="product-media-slider__lightbox" dir="rtl">
        <div class="product-media-slider__lightbox-main-wrap">
          <div
            class="product-media-slider__nav product-media-slider__nav--next"
            @click="nextItem"
          >
            <BaseIcon
              iconName="arrow-left"
              class="product-media-slider__nav-icon"
            />
          </div>

          <div class="product-media-slider__lightbox-main">
            <img
              v-if="normalizedMedia[currentIndex]?.type === 'image'"
              :src="normalizedMedia[currentIndex]?.src"
              :alt="normalizedMedia[currentIndex]?.title"
            />

            <video
              v-else
              controls
              autoplay
              playsinline
              :src="normalizedMedia[currentIndex]?.src"
            ></video>
          </div>

          <div
            class="product-media-slider__nav product-media-slider__nav--prev"
            @click="prevItem"
          >
            <BaseIcon
              iconName="arrow-left"
              class="product-media-slider__nav-icon product-media-slider__nav-icon--prev"
            />
          </div>
        </div>

        <div
          class="product-media-slider__thumbs product-media-slider__thumbs--lightbox"
        >
          <button
            v-for="(item, index) in normalizedMedia"
            :key="`${item.src}-lightbox-${index}`"
            class="product-media-slider__thumb"
            :class="{
              'product-media-slider__thumb--active': index === currentIndex,
            }"
            type="button"
            @click="goTo(index)"
          >
            <img :src="item.src" :alt="item.title" />
            <span
              v-if="item.type === 'video'"
              class="product-media-slider__play product-media-slider__play--thumb"
            >
              ▶
            </span>
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
  import { computed, ref, watch } from 'vue';

  import BaseModal from '@/components/common/base/base-modal.vue';
  import BaseIcon from '../common/base/base-icon.vue';

  const props = defineProps({
    mediaItems: {
      type: Array,
      default: () => [],
    },
  });

  const currentIndex = ref(0);
  const showLightbox = ref(false);

  const normalizedMedia = computed(() => {
    return props.mediaItems;
  });

  const nextItem = () => {
    if (!normalizedMedia.value.length) return;

    currentIndex.value =
      (currentIndex.value + 1) % normalizedMedia.value.length;
  };

  const prevItem = () => {
    if (!normalizedMedia.value.length) return;

    currentIndex.value =
      (currentIndex.value - 1 + normalizedMedia.value.length) %
      normalizedMedia.value.length;
  };

  const goTo = (index) => {
    currentIndex.value = index;
  };

  const openCurrent = () => {
    showLightbox.value = true;
  };

  watch(
    () => normalizedMedia.value.length,
    (length) => {
      if (!length) {
        currentIndex.value = 0;
        showLightbox.value = false;
        return;
      }

      if (currentIndex.value > length - 1) {
        currentIndex.value = 0;
      }
    },
    { immediate: true },
  );
</script>

<style scoped lang="scss">
  .product-media-slider {
    width: 100%;

    &__content {
      @include flex(column);
      gap: space(2);
    }

    &__main-wrap {
      position: relative;
      width: 100%;
      max-width: 280px;
      margin: 0 auto;
    }

    &__main {
      position: relative;
      width: 100%;
      height: 180px;
      border: 1px solid var(--palette-border-10);
      border-radius: $radius-2x;
      background: rgba(var(--palette-background-rgb), 0.5);
      overflow: hidden;
      cursor: pointer;
      padding: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    &__play {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 48px;
      height: 48px;
      border-radius: $circle;
      background: rgba(0, 0, 0, 0.55);
      color: #fff;
      font-size: 22px;
      @include flex($justify: center, $align: center);
      pointer-events: none;

      &--thumb {
        width: 20px;
        height: 20px;
        font-size: 10px;
      }
    }

    &__nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      border: none;
      width: 28px;
      height: 28px;
      border-radius: $circle;
      cursor: pointer;
      color: #fff;
      background: rgba(0, 0, 0, 0.45);
      @include flex($justify: center, $align: center);
      flex-shrink: 0;
      z-index: 3;

      &--next {
        left: 8px;
      }

      &--prev {
        right: 8px;
      }
    }

    &__nav-icon {
      width: 22px;
      height: 22px;

      &--prev {
        transform: scaleX(-1);
      }
    }

    &__thumbs {
      width: 100%;
      overflow-x: auto;
      padding-bottom: 2px;
      @include flex($align: center, $justify: flex-start);
      gap: space(1);
    }

    &__thumb {
      position: relative;
      width: 54px;
      min-width: 54px;
      height: 54px;
      border: 1px solid var(--palette-border-10);
      border-radius: $radius-1x;
      overflow: hidden;
      cursor: pointer;
      padding: 0;
      background: transparent;

      &--active {
        border-color: var(--palette-primary);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    &__empty {
      color: var(--palette-text-on-main-40);
    }

    &__lightbox {
      @include flex(column);
      gap: space(3);
    }

    &__lightbox-main-wrap {
      position: relative;
      width: 100%;
      min-height: 360px;
      @include flex($justify: center, $align: center);
    }

    &__lightbox-main {
      width: 100%;
      min-height: 360px;
      max-height: 68vh;
      border: 1px solid var(--palette-border-10);
      border-radius: $radius-2x;
      overflow: hidden;
      background: rgba(0, 0, 0, 0.06);

      img,
      video {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    &__thumbs--lightbox {
      @include flex($justify: center, $align: center);
    }
  }
</style>
