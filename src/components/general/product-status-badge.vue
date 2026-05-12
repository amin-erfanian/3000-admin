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

  const config = {
    draft: {
      label: 'پیش نویس',
      class: 'badge-gray',
    },
    pending: {
      label: 'آماده انتشار',
      class: 'badge-yellow',
    },
    active: {
      label: 'تایید شده',
      class: 'badge-green',
    },
    inactive: {
      label: 'رد شده',
      class: 'badge-red',
    },
  };

  const badge = computed(() => config[props.status] || config.draft);

  const label = computed(() => badge.value.label);
  const badgeClass = computed(() => `status-badge ${badge.value.class}`);
</script>

<style scoped>
  .status-badge {
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    display: inline-block;
  }

  .badge-gray {
    background: #f3f4f6;
    color: #374151;
  }

  .badge-yellow {
    background: #fef3c7;
    color: #92400e;
  }

  .badge-green {
    background: #dcfce7;
    color: #166534;
  }

  .badge-red {
    background: #fee2e2;
    color: #991b1b;
  }
</style>
