<template>
  <div
    class="swipe-container"
    @touchstart="startSwipe"
    @touchmove="swipe"
    @touchend="endSwipe"
  >
    <!-- Right to left Action -->
    <div
      v-if="rightDirection"
      v-show="isSwiping && translateX > 0"
      class="action left"
      :style="{ width: `${actionWidth}px`, background: rightActionBackground }"
    >
      <slot name="left-action"></slot>
    </div>

    <!-- Left to Right Action -->
    <div
      v-if="leftDirection"
      v-show="isSwiping && translateX < 0"
      class="action right"
      :style="{ width: `${actionWidth}px`, background: leftActionBackground }"
    >
      <slot name="right-action"></slot>
    </div>

    <!-- Content -->
    <div
      ref="contentRef"
      class="content"
      :style="{ transform: `translateX(${translateX}px)` }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';

  const props = defineProps({
    leftDirection: { type: Boolean, default: true },
    rightDirection: { type: Boolean, default: true },
    actionWidth: { type: Number, default: 100 }, // Width of the action area
    leftActionBackground: { type: String, default: '#f1414c' }, // Background color for left action
    rightActionBackground: { type: String, default: '#53c5d5' }, // Background color for right action
  });

  const emit = defineEmits(['swipe-left', 'swipe-right']);

  const contentRef = ref(null);

  const translateX = ref(0);
  const startX = ref(0);
  const startY = ref(0);
  const isSwiping = ref(false);

  const startSwipe = (event) => {
    startX.value = event.touches[0].clientX;
    startY.value = event.touches[0].clientY;
    isSwiping.value = true;
  };

  const swipe = (event) => {
    const currentX = event.touches[0].clientX;
    const currentY = event.touches[0].clientY;
    const deltaX = currentX - startX.value;
    const deltaY = currentY - startY.value;

    // Ignore vertical swipes (prevent scrolling)
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return; // Exit if the swipe is more vertical than horizontal
    }

    // Allow swipe only in the specified direction
    if (
      (props.leftDirection && deltaX < 0) ||
      props.rightDirection & (deltaX > 0)
    ) {
      // Cap the swipe distance to the action width

      // Allow swipe in both directions
      translateX.value = Math.max(
        -props.actionWidth, // Cap for left swipe
        Math.min(props.actionWidth, deltaX), // Cap for right swipe
      );
    }
  };

  const endSwipe = (e) => {
    // Trigger swipe action if the element is swiped fully to the action width
    if (translateX.value >= props.actionWidth) {
      emit('swipe-right', contentRef.value); // Swipe right action
    } else if (translateX.value <= -props.actionWidth) {
      emit('swipe-left', contentRef.value); // Swipe left action
    }

    // Reset the element position
    translateX.value = 0;
    isSwiping.value = false;
  };
</script>

<style scoped>
  .swipe-container {
    position: relative;
    overflow: hidden;
  }

  .content {
    position: relative; /* Ensure content is above the action */
    z-index: 1; /* Higher z-index to keep it above the action */
    transition: transform 0.2s ease;
    overflow: hidden;
  }

  .action {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100px; /* Default width, overridden by actionWidth prop */
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    border: none;
    outline: none;
    z-index: 0;
  }

  .action.left {
    left: 0;
  }

  .action.right {
    right: 0;
  }
</style>
