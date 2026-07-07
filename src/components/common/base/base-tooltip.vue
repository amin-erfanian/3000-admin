<template>
  <div
    ref="trigger"
    class="tooltip"
    @mouseenter="show"
    @mouseleave="hide"
    @click="handleClick"
    @touchstart.prevent="handleClick"
    tabindex="0"
    @blur="hide"
  >
    <slot></slot>

    <teleport to="body">
      <div
        v-if="visible"
        ref="tooltip"
        class="tooltip__popup"
        :class="`tooltip__popup--${position}`"
        :style="popupStyle"
      >
        {{ props.text }}
      </div>
    </teleport>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, nextTick } from 'vue';

  const props = defineProps({
    text: {
      type: String,
      required: true,
    },
  });

  const visible = ref(false);
  const position = ref('top');
  const popupStyle = ref({});

  const trigger = ref(null);
  const tooltip = ref(null);

  const margin = 8;

  const show = async () => {
    visible.value = true;
    await nextTick();
    setPosition();
  };

  const hide = () => {
    visible.value = false;
  };
  const isTouch = ref(false);

  const handleClick = async () => {
    // On first click/touch, show the tooltip
    if (!visible.value) {
      isTouch.value = true;
      await show();

      // Close tooltip if clicking outside
      document.addEventListener('click', onOutsideClick);
    }
  };

  const onOutsideClick = (e) => {
    if (
      !trigger.value?.contains(e.target) &&
      !tooltip.value?.contains(e.target)
    ) {
      hide();
      document.removeEventListener('click', onOutsideClick);
    }
  };

  // Clamp helper
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  const setPosition = () => {
    const triggerEl = trigger.value;
    const tooltipEl = tooltip.value;

    if (!triggerEl || !tooltipEl) return;

    const triggerRect = triggerEl.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const fitsTop = triggerRect.top >= tooltipRect.height + margin;
    const fitsBottom =
      viewportHeight - triggerRect.bottom >= tooltipRect.height + margin;
    const fitsLeft = triggerRect.left >= tooltipRect.width + margin;
    const fitsRight =
      viewportWidth - triggerRect.right >= tooltipRect.width + margin;

    const safeMargin = 8;

    let left = 0;
    let top = 0;

    if (fitsTop) {
      position.value = 'top';
      left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      top = triggerRect.top - tooltipRect.height - margin;

      popupStyle.value = {
        left: `${clamp(
          left,
          safeMargin,
          viewportWidth - tooltipRect.width - safeMargin,
        )}px`,
        top: `${top}px`,
        transform: 'none',
      };
    } else if (fitsBottom) {
      position.value = 'bottom';
      left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      top = triggerRect.bottom + margin;

      popupStyle.value = {
        left: `${clamp(
          left,
          safeMargin,
          viewportWidth - tooltipRect.width - safeMargin,
        )}px`,
        top: `${top}px`,
        transform: 'none',
      };
    } else if (fitsRight) {
      position.value = 'right';
      left = triggerRect.right + margin;
      top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;

      popupStyle.value = {
        left: `${left}px`,
        top: `${clamp(
          top,
          safeMargin,
          viewportHeight - tooltipRect.height - safeMargin,
        )}px`,
        transform: 'none',
      };
    } else if (fitsLeft) {
      position.value = 'left';
      left = triggerRect.left - tooltipRect.width - margin;
      top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;

      popupStyle.value = {
        left: `${left}px`,
        top: `${clamp(
          top,
          safeMargin,
          viewportHeight - tooltipRect.height - safeMargin,
        )}px`,
        transform: 'none',
      };
    } else {
      // fallback top
      position.value = 'top';
      left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      top = triggerRect.top - tooltipRect.height - margin;

      popupStyle.value = {
        left: `${clamp(
          left,
          safeMargin,
          viewportWidth - tooltipRect.width - safeMargin,
        )}px`,
        top: `${top}px`,
        transform: 'none',
      };
    }
  };

  const onResize = () => {
    if (visible.value) setPosition();
  };

  onMounted(() => {
    window.addEventListener('resize', onResize);
  });
  onUnmounted(() => {
    window.removeEventListener('resize', onResize);
  });
</script>

<style lang="scss">
  .tooltip {
    display: inline-block;
    position: relative;

    &__popup {
      position: fixed;
      background-color: #333;
      color: #fff;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
      white-space: nowrap;
      z-index: 10000;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }
  }
</style>
