<template>
  <div class="product-details" dir="rtl">
    <div class="product-details__header">
      <button class="product-details__back" @click="goBack">
        <BaseIcon iconName="arrow-right" class="product-details__back-icon" />
        بازگشت
      </button>

      <template v-if="product">
        <h2 class="product-details__title">{{ product.titleFa || '—' }}</h2>
        <span v-if="product.titleEn" class="product-details__subtitle">
          ({{ product.titleEn }})
        </span>
        <ProductStatusBadge :status="product.status || 'draft'" />
      </template>
    </div>

    <template v-if="loading">
      <div class="product-details__skeletons">
        <BaseSkeleton width="100%" height="260px" radius="12px" />
        <BaseSkeleton width="100%" height="320px" radius="12px" />
      </div>
    </template>

    <div v-else-if="isRejected || !product" class="product-details__error">
      خطا در بارگذاری اطلاعات کالا.
    </div>

    <template v-else>
      <div class="product-details__grid">
        <section class="product-details__section product-details__media">
          <h3 class="product-details__section-title">تصاویر و ویدیوها</h3>
          <div v-if="canReject" class="product-details__media-toggles">
            <span
              v-for="item in mediaRejectables"
              :key="item.property"
              class="product-details__label-row"
            >
              <span class="product-details__label">{{ item.label }}</span>
              <RejectToggle
                :active="isPropertyRejected(item.property)"
                @toggle="toggleRejection(item)"
              />
            </span>
          </div>
          <ProductMediaSlider :media-items="mediaItems" />
        </section>

        <section
          v-for="section in fieldSections"
          :key="section.title"
          class="product-details__section"
        >
          <h3 class="product-details__section-title">{{ section.title }}</h3>
          <div class="product-details__fields">
            <div
              v-for="field in section.fields"
              :key="field.key || field.label"
              class="product-details__field"
              :class="{
                'product-details__field--rejected':
                  field.property && isPropertyRejected(field.property),
              }"
            >
              <div class="product-details__field-content">
                <span class="product-details__label">{{ field.label }}</span>

                <div
                  v-if="Array.isArray(field.value) && field.value.length"
                  class="product-details__badges"
                >
                  <span
                    v-for="(item, index) in field.value"
                    :key="`${field.key}-${index}`"
                    class="product-details__badge"
                  >
                    {{ item }}
                  </span>
                </div>
                <span
                  v-else-if="field.editable"
                  class="product-details__value product-details__value--editable"
                >
                  {{ field.value }}
                  <button
                    type="button"
                    class="product-details__edit"
                    aria-label="ویرایش قیمت مرجع"
                    @click="showReferencePriceModal = true"
                  >
                    <BaseIcon iconName="edit" />
                  </button>
                </span>
                <span v-else class="product-details__value">{{
                  normalizeValue(field.value)
                }}</span>
              </div>

              <RejectToggle
                v-if="canReject && field.property"
                :active="isPropertyRejected(field.property)"
                @toggle="toggleRejection(field)"
              />
            </div>
          </div>
        </section>

        <section v-if="product.description" class="product-details__section">
          <span class="product-details__label-row">
            <h3 class="product-details__section-title">توضیحات</h3>
            <RejectToggle
              v-if="canReject"
              :active="isPropertyRejected('description')"
              @toggle="
                toggleRejection({ property: 'description', label: 'توضیحات' })
              "
            />
          </span>
          <p class="product-details__description">{{ product.description }}</p>
        </section>

        <section class="product-details__section">
          <h3 class="product-details__section-title">وضعیت بررسی</h3>
          <div
            v-if="product.rejectionReasons?.length"
            class="product-details__reasons"
          >
            <div
              v-for="reason in product.rejectionReasons"
              :key="reason.property"
              class="product-details__reason"
            >
              <span class="product-details__reason-label">
                {{ propertyLabels[reason.property] || reason.property }}
              </span>
              <span class="product-details__value">{{ reason.message }}</span>
            </div>
          </div>
          <span v-else class="product-details__value">
            دلیل ردی ثبت نشده است.
          </span>
        </section>

        <section
          v-if="canReject"
          class="product-details__section product-details__rejection"
        >
          <h3 class="product-details__section-title">رد کالا</h3>

          <span
            v-if="!rejectionReasons.length"
            class="product-details__rejection-empty"
          >
            برای رد کالا، روی علامت × کنار هر ویژگی کلیک کنید.
          </span>

          <div
            v-for="reason in rejectionReasons"
            :key="reason.property"
            class="product-details__rejection-row"
          >
            <span class="product-details__rejection-label">
              {{ reason.label }}
            </span>
            <div class="product-details__rejection-input">
              <BaseTextInput
                isBlock
                v-model="reason.message"
                :name="`rejection-${reason.property}`"
                placeholder="دلیل رد را بنویسید"
                variant="outlined"
                :is-error="showRejectionErrors && !reason.message.trim()"
              />
            </div>
            <RejectToggle active @toggle="toggleRejection(reason)" />
          </div>

          <span
            v-if="showRejectionErrors && hasEmptyRejectionMessage"
            class="product-details__rejection-error"
          >
            وارد کردن دلیل رد برای همه موارد الزامی است.
          </span>

          <div class="product-details__rejection-actions">
            <BaseButton
              size="small"
              class="product-details__reject-button"
              :disabled="!rejectionReasons.length"
              :is-loading="rejecting"
              @click="submitRejection"
            >
              رد کالا
            </BaseButton>
          </div>
        </section>
      </div>

      <ReferencePriceModal
        v-model="showReferencePriceModal"
        :product="product"
        @updated="handleReferencePriceUpdated"
      />
    </template>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { toast } from 'vue3-toastify';
  import { usePromise } from '@/composables';
  import { getProduct, rejectProduct } from '@/services/product.service';
  import BaseIcon from '@/components/common/base/base-icon.vue';
  import BaseButton from '@/components/common/base/base-button.vue';
  import BaseSkeleton from '@/components/common/base/base-skeleton.vue';
  import BaseTextInput from '@/components/common/base/base-text-input.vue';
  import ProductStatusBadge from '@/components/general/product-status-badge.vue';
  import ProductMediaSlider from '@/components/general/product-media-slider.vue';
  import ReferencePriceModal from '@/components/general/reference-price-modal.vue';
  import RejectToggle from '@/components/general/reject-toggle.vue';

  const route = useRoute();
  const router = useRouter();

  const showReferencePriceModal = ref(false);

  const {
    data: product,
    loading,
    isRejected,
    execute: fetchProduct,
  } = usePromise(getProduct);
  const {
    loading: rejecting,
    isRejected: rejectFailed,
    execute: rejectExecute,
  } = usePromise(rejectProduct);

  onMounted(() => fetchProduct(route.params.id));

  // update in place to avoid the full-page skeleton of a refetch
  const handleReferencePriceUpdated = ({ referencePrice }) => {
    product.value = { ...product.value, referencePrice };
  };

  const goBack = () => {
    router.push({ name: 'products' });
  };

  const normalizeValue = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    if (Array.isArray(value) && !value.length) return '—';
    return value;
  };

  const formatPrice = (value) =>
    value ? Number(value).toLocaleString('fa-IR') : '—';

  const formatDate = (value) => {
    if (!value) return '—';
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  };

  const marketStatusLabel = computed(() => {
    switch (product.value?.marketStatus) {
      case 'marketable':
        return 'قابل عرضه';
      default:
        return normalizeValue(product.value?.marketStatus);
    }
  });

  // `property` is the dot path sent to the server; fields without it can't be rejected.
  // `rejectionLabel` overrides the label in the rejection list when several fields share a property.
  const fieldSections = computed(() => {
    const p = product.value;
    if (!p) return [];

    const sections = [
      {
        title: 'اطلاعات کلی',
        fields: [
          { property: 'titleFa', label: 'عنوان فارسی', value: p.titleFa },
          { property: 'titleEn', label: 'عنوان انگلیسی', value: p.titleEn },
          { property: 'slug', label: 'شناسه (slug)', value: p.slug },
          { property: 'code', label: 'کد کالا', value: p.code },
          { property: 'sku', label: 'SKU', value: p.sku },
          {
            property: 'referencePrice',
            label: 'قیمت مرجع (ریال)',
            value: formatPrice(p.referencePrice),
            editable: true,
          },
          {
            property: 'minBasketQuantity',
            label: 'حداقل تعداد در سبد خرید',
            value: p.minBasketQuantity,
          },
          {
            property: 'marketStatus',
            label: 'وضعیت عرضه',
            value: marketStatusLabel.value,
          },
          {
            label: 'امتیاز',
            value: `${normalizeValue(p.rating?.average)} (${normalizeValue(
              p.rating?.count,
            )} رای)`,
          },
          {
            property: 'properties.isFake',
            label: 'اصالت کالا',
            value: p.properties?.isFake ? 'غیراصل' : 'اصل',
          },
          {
            property: 'properties.isFastShipping',
            label: 'ارسال سریع',
            value: p.properties?.isFastShipping ? 'دارد' : 'ندارد',
          },
          { label: 'تاریخ ایجاد', value: formatDate(p.createdAt) },
          { label: 'آخرین به‌روزرسانی', value: formatDate(p.updatedAt) },
        ],
      },
      {
        title: 'برند و دسته‌بندی',
        fields: [
          {
            key: 'brandFa',
            property: 'brand',
            label: 'برند',
            value: p.brand?.titleFa,
          },
          {
            key: 'brandEn',
            property: 'brand',
            label: 'برند (انگلیسی)',
            rejectionLabel: 'برند',
            value: p.brand?.titleEn,
          },
          {
            key: 'categoryFa',
            property: 'category',
            label: 'دسته‌بندی',
            value: p.category?.titleFa,
          },
          {
            key: 'categoryEn',
            property: 'category',
            label: 'دسته‌بندی (انگلیسی)',
            rejectionLabel: 'دسته‌بندی',
            value: p.category?.titleEn,
          },
          {
            label: 'کمیسیون',
            value: `${normalizeValue(p.category?.commission)}%`,
          },
        ],
      },
      {
        title: 'فروشنده',
        fields: [
          { label: 'نام فروشنده', value: p.createdBy?.title },
          { label: 'کد فروشنده', value: p.createdBy?.code },
          { label: 'شماره تماس', value: p.createdBy?.phone },
        ],
      },
      {
        title: 'ابعاد و وزن',
        fields: [
          {
            property: 'dimensions.length',
            label: 'طول (سانتی متر)',
            value: p.dimensions?.length,
          },
          {
            property: 'dimensions.width',
            label: 'عرض (سانتی متر)',
            value: p.dimensions?.width,
          },
          {
            property: 'dimensions.height',
            label: 'ارتفاع (سانتی متر)',
            value: p.dimensions?.height,
          },
          { property: 'weight', label: 'وزن (گرم)', value: p.weight },
        ],
      },
    ];

    if (p.attributes?.length) {
      sections.push({
        title: 'ویژگی‌های کالا',
        fields: p.attributes.map((attr) => ({
          key: attr._id || attr.key,
          property: `attributes.${attr.key}`,
          label: attr.label,
          value: attr.value,
        })),
      });
    }

    return sections;
  });

  const mediaRejectables = computed(() => [
    { property: 'images', label: 'تصاویر' },
    ...(product.value?.videos?.length
      ? [{ property: 'videos', label: 'ویدیوها' }]
      : []),
  ]);

  const propertyLabels = computed(() => {
    const labels = {
      images: 'تصاویر',
      videos: 'ویدیوها',
      description: 'توضیحات',
    };
    fieldSections.value
      .flatMap((section) => section.fields)
      .filter((field) => field.property && !labels[field.property])
      .forEach((field) => {
        labels[field.property] = field.rejectionLabel || field.label;
      });
    return labels;
  });

  // rejection

  const canReject = computed(() => product.value?.status === 'pending');

  const rejectionReasons = ref([]);
  const showRejectionErrors = ref(false);

  const isPropertyRejected = (property) =>
    rejectionReasons.value.some((reason) => reason.property === property);

  const toggleRejection = ({ property, label, rejectionLabel }) => {
    if (isPropertyRejected(property)) {
      rejectionReasons.value = rejectionReasons.value.filter(
        (reason) => reason.property !== property,
      );
      return;
    }

    rejectionReasons.value.push({
      property,
      label: rejectionLabel || label,
      message: '',
    });
  };

  const hasEmptyRejectionMessage = computed(() =>
    rejectionReasons.value.some((reason) => !reason.message.trim()),
  );

  const submitRejection = async () => {
    showRejectionErrors.value = true;
    if (!rejectionReasons.value.length || hasEmptyRejectionMessage.value)
      return;

    await rejectExecute(product.value._id, {
      rejectionReasons: rejectionReasons.value.map(({ property, message }) => ({
        property,
        message: message.trim(),
      })),
    });
    // error toast handled by the http interceptor
    if (rejectFailed.value) return;

    toast.success('کالا با موفقیت رد شد');
    rejectionReasons.value = [];
    showRejectionErrors.value = false;
    fetchProduct(route.params.id);
  };

  // media

  const imageMedia = computed(() => {
    const mainImage = product.value?.images?.main;
    const galleryImages = product.value?.images?.gallery || [];

    return [mainImage, ...galleryImages]
      .filter(Boolean)
      .map((image) => ({
        type: 'image',
        src: image,
        title:
          typeof image === 'string'
            ? 'تصویر کالا'
            : image.titleFa || image.titleEn || 'تصویر کالا',
      }))
      .filter((item) => item.src);
  });

  const videoMedia = computed(() => {
    if (!Array.isArray(product.value?.videos)) return [];

    return product.value.videos
      .map((video) => {
        if (!video) return null;

        return {
          type: 'video',
          src: video,
          title: 'ویدیو',
        };
      })
      .filter(Boolean);
  });

  const mediaItems = computed(() => [...imageMedia.value, ...videoMedia.value]);
</script>

<style scoped lang="scss">
  .product-details {
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

    &__subtitle {
      @include typography(label-medium);
      color: var(--palette-text-on-main-30);
    }

    &__skeletons {
      @include flex(column);
      gap: space(3);
    }

    &__error {
      border: 1px dashed var(--palette-border-10);
      border-radius: $radius-2x;
      padding: space(6);
      text-align: center;
      color: var(--palette-error);
    }

    &__grid {
      @include flex(column);
      width: 100%;
      gap: space(3);
    }

    &__section {
      width: 100%;
      border: 1px solid var(--palette-border-10);
      border-radius: $radius-2x;
      padding: space(4);
      background: var(--palette-background);
      @include flex(column);
      gap: space(3);
    }

    &__section-title {
      @include typography(label-medium);
      font-weight: 900;
      color: var(--palette-text-on-main-10);
      margin: 0;
    }

    &__fields {
      @include flex(row);
      width: 100%;
      flex-wrap: wrap;
      gap: space(4);
    }

    &__field {
      width: calc(50% - 8px);
      border: 1px solid var(--palette-border-10);
      border-radius: $radius-1x;
      padding: space(2);
      @include flex($align: center);
      gap: space(2);
      background: rgba(var(--palette-background-rgb), 0.65);
      transition: border-color 0.15s ease;

      &--rejected {
        border-color: var(--palette-error);
      }
    }

    &__field-content {
      flex: 1;
      min-width: 0;
      @include flex(column);
      gap: space(1);
    }

    &__label-row {
      @include flex($align: center, $justify: space-between);
      gap: space(2);
    }

    &__media-toggles {
      @include flex($align: center);
      gap: space(4);
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

    &__badges {
      @include flex($align: center, $wrap: wrap);
      gap: space(1);
    }

    &__badge {
      padding: space(0.5) space(2);
      border-radius: $radius-1x;
      background-color: rgba(var(--palette-primary-rgb), 0.12);
      color: var(--palette-primary);
      @include typography(label-small);
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

    &__description {
      @include typography(body-medium);
      color: var(--palette-text-on-main-20);
      margin: 0;
      line-height: 1.8;
    }

    &__reasons {
      width: 100%;
      @include flex(column, $align: stretch);
      gap: space(2);

      @include media-query(medium) {
        @include flex(row, $wrap: wrap, $align: stretch);
      }
    }

    &__reason {
      @include flex(column);
      gap: space(1);

      @include media-query(medium) {
        flex: 1 1 calc(50% - #{space(1)});
        min-width: 0;
      }

      padding: space(2);
      border-inline-start: 3px solid var(--palette-error);
      border-radius: $radius-1x;
      background: rgba(var(--palette-error-rgb), 0.06);
    }

    &__reason-label {
      @include typography(label-medium);
      color: var(--palette-error);
    }

    &__rejection {
      border-color: var(--palette-error);
    }

    &__rejection-empty {
      @include typography(body-small);
      color: var(--palette-text-on-main-40);
    }

    &__rejection-row {
      width: 100%;
      @include flex($align: center);
      gap: space(3);
    }

    &__rejection-label {
      flex: 0 0 160px;
      @include typography(body-medium);
      color: var(--palette-text-on-main-10);
    }

    &__rejection-input {
      flex: 1;
      min-width: 0;
    }

    &__rejection-error {
      @include typography(body-small);
      color: var(--palette-error);
    }

    &__rejection-actions {
      @include flex($justify: flex-end);
    }

    &__reject-button {
      min-width: 120px;
      background-color: var(--palette-error);
    }
  }
</style>
