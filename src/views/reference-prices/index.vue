<template>
  <div class="reference-prices">
    <div class="reference-prices__heading heading">
      <div class="heading__headline">درخواست‌های قیمت مرجع</div>
      <div class="heading__border"></div>
      <div class="heading__text">
        اینجا می‌توانید درخواست‌های تغییر قیمت مرجع فروشندگان را بررسی کنید
      </div>
    </div>

    <div class="reference-prices__content">
      <template v-if="loading">
        <BaseSkeleton
          v-for="index in 3"
          :key="`skeleton-${index}`"
          width="100%"
          height="220px"
          radius="12px"
        />
      </template>

      <template v-else-if="items.length">
        <ReferencePriceRequestCard
          v-for="item in items"
          :key="item._id"
          :product="item"
          :loading="busyProductId === item._id"
          @mark-watched="handleMarkWatched"
          @update-price="handleUpdatePrice"
        />
      </template>

      <div v-else class="reference-prices__empty">
        درخواست جدیدی برای بررسی وجود ندارد.
      </div>
    </div>

    <div class="reference-prices__pagination" v-if="pager">
      <BasePagination
        :current-page="pager.page"
        :total-pages="pager.total_pages"
        @change="goToPage"
      />
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { toast } from 'vue3-toastify';
  import { usePromise } from '@/composables';
  import {
    getReferencePriceRequests,
    updateReferencePrice,
    markReferencePriceRequestsWatched,
  } from '@/services/product.service';
  import BasePagination from '@/components/common/base/base-pagination.vue';
  import BaseSkeleton from '@/components/common/base/base-skeleton.vue';
  import ReferencePriceRequestCard from '@/components/general/reference-price-request-card.vue';

  const router = useRouter();
  const route = useRoute();

  const busyProductId = ref(null);

  const { data: requestList, loading, execute } = usePromise(
    getReferencePriceRequests,
  );
  const { execute: updatePriceExecute, isRejected: updatePriceFailed } =
    usePromise(updateReferencePrice);
  const { execute: markWatchedExecute, isRejected: markWatchedFailed } =
    usePromise(markReferencePriceRequestsWatched);

  onMounted(() => execute({ ...route.query }));

  const items = computed(() => requestList.value?.items ?? []);
  const pager = computed(() => requestList.value?.pager ?? null);

  function goToPage(page) {
    const query = { ...route.query, page: String(page) };
    router.replace({ query });
    execute(query);
  }

  async function handleMarkWatched({ productId, requestIds }) {
    busyProductId.value = productId;
    await markWatchedExecute(productId, requestIds);
    busyProductId.value = null;
    // error toast handled by the http interceptor
    if (markWatchedFailed.value) return;

    toast.success('درخواست‌ها به عنوان دیده‌شده علامت‌گذاری شدند');
    execute({ ...route.query });
  }

  async function handleUpdatePrice({ productId, referencePrice }) {
    busyProductId.value = productId;
    await updatePriceExecute(productId, referencePrice);
    busyProductId.value = null;
    // error toast handled by the http interceptor
    if (updatePriceFailed.value) return;

    toast.success('قیمت مرجع با موفقیت به‌روزرسانی شد');
    execute({ ...route.query });
  }
</script>

<style lang="scss" scoped>
  .reference-prices {
    width: 100%;
    @include flex(column);
    gap: space(10);

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

    &__content {
      width: 100%;
      @include flex(column);
      gap: space(3);
    }

    &__empty {
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
    }
  }
</style>
