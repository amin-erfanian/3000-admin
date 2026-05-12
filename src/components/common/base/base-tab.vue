<template>
  <div class="tab-components">
    <div
      class="tab-components__tabs"
      :style="tabStyleVariables"
      v-if="tabs.length > 1"
    >
      <span
        class="tab-components__tab"
        v-for="(tab, i) in tabs"
        @click="handleChangeTab(i)"
        :class="{ active: i === tabIndex }"
        :key="tab.key"
        :name="`tab_${tab.key}`"
      >
        {{ tab.title }}
      </span>
    </div>
    <div class="tab-components__content">
      <slot :name="`content`">
        <Transition name="fade" mode="out-in" appear>
          <div
            class="tab-components__content"
            v-html="tabs[tabIndex].description"
            :key="tabIndex"
          />
        </Transition>
      </slot>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    tabs: {
      type: Array,
      default: () => [],
    },
  });

  const tabIndex = defineModel({ default: 0 });

  const tabStyleVariables = computed(
    () => `--tab-size: ${props.tabs.length}; --tab-index: ${tabIndex.value};`,
  );

  const handleChangeTab = (newTabIndex) => {
    tabIndex.value = newTabIndex;
  };
</script>

<style lang="scss" scoped>
  .tab-components {
    width: 100%;
    &__tabs {
      position: relative;
      margin: 0 auto;
      min-height: 32px;
      border-radius: space(2);
      background-color: var(--palette-text-on-minor-40);
      @include flex($align: center);
      overflow: hidden;

      &::before {
        content: '';
        display: inline-block;
        position: absolute;
        background-color: var(--palette-secondary);
        color: var(--palette-text-on-minor-10);
        height: calc(100%);
        border-radius: space(2);

        width: calc((100% / var(--tab-size)));
        right: calc((100% / var(--tab-size)) * var(--tab-index));
        transition: right 0.3s ease-in-out;
      }
    }

    &__tab {
      flex: 1;
      text-align: center;
      cursor: pointer;
      z-index: 1;
      font-size: 14px;
      font-weight: 500;
      line-height: 2;
      text-align: center;
      color: var(--palette-text-on-main-10);
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      transition: 0.3s ease-in-out;

      &.active {
        color: #ffffff;
      }
    }

    &__content {
      font-size: 15px;
      font-weight: 500;
      line-height: 2;
      color: var(--palette-text-on-main-10);
      white-space: pre-wrap;
      // height: 100%;
      width: 100%;
    }
  }
</style>
