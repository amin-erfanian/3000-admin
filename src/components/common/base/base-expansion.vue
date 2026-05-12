<template>
  <div class="expansion">
    <div
      v-if="$slots['content-above']"
      class="expansion__content"
      ref="content"
      :style="{ height: isExpanded ? `${contentHeight}px` : '0px' }"
    >
      <div ref="box" class="expansion__box">
        <slot name="content-above" />
      </div>
    </div>
    <div class="expansion__header" @click="toggleExpansionPanel">
      <slot />
    </div>
    <div
      v-if="$slots['content-below']"
      class="expansion__content"
      ref="content"
      :style="{ height: isExpanded ? `${contentHeight}px` : '0px' }"
    >
      <div ref="box" class="expansion__box">
        <slot name="content-below" />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, nextTick } from 'vue';
  const isExpanded = defineModel({ default: false });

  const props = defineProps({
    defaultExpansion: {
      type: Boolean,
      default: true,
    },
  });

  const content = ref(null);
  const contentHeight = ref(0);

  const box = ref(null);

  const calculateContentHeight = () => {
    if (content.value) {
      contentHeight.value = box.value.scrollHeight;
    }
  };

  const toggleExpansionPanel = async () => {
    if (props.defaultExpansion) {
      isExpanded.value = !isExpanded.value;
    }
    await nextTick();
    calculateContentHeight();
  };

  onMounted(() => {
    calculateContentHeight();

    const boxObserver = new MutationObserver(calculateContentHeight);
    if (box.value) {
      boxObserver.observe(box.value, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => {
      observer.disconnect();
      boxObserver.disconnect();
    };
  });
</script>

<style lang="scss" scoped>
  .expansion {
    width: 100%;
    padding: 0;
    margin: 0;
    border: none;
    background: transparent;

    &__header {
      width: 100%;
      cursor: pointer;
    }

    &__content {
      overflow: hidden;
      transition: height 0.3s ease, opacity 0.3s ease;
      height: 0;
    }
  }
</style>
