<template>
  <div v-if="selectedItems.length" class="product-rejection-chips">
    <div
      v-for="item in selectedItems"
      :key="getItemValue(item)"
      class="product-rejection-chips__chip"
    >
      <span class="product-rejection-chips__text">{{
        getItemLabel(item)
      }}</span>
      <button
        type="button"
        class="product-rejection-chips__remove"
        @click="removeItem(item)"
      >
        <BaseIcon
          icon-name="close"
          class="product-rejection-chips__remove-icon"
        />
      </button>
    </div>
  </div>
</template>

<script setup>
  import BaseIcon from '@/components/common/base/base-icon.vue';

  const props = defineProps({
    selectedItems: {
      type: Array,
      default: () => [],
    },
    optionLabel: {
      type: String,
      default: 'name',
    },
    optionValue: {
      type: String,
      default: 'value',
    },
  });

  const emit = defineEmits(['remove']);

  const getItemLabel = (item) =>
    item?.[props.optionLabel] ?? item?.name ?? String(item ?? '');

  const getItemValue = (item) =>
    item?.[props.optionValue] ??
    item?.value ??
    item?.name ??
    String(item ?? '');

  const removeItem = (item) => emit('remove', item);
</script>

<style scoped lang="scss">
  .product-rejection-chips {
    width: 100%;
    @include flex($align: center, $justify: flex-start);
    flex-wrap: wrap;
    gap: space(2);

    &__chip {
      @include flex($align: center, $justify: center);
      gap: space(1);
      border-radius: $radius-2x;
      padding: space(1) space(2);
      background-color: var(--palette-container-background);
      color: var(--palette-text-on-main-20);
      border: 1px solid var(--palette-border-10);
    }

    &__text {
      @include typography(label-medium);
    }

    &__remove {
      border: none;
      cursor: pointer;
      background-color: transparent;
      color: var(--palette-text-on-main-30);
      @include flex($align: center, $justify: center);
    }

    &__remove-icon {
      width: 14px;
      height: 14px;
    }
  }
</style>
