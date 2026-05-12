<template>
  <form autocomplete="one-time-code" class="otp-input">
    <!-- Hidden autofill input -->
    <input
      ref="autofillInput"
      type="tel"
      inputmode="numeric"
      name="one-time-code"
      autocomplete="one-time-code"
      class="otp-input__hidden"
      v-model="autoFilledOtp"
      @input="distributeOtp"
    />

    <!-- Your visible OTP inputs -->
    <input
      v-for="(digit, index) in digits"
      :key="index"
      v-model="digits[index]"
      :id="index"
      ref="inputs"
      type="tel"
      inputmode="numeric"
      maxlength="1"
      pattern="[0-9]*"
      class="otp-input__field"
      @input="handleInput(index, $event)"
      @keydown.delete="handleBackspace(index, $event)"
      @keydown.left="handleArrowKey(index, $event, -1)"
      @keydown.right="handleArrowKey(index, $event, 1)"
      @paste="handlePaste($event)"
      @focus="handleFocus(index)"
    />
  </form>
</template>

<script setup>
  import persianToEnglishDigits from '@/utilities/persian-to-english-digits.utilities';
  import { ref, watch, onMounted, nextTick } from 'vue';

  const props = defineProps({
    length: {
      type: Number,
      default: 5,
    },
    modelValue: {
      type: String,
      default: '',
    },
  });

  const emit = defineEmits(['update:modelValue', 'complete']);

  const digits = ref(Array(props.length).fill(''));
  const inputs = ref([]);

  // Initialize with modelValue if provided
  onMounted(() => {
    autofillInput.value?.focus();
    if (props.modelValue && props.modelValue.length === props.length) {
      digits.value = props.modelValue.split('');
    }
  });

  // Watch for changes in digits and emit the value
  watch(
    digits,
    (newDigits) => {
      const otp = newDigits.join('');
      emit('update:modelValue', otp);

      if (otp.length === props.length) {
        emit('complete', otp);
      }
    },
    { deep: true },
  );

  const handleInput = (index, event) => {
    const value = event.target.value;

    // Check if this looks like a paste operation (multiple characters)
    if (value.length > 1) {
      handlePasteFromInput(value, index);
      return;
    }

    // Only allow numeric values
    if (!/^[\u06F0-\u06F90-9]*$/.test(value)) {
      digits.value[index] = '';
      event.target.value = '';
      return;
    }

    const convertedDigit = persianToEnglishDigits(value);
    digits.value[index] = convertedDigit;
    event.target.value = convertedDigit;

    // Move to next field if a digit was entered
    if (convertedDigit && index < props.length - 1) {
      nextTick(() => {
        inputs.value[index + 1]?.focus();
      });
    }
  };

  const handleBackspace = (index, event) => {
    if (!digits.value[index] && index > 0) {
      // Move to previous field on backspace if current is empty
      event.preventDefault();
      nextTick(() => {
        inputs.value[index - 1]?.focus();
      });
    }
  };

  const handleArrowKey = (index, event, direction) => {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < props.length) {
      event.preventDefault();
      nextTick(() => {
        inputs.value[newIndex]?.focus();
      });
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasteData = event.clipboardData.getData('text/plain').trim();
    processPastedData(pasteData);
  };

  const handlePasteFromInput = (pastedValue, startIndex) => {
    // This handles paste detected from input event
    processPastedData(pastedValue, startIndex);
  };

  const processPastedData = (pasteData, startIndex = 0) => {
    // Convert Persian digits and remove non-digits
    const cleaned = persianToEnglishDigits(pasteData).replace(/\D/g, '');

    if (cleaned.length === 0) return;

    // Fill digits starting from the specified index
    const newDigits = [...digits.value];

    for (let i = 0; i < cleaned.length && startIndex + i < props.length; i++) {
      newDigits[startIndex + i] = cleaned[i];
    }

    // Update all digits at once
    digits.value = newDigits;

    // Update the actual input values to reflect the changes
    nextTick(() => {
      inputs.value.forEach((input, index) => {
        if (input) {
          input.value = digits.value[index];
        }
      });

      // Focus the appropriate field
      const focusIndex = Math.min(
        startIndex + cleaned.length,
        props.length - 1,
      );
      inputs.value[focusIndex]?.focus();
    });
  };

  const handleFocus = (index) => {
    // Select the text in the field when focused
    nextTick(() => {
      inputs.value[index]?.select();
    });
  };

  // Expose method to clear the OTP
  const clear = () => {
    digits.value = Array(props.length).fill('');
    nextTick(() => {
      inputs.value.forEach((input) => {
        if (input) input.value = '';
      });
      inputs.value[0]?.focus();
    });
  };

  defineExpose({ clear });

  const autoFilledOtp = ref('');
  const autofillInput = ref(null);

  const distributeOtp = () => {
    const cleaned = persianToEnglishDigits(autoFilledOtp.value).replace(
      /\D/g,
      '',
    );
    if (cleaned.length === props.length) {
      digits.value = cleaned.split('');
      nextTick(() => {
        // Update input values and focus last input
        inputs.value.forEach((input, index) => {
          if (input) {
            input.value = digits.value[index];
          }
        });
        inputs.value[props.length - 1]?.focus();
      });
    }
  };
</script>

<style lang="scss" scoped>
  .otp-input {
    direction: ltr;
    @include flex($justify: center);
    gap: space(2);

    &__field {
      color: var(--palette-text-on-main-10);
      width: calc(100% / 5);
      height: 56px;
      text-align: center;
      font-size: 24px;
      border: 1px solid var(--palette-border-10);
      border-radius: 8px;
      transition: all 0.2s ease;
      outline: none;

      &:focus {
        outline: none;
        border-color: var(--palette-secondary);
      }
    }

    &__hidden {
      position: absolute;
      top: 0;
      left: 0;
      height: 0;
      width: 0;
      opacity: 0;
    }
  }
</style>
