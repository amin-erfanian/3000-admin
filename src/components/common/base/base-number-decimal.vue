<template>
  <input
    :value="displayValue"
    @input="onInput"
    type="text"
    inputmode="decimal"
    autocomplete="off"
    :placeholder="placeholder"
    class="number-input"
  />
</template>

<script setup>
  import { ref, watch, computed } from 'vue';

  import persianToEnglishDigitsUtilities from '@/utilities/persian-to-english-digits.utilities';
  import { formatNumberWithCommas } from '@/utilities/data-convertor.utilities';

  const props = defineProps({
    modelValue: String,
    allowDecimals: { type: Boolean, default: false },
    maxDecimals: {
      type: Number,
      default: 2,
      validator: (value) => value >= 0,
    },
    useCommas: { type: Boolean, default: true },
    placeholder: String,
  });

  const emit = defineEmits(['update:modelValue']);

  const rawInput = ref('');

  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal !== rawInput.value) {
        rawInput.value = newVal ?? '';
      }
    },
    { immediate: true },
  );

  const displayValue = computed(() => {
    let val = rawInput.value || '';
    if (props.useCommas && val) {
      val = formatNumberWithCommas(val, props.maxDecimals);
    }

    return val;
  });

  function cleanInput(input) {
    let english = persianToEnglishDigitsUtilities(input || '');
    english = english.replace(/,/g, ''); // remove commas

    if (!props.allowDecimals) {
      english = english.replace(/\./g, ''); // disallow dot if not allowed
      return english.replace(/[^\d]/g, ''); // only allow digits
    }

    // Allow digits and dots
    english = english.replace(/[^\d.]/g, '');

    // Handle multiple dots - only keep first one
    const parts = english.split('.');
    if (parts.length > 2) {
      english = parts[0] + '.' + parts.slice(1).join('');
    } else if (parts.length === 2) {
      // Enforce max decimals on the decimal part
      parts[1] = parts[1].slice(0, props.maxDecimals);
      english = parts[0] + '.' + parts[1];
    }

    // Prevent cases like ".123" by ensuring there's a digit before the dot
    if (english.startsWith('.') && english.length > 1) {
      english = '0' + english;
    }

    // Prevent multiple leading zeros
    if (english.startsWith('00') && english.length > 1) {
      english = english.substring(1);
    }

    return english;
  }

  function onInput(e) {
    let inputValue = e.target.value;
    const cleaned = cleanInput(inputValue); // Clean the input
    rawInput.value = cleaned; // Update the raw input value

    emit('update:modelValue', cleaned); // Emit the cleaned value
  }
</script>

<style scoped>
  .number-input {
    width: 100%;
  }
</style>
