<template>
  <div class="product-list">
    <div class="product-list__heading heading">
      <div class="heading__headline">مدیریت کالا</div>
      <div class="heading__border"></div>
      <div class="heading__text">
        اینجا می‌توانید کالاهای ثبت شده را مشاهده و تعیین وضعیت کنید
      </div>
    </div>

    <div class="product-list__search">
      <Search v-model="searchQuery" @keyup.enter="applySearch" />
    </div>

    <div class="product-list__filter">
      <ProductFilter
        :filterItems="PRODUCT_FILTER_ITEMS"
        @search="handleFilterSearch"
      />
    </div>

    <div class="product-list__content">
      <template v-if="loading">
        <div
          v-for="index in 3"
          :key="`skeleton-${index}`"
          class="product-list__skeleton"
        >
          <BaseSkeleton width="100%" height="220px" radius="12px" />
        </div>
      </template>

      <template v-else-if="items.length">
        <ProductDetailsCard
          v-for="item in items"
          :key="item._id || item.id"
          :product="item"
          @approve="handleApprove"
          @delete="productToDelete = $event.productId"
          @reference-price-updated="execute({ ...route.query })"
        />
      </template>

      <div v-else class="product-list__empty">موردی برای نمایش وجود ندارد.</div>
    </div>

    <ConfirmationModal
      v-model="showDeleteModal"
      width="420px"
      title="آیا از حذف این کالا مطمئن هستید؟"
      hint="کالا به همراه همه تنوع‌های آن به طور کامل حذف می‌شود و قابل بازگشت نیست."
      confirm-text="حذف کالا"
      cancel-text="انصراف"
      variant="danger"
      :submit-loading="deleting"
      @confirm="confirmDelete"
      @cancel="productToDelete = null"
    />

    <div class="product-list__pagination" v-if="pager">
      <BasePagination
        :current-page="pager.page"
        :total-pages="pager.total_pages"
        @change="goToPage"
      />
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { toast } from 'vue3-toastify';
  import { usePromise } from '@/composables';
  import {
    getProductList,
    approveProduct,
    deleteProduct,
  } from '@/services/product.service';
  import ConfirmationModal from '@/components/general/confirmation-modal.vue';
  import { PRODUCT_FILTER_ITEMS } from '@/constants/filters';
  import Search from '@/components/general/search.vue';
  import ProductFilter from '@/components/general/product-filter.vue';
  import BasePagination from '@/components/common/base/base-pagination.vue';
  import BaseSkeleton from '@/components/common/base/base-skeleton.vue';
  import ProductDetailsCard from '@/components/general/product-details-card.vue';

  const router = useRouter();
  const route = useRoute();

  const searchQuery = ref(route.query.keyword ?? '');

  const { data: productList, loading, execute } = usePromise(getProductList);
  const { execute: approveExecute, isRejected: approveFailed } =
    usePromise(approveProduct);

  onMounted(() => execute({ ...route.query }));

  function applySearch() {
    const query = {
      ...route.query,
      ...(searchQuery.value
        ? { keyword: searchQuery.value }
        : { keyword: undefined }),
      page: 1,
    };
    router.replace({ query });
    execute(query);
  }

  function handleFilterSearch(params) {
    execute(params);
  }

  function goToPage(page) {
    const query = { ...route.query, page: String(page) };
    router.replace({ query });
    execute(query);
  }

  const items = computed(() => productList.value?.items ?? []);
  const pager = computed(() => productList.value?.pager ?? null);

  async function handleApprove({ productId }) {
    await approveExecute(productId);
    // error toast handled by the http interceptor
    if (approveFailed.value) return;

    toast.success('کالا با موفقیت تایید شد');
    execute({ ...route.query });
  }

  // delete

  const productToDelete = ref(null);

  const showDeleteModal = computed({
    get: () => !!productToDelete.value,
    set: (isOpen) => {
      if (!isOpen) productToDelete.value = null;
    },
  });

  const {
    execute: deleteExecute,
    isRejected: deleteFailed,
    loading: deleting,
  } = usePromise(deleteProduct);

  async function confirmDelete() {
    await deleteExecute(productToDelete.value);
    // error toast handled by the http interceptor
    if (deleteFailed.value) return;

    toast.success('کالا با موفقیت حذف شد');
    productToDelete.value = null;
    execute({ ...route.query });
  }
</script>

<style lang="scss" scoped>
  .product-list {
    width: 100%;
    @include flex(column);
    gap: space(10);

    &__heading {
      width: 100%;
    }

    .heading {
      @include flex($align: center);
      gap: space(2);

      &__headline {
        @include typography(label-medium);
        font-weight: 900;
        color: var(--palette-text-on-main-10);
      }

      &__border {
        width: 2px;
        height: 20px;
        background-color: var(--palette-text-on-main-10);
        border-radius: 4px;
      }

      &__text {
        @include typography(body-small);
        color: var(--palette-text-on-main-30);
      }
    }

    &__search,
    &__filter,
    &__content {
      width: 100%;
    }

    &__content {
      @include flex(column);
      gap: space(3);
    }

    &__empty {
      width: 100%;
      border: 1px dashed var(--palette-border-10);
      border-radius: $radius-2x;
      padding: space(6);
      text-align: center;
      color: var(--palette-text-on-main-40);
    }

    &__pagination {
      width: 100%;
      @include flex($align: center, $justify: center);
      margin-top: 12px;
      gap: space(4);
    }

    &__pagination-button {
      padding: space(2);
      border-radius: $radius-1x;
      color: #fafafa;
      background-color: var(--palette-primary);
    }
  }
</style>
