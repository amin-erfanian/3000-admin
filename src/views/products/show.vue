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
          <ProductMediaSlider :media-items="mediaItems" />
        </section>

        <section class="product-details__section">
          <h3 class="product-details__section-title">اطلاعات کلی</h3>
          <div class="product-details__fields">
            <div class="product-details__field">
              <span class="product-details__label">عنوان فارسی</span>
              <span class="product-details__value">{{
                normalizeValue(product.titleFa)
              }}</span>
            </div>
            <div class="product-details__field">
              <span class="product-details__label">عنوان انگلیسی</span>
              <span class="product-details__value">{{
                normalizeValue(product.titleEn)
              }}</span>
            </div>
            <div class="product-details__field">
              <span class="product-details__label">شناسه (slug)</span>
              <span class="product-details__value">{{
                normalizeValue(product.slug)
              }}</span>
            </div>
            <div class="product-details__field">
              <span class="product-details__label">کد کالا</span>
              <span class="product-details__value">{{
                normalizeValue(product.code)
              }}</span>
            </div>
            <div class="product-details__field">
              <span class="product-details__label">SKU</span>
              <span class="product-details__value">{{
                normalizeValue(product.sku)
              }}</span>
            </div>
            <div class="product-details__field">
              <span class="product-details__label">قیمت مرجع (ریال)</span>
              <span class="product-details__value">{{
                normalizeValue(product.referencePrice)
              }}</span>
            </div>
            <div class="product-details__field">
              <span class="product-details__label"
                >حداقل تعداد در سبد خرید</span
              >
              <span class="product-details__value">{{
                normalizeValue(product.minBasketQuantity)
              }}</span>
            </div>
            <div class="product-details__field">
              <span class="product-details__label">وضعیت عرضه</span>
              <span class="product-details__value">{{
                marketStatusLabel
              }}</span>
            </div>
            <div class="product-details__field">
              <span class="product-details__label">امتیاز</span>
              <span class="product-details__value">
                {{ normalizeValue(product.rating?.average) }} ({{
                  normalizeValue(product.rating?.count)
                }}
                رای)
              </span>
            </div>
            <div class="product-details__field">
              <span class="product-details__label">اصالت کالا</span>
              <span class="product-details__value">
                {{ product.properties?.isFake ? 'غیراصل' : 'اصل' }}
              </span>
            </div>
            <div class="product-details__field">
              <span class="product-details__label">ارسال سریع</span>
              <span class="product-details__value">
                {{ product.properties?.isFastShipping ? 'دارد' : 'ندارد' }}
              </span>
            </div>
            <div class="product-details__field">
              <span class="product-details__label">تاریخ ایجاد</span>
              <span class="product-details__value">{{
                formatDate(product.createdAt)
              }}</span>
            </div>
            <div class="product-details__field">
              <span class="product-details__label">آخرین به‌روزرسانی</span>
              <span class="product-details__value">{{
                formatDate(product.updatedAt)
              }}</span>
            </div>
          </div>
        </section>

        <section class="product-details__section">
          <h3 class="product-details__section-title">برند و دسته‌بندی</h3>
          <div class="product-details__fields">
            <div class="product-details__field">
              <span class="product-details__label">برند</span>
              <span class="product-details__value">{{
                normalizeValue(product.brand?.titleFa)
              }}</span>
            </div>
            <div class="product-details__field">
              <span class="product-details__label">برند (انگلیسی)</span>
              <span class="product-details__value">{{
                normalizeValue(product.brand?.titleEn)
              }}</span>
            </div>
            <div class="product-details__field">
              <span class="product-details__label">دسته‌بندی</span>
              <span class="product-details__value">{{
                normalizeValue(product.category?.titleFa)
              }}</span>
            </div>
            <div class="product-details__field">
              <span class="product-details__label">دسته‌بندی (انگلیسی)</span>
              <span class="product-details__value">{{
                normalizeValue(product.category?.titleEn)
              }}</span>
            </div>
            <div class="product-details__field">
              <span class="product-details__label">کمیسیون</span>
              <span class="product-details__value">
                {{ normalizeValue(product.category?.commission) }}%
              </span>
            </div>
          </div>
        </section>

        <section class="product-details__section">
          <h3 class="product-details__section-title">فروشنده</h3>
          <div class="product-details__fields">
            <div class="product-details__field">
              <span class="product-details__label">نام فروشنده</span>
              <span class="product-details__value">{{
                normalizeValue(product.createdBy?.title)
              }}</span>
            </div>
            <div class="product-details__field">
              <span class="product-details__label">کد فروشنده</span>
              <span class="product-details__value">{{
                normalizeValue(product.createdBy?.code)
              }}</span>
            </div>
            <div class="product-details__field">
              <span class="product-details__label">شماره تماس</span>
              <span class="product-details__value">{{
                normalizeValue(product.createdBy?.phone)
              }}</span>
            </div>
          </div>
        </section>

        <section class="product-details__section">
          <h3 class="product-details__section-title">ابعاد و وزن</h3>
          <div class="product-details__fields">
            <div class="product-details__field">
              <span class="product-details__label">طول (سانتی متر)</span>
              <span class="product-details__value">{{
                normalizeValue(product.dimensions?.length)
              }}</span>
            </div>
            <div class="product-details__field">
              <span class="product-details__label">عرض (سانتی متر)</span>
              <span class="product-details__value">{{
                normalizeValue(product.dimensions?.width)
              }}</span>
            </div>
            <div class="product-details__field">
              <span class="product-details__label">ارتفاع (سانتی متر)</span>
              <span class="product-details__value">{{
                normalizeValue(product.dimensions?.height)
              }}</span>
            </div>
            <div class="product-details__field">
              <span class="product-details__label">وزن (گرم)</span>
              <span class="product-details__value">{{
                normalizeValue(product.weight)
              }}</span>
            </div>
          </div>
        </section>

        <section
          v-if="product.attributes?.length"
          class="product-details__section"
        >
          <h3 class="product-details__section-title">ویژگی‌های کالا</h3>
          <div class="product-details__fields">
            <div
              v-for="attr in product.attributes"
              :key="attr._id || attr.key"
              class="product-details__field"
            >
              <span class="product-details__label">{{ attr.label }}</span>
              <span class="product-details__value">{{
                normalizeValue(attr.value)
              }}</span>
            </div>
          </div>
        </section>

        <section v-if="product.description" class="product-details__section">
          <h3 class="product-details__section-title">توضیحات</h3>
          <p class="product-details__description">{{ product.description }}</p>
        </section>

        <section class="product-details__section">
          <h3 class="product-details__section-title">وضعیت بررسی</h3>
          <div class="product-details__fields">
            <div class="product-details__field">
              <span class="product-details__label">دلیل رد</span>
              <span class="product-details__value">{{
                normalizeValue(product.rejectionReason?.message)
              }}</span>
            </div>
          </div>

          <div
            v-if="product.rejectionIssues?.length"
            class="product-details__list"
          >
            <h4 class="product-details__list-title">موارد رد</h4>
            <ul>
              <li
                v-for="(issue, index) in product.rejectionIssues"
                :key="`issue-${index}`"
              >
                {{ issue }}
              </li>
            </ul>
          </div>

          <div
            v-if="product.approvalHistory?.length"
            class="product-details__list"
          >
            <h4 class="product-details__list-title">تاریخچه بررسی</h4>
            <ul>
              <li
                v-for="(entry, index) in product.approvalHistory"
                :key="`history-${index}`"
              >
                {{ entry }}
              </li>
            </ul>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup>
  import { computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { usePromise } from '@/composables';
  import { getProduct } from '@/services/product.service';
  import BaseIcon from '@/components/common/base/base-icon.vue';
  import BaseSkeleton from '@/components/common/base/base-skeleton.vue';
  import ProductStatusBadge from '@/components/general/product-status-badge.vue';
  import ProductMediaSlider from '@/components/general/product-media-slider.vue';

  const route = useRoute();
  const router = useRouter();

  const {
    data: product,
    loading,
    isRejected,
    execute: fetchProduct,
  } = usePromise(getProduct);

  onMounted(() => fetchProduct(route.params.id));

  const goBack = () => {
    router.push({ name: 'products' });
  };

  const normalizeValue = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    return value;
  };

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

    &__description {
      @include typography(body-medium);
      color: var(--palette-text-on-main-20);
      margin: 0;
      line-height: 1.8;
    }

    &__list {
      @include flex(column);
      gap: space(2);
    }

    &__list-title {
      @include typography(label-medium);
      color: var(--palette-text-on-main-20);
      margin: 0;
    }

    &__list ul {
      margin: 0;
      padding-inline-start: space(5);
      @include typography(body-medium);
      color: var(--palette-text-on-main-30);
    }
  }
</style>
