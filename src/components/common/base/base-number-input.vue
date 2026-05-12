<template>
  <div class="digit-input-container" :style="{ width: width }">
    <input
      ref="input"
      type="text"
      :value="displayValue"
      @input="handleInput"
      class="digit-input"
      :style="{ width: hasArrows ? `calc(${width} - 40px)` : width }"
      :id="name"
    />
    <div class="arrows" v-if="hasArrows">
      <button @click="incrementValue" class="arrow-button">▲</button>
      <button @click="decrementValue" class="arrow-button">▼</button>
    </div>
  </div>
</template>

<script setup>
  import persianToEnglishDigits from '@/utilities/persian-to-english-digits.utilities';
  import { ref, defineProps, defineEmits, computed } from 'vue';

  const props = defineProps({
    width: {
      type: String,
      default: '100%',
    },
    modelValue: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      required: true,
    },
    hasArrows: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['update:modelValue']);
  const input = ref(null);

  function handleInput(event) {
    const inputValue = event.target.value;
    const filteredValue = inputValue.replace(/[^۰-۹0-9]/g, '');
    const convertedValue = persianToEnglishDigits(filteredValue);
    emit('update:modelValue', convertedValue);

    if (input.value) {
      input.value.value = convertedValue;
    }
  }

  function incrementValue() {
    const numericValue = parseInt(props.modelValue, 10) || 0;
    const newValue = (numericValue + 1).toString();
    emit('update:modelValue', newValue);
  }

  function decrementValue() {
    const numericValue = parseInt(props.modelValue, 10) || 0;
    const newValue = (numericValue - 1).toString();
    emit('update:modelValue', newValue);
  }

  const displayValue = computed(() => props.modelValue);
</script>

<style lang="scss" scoped>
  .digit-input-container {
    display: flex;
    align-items: center;
    overflow: hidden;
    width: v-bind('props.width');

    .arrows {
      display: flex;
      flex-direction: column;

      .arrow-button {
        border: none;
        background: none;
        cursor: pointer;
        font-size: 10px;
        color: var(--palette-icon);
      }
    }

    .digit-input {
      border: none;
      outline: none;
      flex-grow: 1;
      color: var(--palette-text-on-main-10);
    }
  }
</style>
