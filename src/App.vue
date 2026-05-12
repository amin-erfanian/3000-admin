<template>
  <div class="app-wrapper">
    <div class="scroll-container">
      <layout-view>
        <router-view v-slot="{ Component }">
          <transition
            :name="transitionName"
            :leave-from-class="onLeaveClasses.from"
            :leave-active-class="onLeaveClasses.active"
            :leave-to-class="onLeaveClasses.to"
          >
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </router-view>
      </layout-view>
    </div>
  </div>
</template>

<script setup>
  import LayoutView from '@/layout/layout-view.vue';
  import { ref, computed } from 'vue';
  import { useRoute } from 'vue-router';
  const route = useRoute();

  const currentTransitionName = ref('');
  const transitionName = computed(() => route.meta?.transition || 'fade');
  const onLeaveClasses = computed(() => ({
    from: `${currentTransitionName.value}-leave-from`,
    active: `${currentTransitionName.value}-leave-active`,
    to: `${currentTransitionName.value}-leave-to`,
  }));
</script>

<style lang="scss">
  // FIXME: remove this style tag
</style>

<style scoped lang="scss">
  .app-wrapper {
    height: 100vh; /* Locks to visible viewport */
    display: flex;
    flex-direction: column;
  }

  .scroll-container {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch; /* for smooth scrolling on iOS */
  }

  /* Fade Transition */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-leave-to,
  .fade-enter-from {
    opacity: 0;
  }

  /* Slide-Up Transition */
  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: all 0.3s cubic-bezier(0.54, 0.35, 0.29, 0.99);
  }

  .slide-up-enter-from {
    transform: translateY(100%);
  }

  .slide-up-leave-to {
    transform: translateY(100%);
  }
</style>
