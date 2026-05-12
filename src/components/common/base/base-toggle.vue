<template>
  <label class="toggle-switch">
    <input
      :type="type"
      :id="id"
      :name="name"
      :checked="checked"
      :disabled="disabled"
      @change="$emit('change', $event)"
    />
    <span class="slider"></span>
  </label>
</template>

<script setup>
  const props = defineProps({
    checked: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: undefined,
    },
    name: {
      type: String,
      default: undefined,
    },
    type: {
      type: String,
      default: 'radio',
      validator: (v) => ['radio', 'checkbox'].includes(v),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  });

  defineEmits(['change']);
</script>

<style lang="scss" scoped>
  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 36px;
    height: 20px;
    min-width: 36px;
    flex-shrink: 0;

    input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: 0.4s;
      border-radius: 34px;

      &:before {
        position: absolute;
        content: '';
        height: 14px;
        width: 14px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.4s;
        border-radius: 50%;
      }
    }

    input:checked + .slider {
      background-color: var(--palette-primary);
    }

    input:checked + .slider:before {
      transform: translateX(16px);
    }
  }
</style>
