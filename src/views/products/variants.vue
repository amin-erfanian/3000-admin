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
            <BaseButton
              size="small"
              class="product-variants__delete product-variants__delete--product"
              @click="showProductDeleteModal = true"
            >
              حذف کالا
            </BaseButton>
          </div>

          <div class="product-variants__fields">
            <div
              v-for="field in productFields"
              :key="field.label"
              class="product-variants__field"
            >
              <span class="product-variants__label">{{ field.label }}</span>
              <span
                v-if="field.editable"
                class="product-variants__value product-variants__value--editable"
              >
                {{ field.value }}
                <button
                  type="button"
                  class="product-variants__edit"
                  aria-label="ویرایش قیمت مرجع"
                  @click="showReferencePriceModal = true"
                >
                  <BaseIcon iconName="edit" />
                </button>
              </span>
              <span v-else class="product-variants__value">{{
                field.value
              }}</span>
            </div>
          </div>
        </div>
      </section>

      <ReferencePriceModal
        v-model="showReferencePriceModal"
        :product="product"
        @updated="handleReferencePriceUpdated"
      />

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

          <div class="product-variants__actions">
            <BaseButton
              size="small"
              class="product-variants__delete"
              @click="variantToDelete = variant._id"
            >
              حذف تنوع
            </BaseButton>
          </div>
        </article>
      </div>

      <ConfirmationModal
        v-model="showDeleteModal"
        width="420px"
        title="آیا از حذف این تنوع مطمئن هستید؟"
        hint="این تنوع به طور کامل حذف می‌شود و قابل بازگشت نیست."
        confirm-text="حذف تنوع"
        cancel-text="انصراف"
        variant="danger"
        :submit-loading="deleting"
        @confirm="confirmDelete"
        @cancel="variantToDelete = null"
      />

      <ConfirmationModal
        v-model="showProductDeleteModal"
        width="420px"
        title="آیا از حذف این کالا مطمئن هستید؟"
        hint="کالا به همراه همه تنوع‌های آن به طور کامل حذف می‌شود و قابل بازگشت نیست."
        confirm-text="حذف کالا"
        cancel-text="انصراف"
        variant="danger"
        :submit-loading="deletingProduct"
        @confirm="confirmProductDelete"
        @cancel="showProductDeleteModal = false"
      />
    </template>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { usePromise } from '@/composables';
  import {
    getProductVariants,
    deleteProduct,
  } from '@/services/product.service';
  import { toast } from 'vue3-toastify';
  import { getProcessRules } from '@/services/process-rule.service';
  import { deleteVariant } from '@/services/variant.service';
  import BaseButton from '@/components/common/base/base-button.vue';
  import BaseIcon from '@/components/common/base/base-icon.vue';
  import ConfirmationModal from '@/components/general/confirmation-modal.vue';
  import BaseSkeleton from '@/components/common/base/base-skeleton.vue';
  import ProductStatusBadge from '@/components/general/product-status-badge.vue';
  import ReferencePriceModal from '@/components/general/reference-price-modal.vue';

  const route = useRoute();
  const router = useRouter();

  const showReferencePriceModal = ref(false);

  const { data, loading, isRejected, execute } = usePromise(getProductVariants);
  const { data: processRules, execute: fetchProcessRules } =
    usePromise(getProcessRules);

  onMounted(() => {
    execute(route.params.id);
    fetchProcessRules();
  });

  // update in place to avoid the full-page skeleton of a refetch
  const handleReferencePriceUpdated = ({ referencePrice }) => {
    data.value = {
      ...data.value,
      product: { ...data.value.product, referencePrice },
    };
  };

  // delete

  const variantToDelete = ref(null);

  const showDeleteModal = computed({
    get: () => !!variantToDelete.value,
    set: (isOpen) => {
      if (!isOpen) variantToDelete.value = null;
    },
  });

  const {
    execute: deleteExecute,
    isRejected: deleteFailed,
    loading: deleting,
  } = usePromise(deleteVariant);

  const confirmDelete = async () => {
    const variantId = variantToDelete.value;
    await deleteExecute(variantId);
    // error toast handled by the http interceptor
    if (deleteFailed.value) return;

    toast.success('تنوع با موفقیت حذف شد');
    variantToDelete.value = null;
    // remove in place to avoid the full-page skeleton of a refetch
    data.value = {
      ...data.value,
      items: data.value.items.filter((item) => item._id !== variantId),
    };
  };

  const showProductDeleteModal = ref(false);

  const {
    execute: deleteProductExecute,
    isRejected: deleteProductFailed,
    loading: deletingProduct,
  } = usePromise(deleteProduct);

  const confirmProductDelete = async () => {
    await deleteProductExecute(product.value._id);
    // error toast handled by the http interceptor
    if (deleteProductFailed.value) return;

    toast.success('کالا با موفقیت حذف شد');
    showProductDeleteModal.value = false;
    router.push({ name: 'products' });
  };

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
    return `${warranty.name} (${formatNumber(value)} ${
      DURATION_UNITS[unit] ?? unit
    })`;
  };

  const shipmentText = (methods = {}) => {
    const labels = [
      methods.shipMarket && 'فروشگاه 3000',
      methods.shipSeller && 'فروشنده',
      methods.threeHour && '۳ ساعته',
    ].filter(Boolean);
    return labels.length ? labels.join('، ') : '—';
  };

  // Price of the first active process rule whose ranges contain the product's dimensions
  const processPrice = computed(() => {
    const { width, height, length } = product.value?.dimensions || {};
    if (width == null || height == null || length == null) return null;
    if (!Array.isArray(processRules.value)) return null;

    const inRange = (val, from, to) => val >= from && val <= to;
    const rule = processRules.value.find(
      (r) =>
        r.isActive !== false &&
        inRange(width, r.widthFrom, r.widthTo) &&
        inRange(height, r.heightFrom, r.heightTo) &&
        inRange(length, r.lengthFrom, r.lengthTo),
    );

    return rule?.price ?? null;
  });

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
      {
        label: 'قیمت مرجع (ریال)',
        value: formatPrice(p.referencePrice),
        editable: true,
      },
      { label: 'هزینه پردازش (ریال)', value: formatNumber(processPrice.value) },
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
      width: 100%;
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

      &--editable {
        @include flex($align: center);
        gap: space(2);
      }
    }

    &__actions {
      width: 100%;
      @include flex($align: center);
    }

    &__delete {
      min-width: 120px;
      background-color: var(--palette-error);

      &--product {
        margin-inline-start: auto;
      }
    }

    &__edit {
      @include flex($align: center, $justify: center);
      width: 24px;
      height: 24px;
      padding: 0;
      border: none;
      background: none;
      color: var(--palette-primary);
      cursor: pointer;
    }
  }
</style>
