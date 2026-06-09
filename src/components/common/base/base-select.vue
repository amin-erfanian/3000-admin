<template>
  <div ref="selectRoot" class="custom-select">
    <div
      ref="selectTrigger"
      class="custom-select__selected"
      :class="{ 'custom-select__selected--open': open }"
      @click="toggleDropdown"
    >
      <p>{{ selectedText }}</p>
      <BaseIcon
        icon-name="arrow-right"
        class="custom-select__arrow-icon"
        :class="open ? 'custom-select__arrow-icon--open' : ''"
      />
    </div>

    <Teleport :to="resolvedTeleportTo">
      <div
        v-if="open"
        ref="dropdownRef"
        class="custom-select__options custom-select__options--open"
        :style="dropdownStyle"
      >
        <div
          v-for="option of options"
          :key="getOptionValue(option) || getOptionLabel(option)"
          class="custom-select__option"
          :class="{ 'custom-select__option--selected': isSelected(option) }"
          @click="selectOption(option)"
        >
          {{ getOptionLabel(option) }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
  import { ref, computed, nextTick, onBeforeUnmount } from 'vue';
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
    multiple: {
      type: Boolean,
      default: false,
    },
    optionLabel: {
      type: String,
      default: 'name',
    },
    optionValue: {
      type: String,
      default: 'value',
    },
    teleportTo: {
      type: String,
      default: 'auto',
    },
    modelValue: {
      type: [Object, Array, String, Number],
      default: null,
    },
  });

  const open = ref(false);
  const selectRoot = ref(null);
  const selectTrigger = ref(null);
  const dropdownRef = ref(null);
  const dropdownStyle = ref({});
  const resolvedTeleportTo = ref('body');

  const getOptionLabel = (option) => {
    if (!option || typeof option !== 'object') return String(option || '');
    return (
      option[props.optionLabel] ?? option.name ?? String(option.value ?? '')
    );
  };

  const getOptionValue = (option) => {
    if (!option || typeof option !== 'object') return option;
    return option[props.optionValue] ?? option.value ?? option.name;
  };

  const selectedOptions = computed({
    get: () => (Array.isArray(props.modelValue) ? props.modelValue : []),
    set: (value) => emits('update:modelValue', value),
  });

  const selectedOption = computed({
    get: () => props.modelValue,
    set: (value) => emits('update:modelValue', value),
  });

  const selectedText = computed(() => {
    if (props.multiple) {
      if (!selectedOptions.value.length) return props.label;
      return `${selectedOptions.value.length} مورد انتخاب شده`;
    }

    return selectedOption.value
      ? getOptionLabel(selectedOption.value)
      : props.label;
  });

  const isSelected = (option) => {
    if (props.multiple) {
      return selectedOptions.value.some(
        (selected) => getOptionValue(selected) === getOptionValue(option),
      );
    }

    return getOptionValue(selectedOption.value) === getOptionValue(option);
  };

  const updateDropdownPosition = () => {
    if (!selectTrigger.value) return;

    const triggerRect = selectTrigger.value.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 240;
    const margin = 8;
    const dropdownMinWidth = triggerRect.width;
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const openUp = spaceBelow < dropdownHeight && triggerRect.top > spaceBelow;

    let top = openUp
      ? Math.max(margin, triggerRect.top - dropdownHeight - 4)
      : triggerRect.bottom + 4;

    let right = viewportWidth - triggerRect.right;
    right = Math.max(margin, right);

    if (top + dropdownHeight > viewportHeight - margin) {
      top = Math.max(margin, viewportHeight - dropdownHeight - margin);
    }

    dropdownStyle.value = {
      position: 'fixed',
      top: `${top}px`,
      right: `${right}px`,
      left: 'auto',
      transform: 'none',
      width: `fit-content`,
      minWidth: `${dropdownMinWidth}px`,
      maxWidth: `calc(100vw - ${margin * 2}px)`,
      maxHeight: `${dropdownHeight}px`,
      zIndex: 3000,
    };
  };

  const resolveTeleportTarget = () => {
    if (props.teleportTo && props.teleportTo !== 'auto') {
      resolvedTeleportTo.value = props.teleportTo;
      return;
    }

    const parentDialog = selectRoot.value?.closest('dialog');
    resolvedTeleportTo.value = parentDialog || 'body';
  };

  const toggleDropdown = async () => {
    open.value = !open.value;
    if (!open.value) return;
    resolveTeleportTarget();
    await nextTick();
    updateDropdownPosition();
  };

  const selectOption = (option) => {
    if (props.multiple) {
      const exists = isSelected(option);
      if (exists) {
        selectedOptions.value = selectedOptions.value.filter(
          (selected) => getOptionValue(selected) !== getOptionValue(option),
        );
      } else {
        selectedOptions.value = [...selectedOptions.value, option];
      }
      return;
    }

    selectedOption.value = option;
    open.value = false;
  };

  const closeDropdown = () => {
    open.value = false;
  };

  const handleOutsidePointer = (event) => {
    if (!open.value) return;

    const target = event.target;
    const inTrigger = selectRoot.value?.contains(target);
    const inDropdown = dropdownRef.value?.contains(target);
    if (inTrigger || inDropdown) return;

    closeDropdown();
  };

  const handleViewportChange = () => {
    if (!open.value) return;
    updateDropdownPosition();
  };

  window.addEventListener('pointerdown', handleOutsidePointer);
  window.addEventListener('resize', handleViewportChange);
  window.addEventListener('scroll', handleViewportChange, true);

  onBeforeUnmount(() => {
    window.removeEventListener('pointerdown', handleOutsidePointer);
    window.removeEventListener('resize', handleViewportChange);
    window.removeEventListener('scroll', handleViewportChange, true);
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
      border: 2px solid var(--palette-border-10);
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
      position: fixed;
      box-sizing: border-box;
      color: var(--palette-text-on-main-30);
      background-color: var(--palette-background);
      border-radius: 0px 0px $radius-2x $radius-2x;
      border: 1px solid var(--palette-border-10);
      max-height: 240px;
      overflow-y: auto;
      overflow-x: hidden;
      white-space: nowrap;
      box-shadow: 0px 4px 14px var(--palette-background-shadow);
      opacity: 1;
      transform: translateY(0);
      transition: none;

      &--open {
        opacity: 1;
      }
    }

    &__option {
      background-color: transparent;
      padding: space(3) space(4);
      cursor: pointer;
      user-select: none;
      word-break: break-word;

      &:not(:last-child) {
        border-bottom: 1px solid var(--palette-border-10);
      }

      &--selected {
        color: #fafafa;
        background-color: var(--palette-primary);
      }
    }
  }
</style>
