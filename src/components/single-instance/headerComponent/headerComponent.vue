<template>
  <header class="header">
    <div class="header__logo" @click="router.push(`/`)">
      <img src="@/assets/images/shop_outline.svg" alt="" />
      <div class="header__store-name">فروشگاه 3000</div>
    </div>

    <div class="header__actions">
      <div class="action__item sign-in">
        <span class="action__title">ورود | ثبت‌نام</span>
      </div>
    </div>
  </header>
</template>

<script setup>
  import BaseDropdown from '@/components/common/base/base-dropdown.vue';

  import { useRouter } from 'vue-router';
  const router = useRouter();

  const navigationItems = [
    {
      label: 'کالا',
      icon: 'mdi:heart-outline',
      items: [
        {
          label: 'جستجو و ثبت کالا',
          link: '/product/list',
        },
        {
          label: 'مدیریت کالا',
          link: '/product/management',
        },
      ],
    },
    {
      label: 'فروش عمده',
      icon: 'mdi:store-outline',
      url: '/',
    },
    {
      label: 'تماس باما',
      icon: 'mdi:phone-outline',
      url: '/',
    },
  ];

  const handleRouteToItem = (item) => {
    router.push(item.link);
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
  }
</style>
