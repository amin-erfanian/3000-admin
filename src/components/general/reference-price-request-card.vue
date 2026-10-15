<template>
  <div class="price-request-card" dir="rtl">
    <div class="price-request-card__header">
      <div class="price-request-card__headline">
        <h3 class="price-request-card__title">
          {{ product.titleFa || '—' }}
        </h3>
        <span v-if="product.code" class="price-request-card__code">
          کد: {{ product.code }}
        </span>
      </div>

      <div class="price-request-card__current">
        <span class="price-request-card__label">قیمت مرجع فعلی</span>
        <span class="price-request-card__current-value">
          {{ formatPrice(product.referencePrice) }} ریال
        </span>
      </div>
    </div>

    <div class="price-request-card__content">
      <div class="price-request-card__media">
        <img
          v-if="product.images?.main"
          :src="product.images.main"
          :alt="product.titleFa || 'تصویر کالا'"
        />
        <span v-else>بدون تصویر</span>
      </div>

      <div class="price-request-card__requests">
        <div class="price-request-card__requests-header">
          <span class="price-request-card__label">
            درخواست‌های دیده‌نشده ({{ requests.length }})
          </span>
          <button
            type="button"
            class="price-request-card__select-all"
            @click="toggleSelectAll"
          >
            {{ allSelected ? 'لغو انتخاب همه' : 'انتخاب همه' }}
          </button>
        </div>

        <div
          v-for="request in requests"
          :key="request._id"
          class="price-request-card__request"
        >
          <BaseCheckbox
            v-model="selectedRequestIds"
            :value="request._id"
            :name="`price-request-${request._id}`"
          >
            {{ formatPrice(request.offeredPrice) }} ریال
          </BaseCheckbox>

          <div class="price-request-card__request-meta">
            <span>{{ request.seller?.title || 'فروشنده نامشخص' }}</span>
            <span v-if="request.seller?.phone">{{ request.seller.phone }}</span>
            <span>{{ formatDate(request.createdAt) }}</span>
          </div>

          <button
            type="button"
            class="price-request-card__use-price"
            @click="newPrice = String(request.offeredPrice)"
          >
            استفاده از این قیمت
          </button>
        </div>

        <div class="price-request-card__actions">
          <BaseButton
            size="small"
            variant="outlined"
            class="price-request-card__action"
            :disabled="!selectedRequestIds.length || loading"
            @click="markWatched"
          >
            علامت‌گذاری به عنوان دیده‌شده
          </BaseButton>
        </div>
      </div>
    </div>

    <div class="price-request-card__price-form">
      <label
        class="price-request-card__label"
        :for="`reference-price-${productId}`"
      >
        قیمت مرجع جدید (ریال)
      </label>
      <div class="price-request-card__price-row">
        <div class="price-request-card__price-input">
          <BaseNumberInput
            v-model="newPrice"
            :name="`reference-price-${productId}`"
          />
        </div>
        <BaseButton
          size="small"
          class="price-request-card__action price-request-card__action--submit"
          :disabled="!newPrice || loading"
          @click="updatePrice"
        >
          ثبت قیمت مرجع
        </BaseButton>
      </div>
      <span v-if="newPrice" class="price-request-card__hint">
        {{ formatPrice(newPrice) }} ریال — با ثبت قیمت، همه درخواست‌ها دیده‌شده
        می‌شوند.
      </span>
    </div>
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue';

  import BaseButton from '@/components/common/base/base-button.vue';
  import BaseCheckbox from '@/components/common/base/base-checkbox.vue';
  import BaseNumberInput from '@/components/common/base/base-number-input.vue';

  const props = defineProps({
    product: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  });
  const emit = defineEmits(['mark-watched', 'update-price']);

  const selectedRequestIds = ref([]);
  const newPrice = ref('');

  const productId = computed(() => props.product._id || props.product.id);
  const requests = computed(() => props.product.referencePriceRequests ?? []);
  const allSelected = computed(
    () =>
      requests.value.length > 0 &&
      selectedRequestIds.value.length === requests.value.length,
  );

  const formatPrice = (value) => (Number(value) || 0).toLocaleString('fa-IR');
  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString('fa-IR') : '—';

  const toggleSelectAll = () => {
    selectedRequestIds.value = allSelected.value
      ? []
      : requests.value.map((request) => request._id);
  };

  const markWatched = () => {
    emit('mark-watched', {
      productId: productId.value,
      requestIds: [...selectedRequestIds.value],
    });
  };

  const updatePrice = () => {
    emit('update-price', {
      productId: productId.value,
      referencePrice: Number(newPrice.value),
    });
  };
</script>

<style scoped lang="scss">
  .price-request-card {
    width: 100%;
    padding: space(4);
    border: 1px solid var(--palette-border-10);
    border-radius: $radius-2x;
    background: var(--palette-background);
    @include flex(column);
    gap: space(3);

    &__header {
      @include flex($justify: space-between, $align: center, $wrap: wrap);
      gap: space(2);
    }

    &__headline {
      @include flex(column);
      gap: space(1);
    }

    &__title {
      @include typography(title-medium);
      color: var(--palette-text-on-main-10);
      margin: 0;
    }

    &__code {
      @include typography(label-medium);
      color: var(--palette-text-on-main-30);
    }

    &__current {
      @include flex(column);
      gap: space(1);
    }

    &__current-value {
      @include typography(body-large);
      font-weight: 700;
      color: var(--palette-text-on-main-10);
    }

    &__label {
      @include typography(label-small);
      color: var(--palette-text-on-main-40);
    }

    &__content {
      width: 100%;
      @include flex(column);
      gap: space(3);
    }

    &__media {
      width: 100%;
      max-width: 160px;
      height: 160px;
      border: 1px solid var(--palette-border-10);
      border-radius: $radius-2x;
      overflow: hidden;
      color: var(--palette-text-on-main-40);
      @include typography(body-small);
      @include flex($justify: center, $align: center);

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    &__requests {
      flex: 1;
      min-width: 0;
      @include flex(column);
      gap: space(2);
    }

    &__requests-header {
      @include flex($justify: space-between, $align: center);
    }

    &__select-all,
    &__use-price {
      @include typography(label-medium);
      color: var(--palette-primary);
      cursor: pointer;
      background: none;
      border: none;
    }

    &__request {
      border: 1px solid var(--palette-border-10);
      border-radius: $radius-1x;
      padding: space(2);
      @include flex($justify: space-between, $align: center, $wrap: wrap);
      gap: space(2);
    }

    &__request-meta {
      @include flex($align: center, $wrap: wrap);
      gap: space(3);
      @include typography(body-small);
      color: var(--palette-text-on-main-30);
    }

    &__actions {
      @include flex($justify: flex-end);
    }

    &__action {
      min-width: 120px;

      &--submit {
        background-color: var(--palette-success);
      }
    }

    &__price-form {
      border-top: 1px solid var(--palette-border-10);
      padding-top: space(3);
      @include flex(column);
      gap: space(2);
    }

    &__price-row {
      @include flex($align: center);
      gap: space(2);
    }

    &__price-input {
      flex: 1;
      max-width: 280px;
      border: 1px solid var(--palette-border-10);
      border-radius: $radius-1x;
      padding: space(2) space(3);
    }

    &__hint {
      @include typography(body-small);
      color: var(--palette-text-on-main-30);
    }
  }

  @include media-query(medium) {
    .price-request-card {
      &__content {
        @include flex(row);
        align-items: flex-start;
      }

      &__media {
        flex: 0 0 160px;
      }
    }
  }
</style>
