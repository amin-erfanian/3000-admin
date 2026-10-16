<template>
  <div class="product-variants" dir="rtl">
    <div class="product-variants__header">
      <button class="product-variants__back" @click="goBack">
        <BaseIcon iconName="arrow-right" class="product-variants__back-icon" />
        بازگشت
      </button>
      <h2 class="product-variants__title">تنوع‌های کالا</h2>
    </div>

    <template v-if="isLoading">
      <BaseSkeleton width="100%" height="180px" radius="12px" />
      <div class="product-variants__list">
        <BaseSkeleton
          v-for="index in 3"
          :key="`skeleton-${index}`"
          width="100%"
          height="200px"
          radius="12px"
        />
      </div>
    </template>

    <div v-else-if="isRejected || !product" class="product-variants__error">
      خطا در بارگذاری اطلاعات کالا.
    </div>

    <template v-else>
      <section class="product-variants__product">
        <img
          v-if="product.images?.main"
          :src="product.images.main"
          :alt="product.titleFa"
          class="product-variants__image"
        />

        <div class="product-variants__product-info">
          <div class="product-variants__product-heading">
            <h3 class="product-variants__product-title">
              {{ product.titleFa || '—' }}
            </h3>
            <span v-if="product.titleEn" class="product-variants__subtitle">
              ({{ product.titleEn }})
            </span>
            <ProductStatusBadge :status="product.status || 'draft'" />
          </div>

          <div class="product-variants__fields">
            <div
              v-for="field in productFields"
              :key="field.label"
              class="product-variants__field"
            >
              <span class="product-variants__label">{{ field.label }}</span>
              <span class="product-variants__value">{{ field.value }}</span>
            </div>
          </div>
        </div>
      </section>

      <div class="product-variants__list-heading">
        <h3 class="product-variants__section-title">لیست تنوع‌ها</h3>
        <span class="product-variants__count">
          {{ variants.length.toLocaleString('fa-IR') }} مورد
        </span>
      </div>

      <div v-if="!variants.length" class="product-variants__empty">
        هیچ تنوعی برای این کالا ثبت نشده است.
      </div>

      <div v-else class="product-variants__list">
        <article
          v-for="variant in variants"
          :key="variant._id"
          class="product-variants__variant"
        >
          <div class="product-variants__variant-header">
            <span class="product-variants__seller">
              {{ variant.seller?.title || '—' }}
            </span>
            <span
              v-if="variant.color"
              class="product-variants__color"
              :title="variant.color.nameEn"
            >
              <span
                class="product-variants__swatch"
                :style="{ backgroundColor: variant.color.hexCode }"
              ></span>
              {{ variant.color.name }}
            </span>
          </div>

          <div class="product-variants__fields">
            <div
              v-for="field in variantFields(variant)"
              :key="field.label"
              class="product-variants__field"
            >
              <span class="product-variants__label">{{ field.label }}</span>
              <span class="product-variants__value">{{ field.value }}</span>
            </div>
          </div>
        </article>
      </div>
    </template>
  </div>
</template>

<script setup>
  import { computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { usePromise } from '@/composables';
  import { getProductVariants } from '@/services/product.service';
  import BaseIcon from '@/components/common/base/base-icon.vue';
  import BaseSkeleton from '@/components/common/base/base-skeleton.vue';
  import ProductStatusBadge from '@/components/general/product-status-badge.vue';

  const route = useRoute();
  const router = useRouter();

  const { data, loading, isRejected, execute } =
    usePromise(getProductVariants);

  onMounted(() => execute(route.params.id));

  // also covers the first render, before the request has started
  const isLoading = computed(
    () => loading.value || (!data.value && !isRejected.value),
  );

  const product = computed(() => data.value?.product ?? null);
  const variants = computed(() => data.value?.items ?? []);

  const goBack = () => {
    router.push({ name: 'products' });
  };

  const normalizeValue = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    return value;
  };

  const formatNumber = (value) =>
    value === null || value === undefined
      ? '—'
      : Number(value).toLocaleString('fa-IR');

  const formatPrice = (value) =>
    value ? Number(value).toLocaleString('fa-IR') : '—';

  const formatDate = (value) => {
    if (!value) return '—';
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  };

  const DURATION_UNITS = { day: 'روز', month: 'ماه', year: 'سال' };
  const DELIVERY_LABELS = {
    sameDay: 'همان روز',
    '1day': '۱ روز',
    '2day': '۲ روز',
  };

  const warrantyText = (warranty) => {
    if (!warranty) return '—';
    const { value, unit } = warranty.duration ?? {};
    if (!value) return warranty.name;
    return `${warranty.name} (${formatNumber(value)} ${DURATION_UNITS[unit] ?? unit})`;
  };

  const shipmentText = (methods = {}) => {
    const labels = [
      methods.shipMarket && 'فروشگاه 3000',
      methods.shipSeller && 'فروشنده',
      methods.threeHour && '۳ ساعته',
    ].filter(Boolean);
    return labels.length ? labels.join('، ') : '—';
  };

  const productFields = computed(() => {
    const p = product.value;
    if (!p) return [];

    return [
      { label: 'کد کالا', value: normalizeValue(p.code) },
      { label: 'برند', value: normalizeValue(p.brand?.titleFa) },
      { label: 'دسته‌بندی', value: normalizeValue(p.category?.titleFa) },
      {
        label: 'کمیسیون',
        value:
          p.category?.commission != null ? `${p.category.commission}%` : '—',
      },
      { label: 'قیمت مرجع (ریال)', value: formatPrice(p.referencePrice) },
      { label: 'ثبت‌کننده', value: normalizeValue(p.createdBy?.title) },
      { label: 'کد ثبت‌کننده', value: normalizeValue(p.createdBy?.code) },
    ];
  });

  const variantFields = (variant) => {
    const shipment = variant.shipmentMethods ?? {};

    return [
      { label: 'کد فروشنده', value: normalizeValue(variant.seller?.code) },
      { label: 'تلفن فروشنده', value: normalizeValue(variant.seller?.phone) },
      { label: 'قیمت (ریال)', value: formatPrice(variant.price) },
      {
        label: 'قیمت قبل از تخفیف (ریال)',
        value: formatPrice(variant.originalPrice),
      },
      {
        label: 'تخفیف',
        value: variant.discountPercent
          ? `${formatNumber(variant.discountPercent)}%`
          : '—',
      },
      { label: 'موجودی', value: formatNumber(variant.stock) },
      { label: 'حداکثر سفارش در سبد', value: formatNumber(variant.orderLimit) },
      { label: 'گارانتی', value: warrantyText(variant.warranty) },
      { label: 'روش ارسال', value: shipmentText(shipment) },
      {
        label: 'مهلت تحویل به انبار',
        value: DELIVERY_LABELS[shipment.warehouseDelivery] ?? '—',
      },
      {
        label: 'مهلت تحویل به خریدار',
        value: DELIVERY_LABELS[shipment.buyerDelivery] ?? '—',
      },
      { label: 'بارکد', value: normalizeValue(variant.barcode) },
      {
        label: 'شناسه تنوع فروشنده',
        value: normalizeValue(variant.sellerVariantId),
      },
      { label: 'تاریخ ثبت', value: formatDate(variant.createdAt) },
    ];
  };
</script>

<style scoped lang="scss">
  .product-variants {
    width: 100%;
    @include flex(column);
    gap: space(4);

    &__header {
      @include flex($align: center);
      gap: space(2);
      flex-wrap: wrap;
    }

    &__back {
      @include flex($align: center);
      gap: space(1);
      padding: space(2) space(3);
      background: var(--palette-background);
      border: 1px solid var(--palette-border-10);
      border-radius: $radius-1x;
      cursor: pointer;
      color: var(--palette-text-on-main-20);
      @include typography(label-medium);
    }

    &__back-icon {
      width: 18px;
      height: 18px;
    }

    &__title {
      @include typography(title-medium);
      color: var(--palette-text-on-main-10);
      margin: 0;
    }

    &__error,
    &__empty {
      border: 1px dashed var(--palette-border-10);
      border-radius: $radius-2x;
      padding: space(6);
      text-align: center;
      color: var(--palette-text-on-main-40);
    }

    &__error {
      color: var(--palette-error);
    }

    &__product {
      width: 100%;
      border: 1px solid var(--palette-border-10);
      border-radius: $radius-2x;
      padding: space(4);
      background: var(--palette-background);
      @include flex(column);
      gap: space(3);

      @include media-query(medium) {
        @include flex(row, $align: flex-start);
      }
    }

    &__image {
      width: 160px;
      height: 160px;
      flex: 0 0 160px;
      object-fit: contain;
      border-radius: $radius-1x;
      border: 1px solid var(--palette-border-10);
    }

    &__product-info {
      flex: 1;
      min-width: 0;
      @include flex(column);
      gap: space(3);
    }

    &__product-heading {
      @include flex($align: center);
      gap: space(2);
      flex-wrap: wrap;
    }

    &__product-title {
      @include typography(title-medium);
      color: var(--palette-text-on-main-10);
      margin: 0;
    }

    &__subtitle {
      @include typography(label-medium);
      color: var(--palette-text-on-main-30);
    }

    &__list-heading {
      @include flex($align: center, $justify: space-between);
      gap: space(2);
    }

    &__section-title {
      @include typography(label-medium);
      font-weight: 900;
      color: var(--palette-text-on-main-10);
      margin: 0;
    }

    &__count {
      @include typography(label-small);
      color: var(--palette-text-on-main-40);
    }

    &__list {
      width: 100%;
      @include flex(column);
      gap: space(3);
    }

    &__variant {
      width: 100%;
      border: 1px solid var(--palette-border-10);
      border-radius: $radius-2x;
      padding: space(4);
      background: var(--palette-background);
      @include flex(column);
      gap: space(3);
    }

    &__variant-header {
      @include flex($align: center, $justify: space-between);
      gap: space(2);
      flex-wrap: wrap;
    }

    &__seller {
      @include typography(label-medium);
      font-weight: 900;
      color: var(--palette-text-on-main-10);
    }

    &__color {
      @include flex($align: center);
      gap: space(1);
      @include typography(label-small);
      color: var(--palette-text-on-main-20);
    }

    &__swatch {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 1px solid var(--palette-border-10);
    }

    &__fields {
      width: 100%;
      @include flex(column);
      gap: space(2);

      @include media-query(medium) {
        @include flex(row, $wrap: wrap);
      }
    }

    &__field {
      border: 1px solid var(--palette-border-10);
      border-radius: $radius-1x;
      padding: space(2);
      @include flex(column);
      gap: space(1);
      background: rgba(var(--palette-background-rgb), 0.65);

      @include media-query(medium) {
        width: calc(33.333% - #{space(2)});
      }
    }

    &__label {
      @include typography(label-small);
      color: var(--palette-text-on-main-40);
    }

    &__value {
      @include typography(body-medium);
      color: var(--palette-text-on-main-20);
      word-break: break-word;
    }
  }
</style>
