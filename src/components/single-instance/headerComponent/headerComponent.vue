<template>
  <header class="header">
    <div class="header__logo" @click="router.push(`/`)">
      <img src="@/assets/images/shop_outline.svg" alt="" />
      <div class="header__store-name">فروشگاه 3000</div>
    </div>

    <div class="header__actions">
      <div class="header__action-item logout">
        <span class="header__title" @click="handleLogout">خروج</span>
      </div>
    </div>
  </header>
</template>

<script setup>
  import useAdminStore from '@/stores/admin';
  const adminStore = useAdminStore();

  import { useRouter } from 'vue-router';
  const router = useRouter();

  const handleLogout = () => {
    adminStore.logout();
  };
</script>

<style lang="scss" scoped>
  .header {
    width: 100%;
    @include flex($align: center, $justify: space-between);
    gap: space(4);
    position: sticky;
    background-color: white;
    top: 0;
    left: 0;
    right: 0;
    padding: 20px 5%;
    border-bottom: 1px solid var(--palette-outline-variant);
    box-shadow: 0px 0px 24px rgba(0, 0, 0, 0.04);
    z-index: 200;

    &__logo {
      @include flex($align: center);
      gap: space(2);
    }

    &__assortment {
      @include flex($align: center);
      gap: space();
    }

    &__actions {
      @include flex($align: center);
      gap: space(2);
    }

    &__action-item {
      cursor: pointer;
    }
  }
</style>
