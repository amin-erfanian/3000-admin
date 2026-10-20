<template>
  <div class="product-details-card" dir="rtl">
    <div class="product-details-card__header">
      <h3 class="product-details-card__title">
        {{ product.titleFa || '—' }}
      </h3>
      <span v-if="product.titleEn" class="product-details-card__meta-id">
        ({{ product.titleEn }})
      </span>

      <ProductStatusBadge :status="product.status || 'draft'" />
    </div>

    <div class="product-details-card__content">
      <div class="product-details-card__media">
        <ProductMediaSlider :media-items="mediaItems" compact />
      </div>

      <div class="product-details-card__details">
        <div class="product-details-card__fields">
          <div class="product-details-card__field">
            <span class="product-details-card__label">نام فروشنده</span>
            <span class="product-details-card__value">{{
              product.createdBy?.title || '—'
            }}</span>
          </div>

          <div class="product-details-card__field">
            <span class="product-details-card__label">کد فروشنده</span>
            <span class="product-details-card__value">{{
              normalizeValue(product.createdBy?.code)
            }}</span>
          </div>

          <div class="product-details-card__field">
            <span class="product-details-card__label">کد کالا</span>
            <span class="product-details-card__value">{{
              product.code || '—'
            }}</span>
          </div>

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
            <span
              class="product-details-card__value product-details-card__value--editable"
            >
              {{ formatPrice(product.referencePrice) }}
              <button
                type="button"
                class="product-details-card__edit"
                aria-label="ویرایش قیمت مرجع"
                @click="showReferencePriceModal = true"
              >
                <BaseIcon iconName="edit" />
              </button>
            </span>
          </div>

          <div class="product-details-card__field">
            <span class="product-details-card__label">کمیسیون</span>
            <span class="product-details-card__value">
              {{ normalizeValue(product.category.commission) }}%
            </span>
          </div>

          <div class="product-details-card__field">
            <span class="product-details-card__label">ابعاد (سانتی متر)</span>
            <span class="product-details-card__value"
              >{{ dimensionsText }}
            </span>
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
      </div>
    </div>

    <div class="product-details-card__actions">
      <BaseButton
        size="small"
        class="product-details-card__action product-details-card__action--delete"
        @click="emit('delete', { productId: product._id || product.id })"
      >
        حذف کالا
      </BaseButton>
      <BaseButton
        size="small"
        variant="outlined"
        class="product-details-card__action"
        :disabled="!variantsCount"
        @click="goToVariantsPage"
      >
        تنوع‌های کالا ({{ variantsCount.toLocaleString('fa-IR') }})
      </BaseButton>
      <BaseButton
        size="small"
        class="product-details-card__action"
        @click="goToProductPage"
      >
        {{ isPending ? 'بررسی و عملیات' : 'مشخصات کالا' }}
      </BaseButton>
      <BaseButton
        v-if="isPending"
        size="small"
        class="product-details-card__action product-details-card__action--approve"
        @click="approveProduct"
      >
        تایید کالا
      </BaseButton>
    </div>

    <ReferencePriceModal
      v-model="showReferencePriceModal"
      :product="product"
      @updated="emit('reference-price-updated', $event)"
    />
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue';
  import { useRouter } from 'vue-router';

  import BaseButton from '@/components/common/base/base-button.vue';
  import BaseIcon from '@/components/common/base/base-icon.vue';
  import ProductStatusBadge from '@/components/general/product-status-badge.vue';
  import ProductMediaSlider from '@/components/general/product-media-slider.vue';
  import ReferencePriceModal from '@/components/general/reference-price-modal.vue';

  const props = defineProps({
    product: {
      type: Object,
      required: true,
    },
  });
  const emit = defineEmits(['approve', 'delete', 'reference-price-updated']);

  const router = useRouter();

  const showReferencePriceModal = ref(false);

  const isPending = computed(() => props.product.status === 'pending');
  const variantsCount = computed(() => props.product.variantsCount ?? 0);

  const formatPrice = (value) =>
    value ? Number(value).toLocaleString('fa-IR') : '—';

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

  const goToProductPage = () => {
    router.push({
      name: 'product-details',
      params: { id: props.product._id || props.product.id },
    });
  };

  const goToVariantsPage = () => {
    router.push({
      name: 'product-variants',
      params: { id: props.product._id || props.product.id },
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
      flex: 0 0 auto;
    }

    &__media-title {
      @include typography(label-medium);
      color: var(--palette-text-on-main-20);
      margin-bottom: space(2);
    }

    &__fields {
      width: 100%;
      @include flex(column);
      gap: space(2);
      flex: 1;
    }

    &__field {
      width: 100%;
      flex: none;
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

      &--editable {
        @include flex($align: center);
        gap: space(2);
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

    &__actions {
      width: 100%;
      @include flex($align: center, $justify: flex-end);
      gap: space(2);
      padding-top: space(3);
      border-top: 1px solid var(--palette-border-10);
    }

    &__details {
      width: 100%;
      @include flex(column);
      gap: space(2);
    }

    &__action {
      min-width: 120px;

      &--approve {
        background-color: var(--palette-success);
      }

      // pushed to the start (right side in RTL), away from the other actions
      &--delete {
        background-color: var(--palette-error);
        margin-inline-end: auto;
      }
    }
  }

  @include media-query(medium) {
    .product-details-card {
      &__content {
        @include flex(row);
        align-items: flex-start;
      }

      &__media {
        width: 280px;
        flex: 0 0 280px;
      }

      &__details {
        flex: 1;
        min-width: 0;
      }

      &__fields {
        @include flex(row, $wrap: wrap, $align: flex-start);
        gap: space(2);
      }

      &__field {
        width: calc(50% - #{space(1)});
      }
    }
  }
</style>
