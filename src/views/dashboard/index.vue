<template>
  <div class="dashboard scrollable">
    <div class="dashboard__view">
      <div class="dashboard__header">
        <div class="dashboard__header-actions">
          <div @click="goToResources" class="dashboard__header-right">
            <span class="dashboard__header-resource-manage">
              مدیریت منابع مالی
            </span>
          </div>
          <div class="dashboard__header-left">
            <base-icon
              class="dashboard__header-icon settings"
              icon-name="settings"
              path="/tools"
              @click="goToSettings"
            />
            <base-icon
              class="dashboard__header-icon"
              :icon-name="isLoggedIn ? 'user' : 'no-user'"
              @click="goToProfile"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import BaseIcon from '@/components/common/base/base-icon.vue';

  import { useRouter } from 'vue-router';
  const router = useRouter();

  const goToProfile = () => {
    router.push({ name: 'tools', query: { currentPage: 'profile' } });
  };

  const goToSettings = () => {
    router.push({
      path: '/dashboard-settings',
    });
  };
</script>

<style scoped lang="scss">
  .dashboard {
    @include hide-scrollbar();
    position: relative;
    overflow-y: auto;
    width: 100%;
    height: 100%;

    &__view {
      @include flex($dir: column);
      @include hide-scrollbar();
      overflow-y: auto;
      height: 100%;
      width: 100%;
    }

    &__header {
      overflow: hidden;
      min-height: 250px;
      padding: space(5);
      z-index: 1;
      width: 100%;
      margin-bottom: -48px;
      background-color: var(--palette-primary);
    }

    &__header-actions {
      @include flex($align: center, $justify: space-between);
      margin-bottom: space(5);
    }

    &__header-left {
      @include flex($align: center, $justify: flex-end);
      gap: space(3);
      flex-grow: 1;
    }

    &__header-right {
      @include flex($align: center);
    }

    &__header-resource-manage {
      @include typography(body-small);
      font-weight: 600;
      background-color: rgba(var(--palette-container-background-rgb), 0.2);
      color: #fafafa;
      padding: space(1) space(2);
      border-radius: space(2);
      cursor: pointer;
    }

    &__header-icon {
      color: #fafafa;
      cursor: pointer;
      width: 18px;
      height: 18px;

      &.settings {
        width: 22px;
        height: 22px;
      }
    }

    &__content {
      z-index: 2;
      width: 100%;
      @include flex($dir: column);
      gap: space(2);
      padding: 0 space(5);
      margin-bottom: 20px;
    }

    &__no-resource {
      @include flex($dir: column);
      gap: space(2);
      margin-top: space(10);
      padding: space(5);
      text-align: justify;
      color: var(--palette-text-on-main-20);
      @include typography(body-medium);

      &-add {
        // position: relative;
        top: 3px;
        width: 10px;
        height: 10px;
        color: var(--palette-primary);
      }

      .bold {
        color: var(--palette-text-on-main-10);
        font-weight: 700;
      }
    }

    &__notifications-view {
      overflow-y: scroll;
      @include hide-scrollbar();
      position: absolute;
      height: 100%;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      z-index: 10;
    }

    &__selected-resource-transactions {
      overflow-y: scroll;
      @include hide-scrollbar();
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      z-index: 10;
    }

    &__no-widget {
      @include flex($dir: column);
      gap: space(2);
      margin-top: space(10);
      padding: space(5);
      text-align: justify;
      color: var(--palette-text-on-main-20);
      @include typography(body-medium);
    }

    &__widget-text {
      cursor: pointer;
      text-decoration: underline;
      font-weight: 600;
    }

    .slide-enter-active,
    .slide-leave-active {
      transition: all 0.3s cubic-bezier(0.54, 0.35, 0.29, 0.99);
      -webkit-transition: all 0.3s cubic-bezier(0.54, 0.35, 0.29, 0.99);
      -moz-transition: all 0.3s cubic-bezier(0.54, 0.35, 0.29, 0.99);
      -o-transition: all 0.3s cubic-bezier(0.54, 0.35, 0.29, 0.99);
    }

    .slide-enter-from {
      transform: translateX(100%);
    }

    .slide-leave-to {
      transform: translateX(100%);
    }

    &__widget-settings-view {
      overflow-y: scroll;
      @include hide-scrollbar();
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      z-index: 5;
    }
  }
  .resource-edit {
    cursor: pointer;
    @include flex($align: center);
    gap: space(2);

    .edit-icon {
      width: 22px;
      height: 22px;
      color: #ffffff;
    }
  }

  .resource-amount {
    align-self: flex-end;

    .amount {
      font-size: 1.5rem;
      font-weight: 700;
      color: #ffffff;
    }

    .currency {
      @include typography(body-medium);
      color: #eaeaea;
    }
  }
</style>
