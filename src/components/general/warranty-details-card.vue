<template>
  <div class="warranty-details-card" dir="rtl">
    <div class="warranty-details-card__header">
      <div class="warranty-details-card__headline">
        <h3 class="warranty-details-card__title">
          {{ warranty.name || '—' }}
        </h3>
        <span v-if="warranty.nameEn" class="warranty-details-card__meta">
          ({{ warranty.nameEn }})
        </span>
      </div>

      <ProductStatusBadge :status="warranty.status || 'pending'" />
    </div>

    <div class="warranty-details-card__content">
      <div class="warranty-details-card__media">
        <div
          v-for="side in imageSides"
          :key="side.key"
          class="warranty-details-card__image"
        >
          <img
            v-if="warranty.images?.[side.key]"
            :src="warranty.images[side.key]"
            :alt="side.label"
          />
          <span v-else>{{ side.label }}: بدون تصویر</span>
        </div>
      </div>

      <div class="warranty-details-card__details">
        <div class="warranty-details-card__fields">
          <div class="warranty-details-card__field">
            <span class="warranty-details-card__label">مدت اعتبار</span>
            <span class="warranty-details-card__value">{{
              durationLabel
            }}</span>
          </div>

          <div class="warranty-details-card__field">
            <span class="warranty-details-card__label">تاریخ ثبت</span>
            <span class="warranty-details-card__value">{{
              formatDate(warranty.createdAt)
            }}</span>
          </div>

          <div
            class="warranty-details-card__field warranty-details-card__field--full"
          >
            <span class="warranty-details-card__label">توضیحات</span>
            <span class="warranty-details-card__value">{{
              warranty.description || '—'
            }}</span>
          </div>
        </div>

        <div v-if="isPending" class="warranty-details-card__actions">
          <BaseButton
            size="small"
            class="warranty-details-card__action warranty-details-card__action--approve"
            :disabled="loading"
            @click="emit('approve', { warrantyId })"
          >
            تایید گارانتی
          </BaseButton>
          <BaseButton
            size="small"
            variant="outlined"
            class="warranty-details-card__action warranty-details-card__action--reject"
            :disabled="loading"
            @click="emit('reject', { warrantyId })"
          >
            رد گارانتی
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';

  import BaseButton from '@/components/common/base/base-button.vue';
  import ProductStatusBadge from '@/components/general/product-status-badge.vue';

  const props = defineProps({
    warranty: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['approve', 'reject']);

  const imageSides = [
    { key: 'front', label: 'روی کارت' },
    { key: 'back', label: 'پشت کارت' },
  ];

  const durationUnitLabels = { day: 'روز', month: 'ماه', year: 'سال' };

  const warrantyId = computed(() => props.warranty._id || props.warranty.id);
  const isPending = computed(() => props.warranty.status === 'pending');

  const durationLabel = computed(() => {
    const duration = props.warranty.duration;
    if (!duration?.value) return '—';
    const value = Number(duration.value).toLocaleString('fa-IR');
    return `${value} ${durationUnitLabels[duration.unit] ?? duration.unit}`;
  });

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString('fa-IR') : '—';
</script>

<style scoped lang="scss">
  .warranty-details-card {
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

    &__headline {
      @include flex($align: center, $wrap: wrap);
      gap: space(2);
    }

    &__title {
      @include typography(title-medium);
      color: var(--palette-text-on-main-10);
      margin: 0;
    }

    &__meta {
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
      @include flex($wrap: wrap);
      gap: space(2);
    }

    &__image {
      width: 160px;
      height: 110px;
      border: 1px solid var(--palette-border-10);
      border-radius: $radius-2x;
      background: rgba(var(--palette-background-rgb), 0.5);
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

    &__details {
      width: 100%;
      @include flex(column);
      gap: space(2);
    }

    &__fields {
      width: 100%;
      @include flex(column);
      gap: space(2);
    }

    &__field {
      width: 100%;
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
    .warranty-details-card {
      &__content {
        @include flex(row);
        align-items: flex-start;
      }

      &__media {
        flex: 0 0 auto;
      }

      &__details {
        flex: 1;
        min-width: 0;
        align-self: stretch;
      }

      &__fields {
        @include flex(row, $wrap: wrap, $align: flex-start);
      }

      &__field {
        width: calc(50% - #{space(1)});

        &--full {
          width: 100%;
        }
      }
    }
  }
</style>
