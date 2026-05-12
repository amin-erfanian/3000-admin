<template>
  <div class="custom-select" v-click-outside="closeDropdown">
    <div
      class="custom-select__selected"
      :class="{ 'custom-select__selected--open': open }"
      @click="open = !open"
    >
      <p>{{ selectedOption?.name || label }}</p>
      <BaseIcon
        icon-name="arrow-right"
        class="custom-select__arrow-icon"
        :class="open ? 'custom-select__arrow-icon--open' : ''"
      />
    </div>
    <div
      class="custom-select__options"
      :class="{ 'custom-select__options--open': open }"
      ref="selectOptions"
    >
      <div
        v-for="option of options"
        :key="option.name"
        class="custom-select__option"
        @click="selectOption(option)"
      >
        {{ option.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import BaseIcon from '@/components/common/base/base-icon.vue';

  const emits = defineEmits(['update:modelValue']);
  const props = defineProps({
    options: {
      type: Array,
      required: true,
    },
    label: {
      type: String,
      default: 'انتخاب کنید',
    },
    modelValue: {
      type: Object,
      default: null,
    },
  });

  const open = ref(false);
  const selectOptions = ref(null);

  // Computed property to handle the selected option
  const selectedOption = computed({
    get: () => props.modelValue,
    set: (value) => emits('update:modelValue', value),
  });

  const selectOption = (option) => {
    selectedOption.value = option;
    open.value = false;
  };

  const closeDropdown = () => {
    open.value = false;
  };

  onMounted(() => {
    emits('update:modelValue', selectedOption.value);
  });
</script>

<style lang="scss" scoped>
  .custom-select {
    position: relative;
    width: 100%;
    height: fit-content;
    outline: none;

    &__selected {
      @include flex($align: center, $justify: space-between);
      gap: space();
      position: relative;
      background-color: transparent;
      border-radius: $radius-2x;
      color: var(--palette-text-on-main-10);
      padding: space() space(2);
      cursor: pointer;
      user-select: none;
    }

    &__arrow-icon {
      transform: rotate(90deg);
      transition: transform 0.3s ease;
      color: var(--palette-text-on-main-10);
      width: 16px;
      height: 16px;
    }

    &__arrow-icon--open {
      transform: rotate(-90deg);
    }

    &__options {
      position: absolute;
      visibility: hidden;
      left: 0;
      right: 0;
      z-index: 10;
      color: var(--palette-text-on-main-30);
      background-color: var(--palette-background);
      border-radius: 0px 0px $radius-2x $radius-2x;
      opacity: 0;
      transform: translateY(-10px);
      transition-property: visibility, transform, opacity;
      transition-duration: 0.3s;
      transition-timing-function: ease-out;

      &--open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
        box-shadow: 0px 2px 4px var(--palette-background-shadow);
      }
    }

    &__option {
      background-color: transparent;
      padding: space(3) space(4);
      cursor: pointer;
      user-select: none;

      &:not(:last-child) {
        border-bottom: 1px solid var(--palette-border-10);
      }

      &:hover {
        background-color: var(--palette-container-background);
      }
    }
  }
</style>
