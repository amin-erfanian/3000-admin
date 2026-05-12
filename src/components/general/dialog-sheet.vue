<template>
  <BaseModal
    v-if="isDesktop"
    :model-value="modelValue"
    :title="title"
    :width="width"
    :height="height"
    :no-backdrop-dismiss="noBackdropDismiss"
    :content-with-padding="contentWithPadding"
    :teleport-to="teleportTo"
    :is-teleport-disabled="isTeleportDisabled"
    @update:model-value="update"
  >
    <template v-if="$slots.header" #header><slot name="header" /></template>
    <slot />
    <template v-if="$slots.footer" #footer><slot name="footer" /></template>
  </BaseModal>

  <BaseBottomSheet
    v-else
    :model-value="modelValue"
    :title="title"
    :height="sheetHeight"
    :has-handle="hasHandle"
    :is-rounded="isRounded"
    :no-scroll-bar="noScrollBar"
    :bar-color="barColor"
    :teleport-to="teleportTo"
    :is-teleport-disabled="isTeleportDisabled"
    @update:model-value="update"
  >
    <template v-if="$slots.header" #header><slot name="header" /></template>
    <slot />
    <template v-if="$slots.footer" #footer><slot name="footer" /></template>
  </BaseBottomSheet>
</template>

<script setup>
  import { computed } from 'vue';
  import BaseModal from '../common/base/base-modal.vue';
  import BaseBottomSheet from '../common/base/base-bottom-sheet.vue';
  import { useWindowSize } from '@/composables/useWindowSize.composable';

  defineOptions({ inheritAttrs: false });

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    title: { type: String },
    // modal-specific
    width: { type: String, default: '450px' },
    height: { type: String, default: 'auto' },
    noBackdropDismiss: { type: Boolean, default: false },
    contentWithPadding: { type: Boolean, default: true },
    // bottom-sheet-specific
    sheetHeight: { type: String, default: 'auto' },
    hasHandle: { type: Boolean, default: true },
    isRounded: { type: Boolean, default: true },
    noScrollBar: { type: Boolean, default: true },
    barColor: { type: String, default: '' },
    // shared
    teleportTo: { type: String, default: '#app' },
    isTeleportDisabled: { type: Boolean, default: false },
  });

  const emit = defineEmits(['update:modelValue']);

  const { width: windowWidth } = useWindowSize();
  const isDesktop = computed(() => windowWidth.value > 767);

  const update = (val) => emit('update:modelValue', val);
</script>
