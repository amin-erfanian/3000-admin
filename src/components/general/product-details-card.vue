<template>
  <div class="product-details-card" dir="rtl">
    <div class="product-details-card__header">
      <h3 class="product-details-card__title">
        {{ product.titleFa || product.titleEn || '—' }}
      </h3>
      <ProductStatusBadge :status="product.status || 'draft'" />
    </div>

    <div class="product-details-card__meta-id">{{ product._id || product.id || '—' }}</div>

    <div class="product-details-card__content">
      <div class="product-details-card__media">
        <div class="product-details-card__media-title">رسانه‌های کالا</div>
        <ProductMediaSlider :media-items="mediaItems" />
      </div>

      <div class="product-details-card__fields">
        <div class="product-details-card__field">
          <span class="product-details-card__label">برند</span>
          <span class="product-details-card__value">{{ product.brand?.titleFa || '—' }}</span>
        </div>

        <div class="product-details-card__field">
          <span class="product-details-card__label">دسته‌بندی</span>
          <span class="product-details-card__value">{{ product.category?.titleFa || '—' }}</span>
        </div>

        <div class="product-details-card__field">
          <span class="product-details-card__label">کمیسیون</span>
          <span class="product-details-card__value">{{ normalizeValue(product.commission) }}</span>
        </div>

        <div class="product-details-card__field">
          <span class="product-details-card__label">ابعاد</span>
          <span class="product-details-card__value">{{ dimensionsText }}</span>
        </div>

        <div class="product-details-card__field">
          <span class="product-details-card__label">اصالت کالا</span>
          <span class="product-details-card__value">
            {{ product.properties?.isFake ? 'غیراصل' : 'اصل' }}
          </span>
        </div>

        <div class="product-details-card__field">
          <span class="product-details-card__label">وزن</span>
          <span class="product-details-card__value">{{ normalizeValue(product.weight) }}</span>
        </div>

        <div class="product-details-card__field">
          <span class="product-details-card__label">عنوان فارسی</span>
          <span class="product-details-card__value">{{ product.titleFa || '—' }}</span>
        </div>

        <div class="product-details-card__field">
          <span class="product-details-card__label">عنوان انگلیسی</span>
          <span class="product-details-card__value">{{ product.titleEn || '—' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';

  import ProductStatusBadge from '@/components/general/product-status-badge.vue';
  import ProductMediaSlider from '@/components/general/product-media-slider.vue';

  const props = defineProps({
    product: {
      type: Object,
      required: true,
    },
  });

  const normalizeValue = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    return value;
  };

  const dimensionsText = computed(() => {
    const length = props.product.dimensions?.length;
    const width = props.product.dimensions?.width;
    const height = props.product.dimensions?.height;

    if ([length, width, height].every((value) => value !== null && value !== undefined)) {
      return `${length} × ${width} × ${height}`;
    }

    return '—';
  });

  const imageMedia = computed(() => {
    const mainImage = props.product.images?.main ? [props.product.images.main] : [];
    const galleryImages = Array.isArray(props.product.images?.gallery)
      ? props.product.images.gallery
      : [];

    return [...mainImage, ...galleryImages]
      .filter(Boolean)
      .map((image) => ({
        type: 'image',
        src: typeof image === 'string' ? image : image.src || image.url || image.path || image.image,
        thumb:
          typeof image === 'string'
            ? image
            : image.thumb || image.thumbnail || image.poster || image.src || image.url || image.path,
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

        if (typeof video === 'string') {
          return {
            type: 'video',
            src: video,
            thumb: '/images/placeholder.png',
            title: 'ویدیو',
          };
        }

        const src =
          video.src ||
          video.url ||
          video.path ||
          video.video ||
          video.file ||
          '';

        if (!src) return null;

        return {
          type: 'video',
          src,
          thumb:
            video.poster ||
            video.thumbnail ||
            video.image ||
            '/images/placeholder.png',
          title: video.titleFa || video.titleEn || 'ویدیو',
        };
      })
      .filter(Boolean);
  });

  const mediaItems = computed(() => [...imageMedia.value, ...videoMedia.value]);
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
      @include typography(label-small);
      color: var(--palette-text-on-main-40);
      word-break: break-all;
    }

    &__content {
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
  }
</style>
