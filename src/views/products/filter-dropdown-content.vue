<template>
  <div class="dropdown">
    <div class="dropdown__header">
      <span>{{ filterItem.label }}</span>
      <button @click="$emit('close')">✕</button>
    </div>

    <div class="dropdown__content">
      <input
        v-model="search"
        type="text"
        placeholder="جستجو..."
        class="dropdown__search"
      />

      <div class="dropdown__items">
        <template v-if="filterItem.type === 'checkbox'">
          <BaseCheckbox
            v-for="item in filteredItems"
            :key="item.value"
            :name="item.value"
            v-model="model"
            :value="item.value"
            @change="emitChange"
          >
            {{ item.label }}
          </BaseCheckbox>
        </template>

        <template v-if="filterItem.type === 'radio'">
          <BaseRadio
            v-for="item in filteredItems"
            :key="item.value"
            :name="item.value"
            v-model="model"
            :value="item.value"
            @change="emitChange"
          >
            {{ item.label }}
          </BaseRadio>
        </template>
      </div>
    </div>

    <div class="dropdown__footer">
      <span class="text" @click="clear">حذف فیلتر</span>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import BaseCheckbox from '@/components/common/base/base-checkbox.vue';
  import BaseRadio from '@/components/common/base/base-radio.vue';

  const props = defineProps({
    filterItem: Object,
    modelValue: [Array, String],
  });

  const emit = defineEmits(['update:modelValue', 'change', 'close']);

  const search = ref('');

  const model = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
  });

  const filteredItems = computed(() => {
    if (!props.filterItem.items) return [];
    return props.filterItem.items.filter((i) => i.label.includes(search.value));
  });

  function clear() {
    if (Array.isArray(model.value)) model.value = [];
    else model.value = null;

    emitChange();
  }

  function emitChange() {
    emit('change');
  }
</script>

<style scoped lang="scss">
  .dropdown {
    width: 100%;

    &__header {
      @include flex($align: center, $justify: space-between);
      font-weight: bold;
      white-space: nowrap;
      border-bottom: 1px solid var(--palette-border-10);
      padding: space(4);
    }

    &__content {
      width: 100%;
      @include flex(column);
      gap: space(4);
      padding: space(4);
    }

    &__search {
      width: 100%;
      padding: 6px;
      border: 1px solid var(--palette-border-10);
      border-radius: space(2);
    }

    &__items {
      width: 100%;
      @include flex(column);
      gap: space(2);
      // max-height: 320px;
      // overflow-y: auto;
    }

    &__footer {
      width: 100%;
      @include flex($align: center, $justify: flex-end);
      padding: space(4);
      margin-right: auto;
      border-top: 1px solid var(--palette-border-10);
      color: var(--palette-primary);

      .text {
        @include typography(body-small);
        cursor: pointer;
      }
    }
  }
</style>
