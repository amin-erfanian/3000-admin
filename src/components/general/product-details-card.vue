<template>
  <div class="product-details-card" dir="rtl">
    <div class="product-details-card__header">
      <h3 class="product-details-card__title">
        {{ product.titleFa || product.titleEn || '—' }}
      </h3>
      <ProductStatusBadge :status="product.status || 'draft'" />
    </div>

    <div v-if="product.titleEn" class="product-details-card__meta-id">{{
      product.titleEn
    }}</div>

    <div class="product-details-card__content">
      <div class="product-details-card__media">
        <div class="product-details-card__media-title">رسانه‌های کالا</div>
        <ProductMediaSlider :media-items="mediaItems" />
      </div>

      <div class="product-details-card__fields">
        <div class="product-details-card__field">
          <span class="product-details-card__label">برند</span>
          <span class="product-details-card__value">{{
            product.brand?.titleFa || '—'
          }}</span>
        </div>

        <div class="product-details-card__field">
          <span class="product-details-card__label">دسته‌بندی</span>
          <span class="product-details-card__value">{{
            product.category?.titleFa || '—'
          }}</span>
        </div>

        <div class="product-details-card__field">
          <span class="product-details-card__label">قیمت مرجع (ریال)</span>
          <span class="product-details-card__value">{{
            product.referencePrice || '—'
          }}</span>
        </div>

        <div class="product-details-card__field">
          <span class="product-details-card__label">کمیسیون</span>
          <span class="product-details-card__value">{{
            normalizeValue(product.commission)
          }}</span>
        </div>

        <div class="product-details-card__field">
          <span class="product-details-card__label">ابعاد (سانتی متر)</span>
          <span class="product-details-card__value">{{ dimensionsText }} </span>
        </div>

        <div class="product-details-card__field">
          <span class="product-details-card__label">اصالت کالا</span>
          <span class="product-details-card__value">
            {{ product.properties?.isFake ? 'غیراصل' : 'اصل' }}
          </span>
        </div>

        <div class="product-details-card__field">
          <span class="product-details-card__label">وزن (گرم)</span>
          <span class="product-details-card__value">{{
            normalizeValue(product.weight)
          }}</span>
        </div>
      </div>

      <div class="product-details-card__actions">
        <BaseButton
          size="small"
          class="product-details-card__action product-details-card__action--approve"
          @click="approveProduct"
        >
          تایید کالا
        </BaseButton>
        <BaseButton
          size="small"
          variant="outlined"
          class="product-details-card__action product-details-card__action--reject"
          @click="showRejectionModal = true"
        >
          رد کالا
        </BaseButton>
      </div>
    </div>

    <ProductRejectionModal
      v-model="showRejectionModal"
      :product="product"
      :property-options="rejectionPropertyOptions"
      @submit="submitRejection"
    />
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue';

  import BaseButton from '@/components/common/base/base-button.vue';
  import ProductStatusBadge from '@/components/general/product-status-badge.vue';
  import ProductMediaSlider from '@/components/general/product-media-slider.vue';
  import ProductRejectionModal from '@/components/general/product-rejection-modal.vue';

  const props = defineProps({
    product: {
      type: Object,
      required: true,
    },
  });
  const emit = defineEmits(['approve', 'reject']);

  const showRejectionModal = ref(false);

  const rejectionPropertyOptions = computed(() => [
    { name: 'عنوان کالا', value: 'titleFa' },
    { name: 'برند', value: 'brand' },
    { name: 'دسته‌بندی', value: 'category' },
    { name: 'کمیسیون', value: 'commission' },
    { name: 'ابعاد', value: 'dimensions' },
    { name: 'اصالت کالا', value: 'properties.isFake' },
    { name: 'وزن', value: 'weight' },
  ]);

  const normalizeValue = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    return value;
  };

  const dimensionsText = computed(() => {
    const length = props.product.dimensions?.length;
    const width = props.product.dimensions?.width;
    const height = props.product.dimensions?.height;

    if (
      [length, width, height].every(
        (value) => value !== null && value !== undefined,
      )
    ) {
      return `${length} (طول) × ${width} (عرض) × ${height} (ارتفاع)`;
    }

    return '—';
  });

  const imageMedia = computed(() => {
    const mainImage = props.product.images?.main;
    const galleryImages = props.product.images?.gallery;

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
    if (!Array.isArray(props.product.videos)) return [];

    return props.product.videos
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

  const approveProduct = () => {
    emit('approve', {
      productId: props.product._id || props.product.id,
    });
  };

  const submitRejection = ({ selectedProperties, hint }) => {
    emit('reject', {
      productId: props.product._id || props.product.id,
      reason: hint,
      propertyKeys: selectedProperties.map((item) => item.value),
    });
  };
</script>

<style scoped lang="scss">
  .product-details-card {
    width: 100%;
    padding: space(4);
    border: 1px solid var(--palette-border-10);
    border-radius: $radius-2x;
    background: var(--palette-background);
    @include flex(column);
    gap: space(3);

    &__header {
      @include flex($justify: space-between, $align: center);
      gap: space(2);
    }

    &__title {
      @include typography(title-medium);
      color: var(--palette-text-on-main-10);
      margin: 0;
    }

    &__meta-id {
      @include typography(label-medium);
      color: var(--palette-text-on-main-30);
      word-break: break-all;
    }

    &__content {
      width: 100%;
      @include flex(column);
      gap: space(3);
    }

    &__media {
      width: 100%;
    }

    &__media-title {
      @include typography(label-medium);
      color: var(--palette-text-on-main-20);
      margin-bottom: space(2);
    }

    &__fields {
      width: 100%;
      @include flex($justify: flex-start, $align: stretch);
      flex-wrap: wrap;
      gap: space(2);
    }

    &__field {
      flex: 1 1 240px;
      max-width: 100%;
      border: 1px solid var(--palette-border-10);
      border-radius: $radius-1x;
      padding: space(2);
      @include flex(column);
      gap: space(1);
      background: rgba(var(--palette-background-rgb), 0.65);
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

    &__actions {
      width: 100%;
      @include flex($align: center, $justify: flex-end);
      gap: space(2);
      margin-top: space(2);
    }

    &__action {
      min-width: 120px;

      &--reject {
        color: var(--palette-error);
        border-color: var(--palette-error);
      }

      &--approve {
        background-color: var(--palette-success);
      }
    }
  }
</style>
