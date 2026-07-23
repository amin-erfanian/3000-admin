<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': isCollapsed }">
    <div class="sidebar__toggle" @click="toggleSidebar">
      <BaseIcon
        class="toggle-icon"
        :class="{ 'toggle-icon--collapsed': isCollapsed }"
        :iconName="'arrow-left'"
      />
    </div>

    <nav class="sidebar__nav">
      <template v-for="(item, index) in menuItems" :key="index">
        <div
          class="sidebar__item"
          :class="{ 'sidebar__item--active': isActive(item.link) }"
          @click="handleNavigate(item)"
        >
          <BaseIcon :iconName="item.icon" class="sidebar__icon" />
          <span v-if="!isCollapsed" class="sidebar__label">{{
            item.label
          }}</span>
        </div>
      </template>
    </nav>
  </aside>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import BaseIcon from '../common/base/base-icon.vue';

  const router = useRouter();
  const route = useRoute();
  const isCollapsed = ref(false);

  const menuItems = [
    {
      label: 'داشبورد',
      icon: 'dashboard',
      link: '/',
    },
    {
      label: 'مدیریت کالا',
      icon: 'product',
      link: '/products',
    },
    {
      label: 'مدیریت دسته‌بندی‌ها',
      icon: 'category',
      link: '/categories',
    },
    {
      label: 'مدیریت برندها',
      icon: 'brand',
      link: '/brands',
    },
    {
      label: 'سفارشات',
      icon: 'order',
      // link: '/order',
    },
    {
      label: 'فروشندگان',
      icon: 'seller',
      // link: '/sellers',
    },
    {
      label: 'گزارشات',
      icon: 'report',
      // link: '/reports',
    },
  ];

  const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value;
  };

  const handleNavigate = (item) => {
    if (item.link) {
      router.push(item.link);
    }
  };

  const isActive = (link) => {
    return route.path === link;
  };
</script>

<style lang="scss" scoped>
  .sidebar {
    position: relative;
    width: 240px;
    background-color: white;
    border-left: 1px solid var(--palette-outline-variant);
    transition: width 0.3s ease;
    @include flex($dir: column);

    &--collapsed {
      width: 64px;

      .sidebar__label {
        display: none;
      }
    }

    &__toggle {
      position: absolute;
      top: 16px;
      left: -12px;
      width: 24px;
      height: 24px;
      background-color: white;
      border: 1px solid var(--palette-outline-variant);
      border-radius: 50%;
      @include flex($align: center, $justify: center);
      cursor: pointer;
      z-index: 10;
      transition: all 0.2s ease;

      &:hover {
        transform: scale(1.1);
      }

      .toggle-icon {
        width: 16px;
        height: 16px;
        transform: rotate(180deg);

        &--collapsed {
          transform: rotate(0);
        }
      }
    }

    &__nav {
      width: 100%;
      @include flex($dir: column);
      gap: space(1);
      padding: space(8) space(2);
    }

    &__item {
      @include flex($align: center);
      gap: space(3);
      padding: space(3) space(4);
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      color: var(--palette-text-primary);

      &:hover {
        background-color: var(--palette-surface-variant);
      }

      &--active {
        background-color: var(--palette-primary-container);
        color: var(--palette-primary);
        font-weight: 600;
      }
    }

    &__icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    &__label {
      font-size: 14px;
      white-space: nowrap;
    }
  }
</style>
