<template>
  <div class="picker" :style="{ height: `${height}px` }">
    <label class="picker__label" :style="{ height: `${itemHeight}px` }">
      {{ label }}
    </label>
    <div
      class="picker__scroll"
      :style="scrollPaddingStyle"
      ref="scrollArea"
      @scroll="onScroll"
    >
      <ul class="picker__items" :style="{ width: `${width}px` }">
        <li
          v-for="(item, index) in items"
          :key="index"
          class="picker__item"
          :class="{ active: index === selectedIndex }"
          :style="getItemStyle(index)"
        >
          <slot :name="`item-${index}`" :item="item">
            {{ item.label }}
          </slot>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, onMounted, nextTick, computed } from 'vue';

  const props = defineProps({
    items: Array,
    label: String,
    modelValue: Object,
    height: {
      type: Number,
      default: 150,
    },
    width: {
      type: Number,
      default: 180,
    },
  });

  const emit = defineEmits(['update:modelValue']);

  const scrollArea = ref(null);
  const selectedIndex = ref(0);
  const itemHeight = computed(() => Math.floor(props.height / 3));

  // Padding to center selected item
  const scrollPaddingStyle = computed(() => {
    const pad = Math.floor((props.height - itemHeight.value) / 2);
    return {
      paddingTop: `${pad}px`,
      paddingBottom: `${pad}px`,
    };
  });

  watch(selectedIndex, (newIndex) => {
    emit('update:modelValue', props.items[newIndex]);
    scrollToIndex(newIndex);
  });

  const initialIndex = computed(() =>
    props.items.findIndex((item) => item.value === props.modelValue.value),
  );

  watch(
    () => props.modelValue,
    (newVal) => {
      const index = props.items.findIndex(
        (item) => item.value === newVal.value,
      );
      if (index !== -1) {
        selectedIndex.value = index;
      }
    },
  );

  onMounted(() => {
    nextTick(() => {
      if (initialIndex.value !== -1) {
        selectedIndex.value = initialIndex.value;
      }

      scrollToIndex(selectedIndex.value, false);
    });
  });

  const scrollToIndex = (index, smooth = true) => {
    const scrollEl = scrollArea.value;
    if (!scrollEl) return;

    const top = index * itemHeight.value;
    scrollEl.scrollTo({
      top,
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  let scrollTimeout;
  const onScroll = () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      snapToNearest();
    }, 100);
  };

  const snapToNearest = () => {
    const scrollEl = scrollArea.value;
    const currentScroll = scrollEl.scrollTop;
    const nearestIndex = Math.round(currentScroll / itemHeight.value);
    selectedIndex.value = Math.min(
      Math.max(nearestIndex, 0),
      props.items.length - 1,
    );
  };

  const getItemStyle = (index) => {
    const diff = Math.abs(index - selectedIndex.value);
    const scale = index === selectedIndex.value ? 1 : 0.7;

    const opacity = index === selectedIndex.value ? 1 : 0.4;
    const blur = diff === 1 ? '2px' : '4px';

    return {
      height: `${itemHeight.value}px`,
      transform: `scale(${scale})`,
      opacity,
      // filter: `blur(${diff > 0 ? blur : '0'})`,
    };
  };
</script>

<style scoped lang="scss">
  .picker {
    position: relative;
    @include flex($align: center, $justify: flex-end);
    height: 200px;
    width: 100%;

    &__label {
      @include flex($align: center);
      @include typography(label-medium);
      position: absolute;
      top: 50%;
      transform: translate(0, -50%);
      left: 0;
      right: 0;
      bottom: 0;
      height: 50px;
      z-index: 1;
      padding: 0 space(4);
      border-radius: space(3);
      background-color: var(--palette-container-background);
    }

    &__scroll {
      z-index: 2;
      height: 100%;
      width: 100%;
      overflow-y: scroll;
      scroll-behavior: smooth;
      scroll-snap-type: y mandatory;
      -webkit-overflow-scrolling: touch;
      position: relative;
      @include hide-scrollbar();
    }

    &__items {
      padding: 0 space(4);
      @include flex($dir: column, $align: center, $justify: center);
      margin-right: auto;
    }

    &__item {
      @include flex($align: center, $justify: flex-end);
      transition: all 0.3s ease;
      font-size: 14px;
      transform-origin: center;
      scroll-snap-align: center;
    }
  }
</style>
