<template>
  <label :class="['radio-button', { 'radio-button--checked': isChecked }]">
    <input
      type="radio"
      :value="value"
      :checked="isChecked"
      @change="handleChange"
      :name="name"
      :id="id"
      class="radio-button__input"
    />
    <span class="radio-button__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    value: {
      type: [String, Number, Boolean],
      required: true,
    },
    modelValue: {
      type: [String, Number, Boolean],
      default: null,
    },
    label: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      required: true,
    },
    id: {
      type: String,
    },
  });

  const emit = defineEmits(['update:modelValue']);

  const isChecked = computed(() => props.modelValue === props.value);

  const handleChange = () => {
    emit('update:modelValue', props.value);
  };
</script>

<style scoped>
  .radio-button {
    display: flex;
    align-items: center;
    cursor: pointer;
    margin: 5px 0;
  }

  .radio-button__input {
    appearance: none;
    width: 16px;
    height: 16px;
    border: 2px solid #ccc;
    border-radius: 50%;
    margin-right: 8px;
    position: relative;
    cursor: pointer;
  }

  .radio-button__input:checked {
    border-color: var(--palette-primary);
  }

  .radio-button__input:checked::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background-color: var(--palette-primary);
    border-radius: 50%;
  }

  .radio-button__label {
    font-size: 14px;
    color: #333;
  }

  .radio-button--checked .radio-button__label {
    color: var(--palette-primary); /* Change label color when checked */
    font-weight: bold;
  }
</style>
