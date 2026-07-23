<template>
  <div class="brand-details-card" dir="rtl">
    <div class="brand-details-card__header">
      <h3 class="brand-details-card__title">
        {{ brand.titleFa || '—' }}
      </h3>
      <span v-if="brand.titleEn" class="brand-details-card__meta-id">
        ({{ brand.titleEn }})
      </span>

      <ProductStatusBadge :status="brand.status || 'draft'" />
    </div>

    <div class="brand-details-card__content">
      <div class="brand-details-card__media">
        <div v-if="logoSrc" class="brand-details-card__logo">
          <img :src="logoSrc" :alt="brand.titleFa || 'لوگو برند'" />
        </div>
        <div
          v-else
          class="brand-details-card__logo brand-details-card__logo--empty"
        >
          <span>بدون لوگو</span>
        </div>
      </div>

      <div class="brand-details-card__details">
        <div class="brand-details-card__fields">
          <div class="brand-details-card__field">
            <span class="brand-details-card__label">عنوان فارسی</span>
            <span class="brand-details-card__value">{{
              brand.titleFa || '—'
            }}</span>
          </div>

          <div class="brand-details-card__field">
            <span class="brand-details-card__label">عنوان انگلیسی</span>
            <span class="brand-details-card__value">{{
              brand.titleEn || '—'
            }}</span>
          </div>
        </div>

        <div class="brand-details-card__actions">
          <BaseButton
            size="small"
            class="brand-details-card__action brand-details-card__action--approve"
            @click="approveBrand"
          >
            تایید برند
          </BaseButton>
          <BaseButton
            size="small"
            variant="outlined"
            class="brand-details-card__action brand-details-card__action--reject"
            @click="showRejectionModal = true"
          >
            رد برند
          </BaseButton>
        </div>
      </div>
    </div>

    <BrandRejectionModal
      v-model="showRejectionModal"
      :brand="brand"
      :property-options="rejectionPropertyOptions"
      @submit="submitRejection"
    />
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue';

  import BaseButton from '@/components/common/base/base-button.vue';
  import ProductStatusBadge from '@/components/general/product-status-badge.vue';
  import BrandRejectionModal from '@/components/general/brand-rejection-modal.vue';

  const props = defineProps({
    brand: {
      type: Object,
      required: true,
    },
  });
  const emit = defineEmits(['approve', 'reject']);

  const showRejectionModal = ref(false);

  const rejectionPropertyOptions = computed(() => [
    { name: 'عنوان فارسی', value: 'titleFa' },
    { name: 'عنوان انگلیسی', value: 'titleEn' },
    { name: 'لوگو', value: 'logo' },
  ]);

  const logoSrc = computed(() => {
    const logo = props.brand.logo;

    if (!logo) return null;
    if (typeof logo === 'string') return logo;

    return logo.src || logo.url || logo.path || null;
  });

  const approveBrand = () => {
    emit('approve', {
      brandId: props.brand._id || props.brand.id,
    });
  };

  const submitRejection = ({ selectedProperties, hint }) => {
    emit('reject', {
      brandId: props.brand._id || props.brand.id,
      reason: hint,
      propertyKeys: selectedProperties.map((item) => item.value),
    });
  };
</script>

<style scoped lang="scss">
  .brand-details-card {
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

    &__logo {
      width: 100%;
      max-width: 280px;
      height: 220px;
      border: 1px solid var(--palette-border-10);
      border-radius: $radius-2x;
      background: rgba(var(--palette-background-rgb), 0.5);
      overflow: hidden;
      @include flex($justify: center, $align: center);

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      &--empty {
        color: var(--palette-text-on-main-40);
        @include typography(body-small);
      }
    }

    &__details {
      width: 100%;
      @include flex(column);
      gap: space(2);
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
    }

    &__actions {
      width: 100%;
      @include flex($align: center, $justify: flex-end);
      gap: space(2);
      margin-top: auto;
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

  @include media-query(medium) {
    .brand-details-card {
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
        align-self: stretch;
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
