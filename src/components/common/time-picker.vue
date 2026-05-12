<template>
  <div class="time-picker" :style="{ height: `${height}px` }">
    <custom-picker
      :items="minutes"
      :label="showLabels ? minuteLabel : ''"
      :modelValue="selectedMinute"
      :height="height"
      :width="width"
      @update:modelValue="onMinuteChange"
      class="time-picker__column"
    />
    <div class="time-picker__separator">:</div>
    <custom-picker
      :items="hours"
      :label="showLabels ? hourLabel : ''"
      :modelValue="selectedHour"
      :height="height"
      :width="width"
      @update:modelValue="onHourChange"
      class="time-picker__column"
    />
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted } from 'vue';
  import CustomPicker from './custom-picker.vue';

  const props = defineProps({
    modelValue: {
      type: Object,
      default: () => ({ hour: 0, minute: 0 }),
    },
    height: {
      type: Number,
      default: 150,
    },
    width: {
      type: Number,
      default: 50,
    },
    showLabels: {
      type: Boolean,
      default: false,
    },
    hourLabel: {
      type: String,
      default: 'ساعت',
    },
    minuteLabel: {
      type: String,
      default: 'دقیقه',
    },
  });

  const emit = defineEmits(['update:modelValue']);

  // Generate hours array (00-23)
  const hours = computed(() =>
    Array.from({ length: 24 }, (_, i) => ({
      label: i === 0 ? '00' : String(i),
      value: i,
    })),
  );

  // Generate minutes array (00-59)
  const minutes = computed(() =>
    Array.from({ length: 60 }, (_, i) => ({
      label: i === 0 ? '00' : String(i),
      value: i,
    })),
  );

  // Internal selected values
  const selectedHour = ref({ label: '00', value: 0 });
  const selectedMinute = ref({ label: '00', value: 0 });

  // Initialize from modelValue
  onMounted(() => {
    if (props.modelValue) {
      const hourItem = hours.value.find(
        (h) => h.value === props.modelValue.hour,
      );
      const minuteItem = minutes.value.find(
        (m) => m.value === props.modelValue.minute,
      );

      if (hourItem) selectedHour.value = hourItem;
      if (minuteItem) selectedMinute.value = minuteItem;
    }
  });

  // Watch external modelValue changes
  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal) {
        const hourItem = hours.value.find((h) => h.value === newVal.hour);
        const minuteItem = minutes.value.find((m) => m.value === newVal.minute);

        if (hourItem && hourItem.value !== selectedHour.value.value) {
          selectedHour.value = hourItem;
        }
        if (minuteItem && minuteItem.value !== selectedMinute.value.value) {
          selectedMinute.value = minuteItem;
        }
      }
    },
    { deep: true },
  );

  // Handle hour change
  const onHourChange = (newHour) => {
    selectedHour.value = newHour;
    emitUpdate();
  };

  // Handle minute change
  const onMinuteChange = (newMinute) => {
    selectedMinute.value = newMinute;
    emitUpdate();
  };

  // Emit combined time update
  const emitUpdate = () => {
    emit('update:modelValue', {
      hour: selectedHour.value.value,
      minute: selectedMinute.value.value,
    });
  };
</script>

<style scoped lang="scss">
  .time-picker {
    position: relative;
    @include flex($align: center, $justify: center);
    width: 100%;
    gap: space(2);

    &__column {
      flex: 1;
    }

    &__separator {
      @include flex($align: center, $justify: center);
      @include typography(title-large);
      font-weight: bold;
      color: var(--palette-text-on-main-10);
      height: 100%;
      padding: 0 space(2);
      z-index: 3;
    }
  }
</style>
