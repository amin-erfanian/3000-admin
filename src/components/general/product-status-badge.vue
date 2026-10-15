<template>
  <span :class="badgeClass">
    {{ label }}
  </span>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    status: {
      type: String,
      required: true,
    },
  });

  // statuses shared by the product and brand models
  const config = {
    approved: {
      label: 'تایید شده',
      class: 'status-badge--success',
    },
    pending: {
      label: 'در انتظار تایید',
      class: 'status-badge--warning',
    },
    rejected: {
      label: 'رد شده',
      class: 'status-badge--error',
    },
    draft: {
      label: 'پیش‌نویس',
      class: 'status-badge--neutral',
    },
  };

  const badge = computed(
    () =>
      config[props.status] || {
        label: props.status,
        class: 'status-badge--neutral',
      },
  );

  const label = computed(() => badge.value.label);
  const badgeClass = computed(() => `status-badge ${badge.value.class}`);
</script>

<style scoped lang="scss">
  .status-badge {
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    display: inline-block;
    white-space: nowrap;

    &--success {
      color: var(--palette-success-shade);
      background: rgba(var(--palette-success-rgb), 0.15);
    }

    &--warning {
      color: var(--palette-warning);
      background: color-mix(in srgb, var(--palette-warning) 15%, transparent);
    }

    &--error {
      color: var(--palette-error);
      background: rgba(var(--palette-error-rgb), 0.12);
    }

    &--neutral {
      color: var(--palette-text-on-main-30);
      background: var(--palette-text-on-minor-40);
    }
  }
</style>
