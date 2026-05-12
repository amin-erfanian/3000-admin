<template>
  <table class="table">
    <thead>
      <tr class="table__thead-row" v-if="data?.length">
        <td class="table__thead-cell">
          <slot name="row">ردیف</slot>
        </td>
        <td
          v-for="(header, index) in headerItems"
          :key="index"
          @click="sortByColumn(header)"
          class="table__thead-cell"
          :class="header.sort ? 'sortable' : ''"
        >
          {{ header.title }}
          <!-- <tooltip
            v-if="header.tooltipText"
            :content="header.tooltipText"
            :style="{ color: `var(${header.iconColor})` }"
          >
            <base-svg-loader :name="header.icon" />
          </tooltip> -->
        </td>
      </tr>
    </thead>
    <tbody>
      <tr v-if="!data?.length">
        <td colspan="20" class="table__no-content">
          <slot name="emptyContent"> هیچ اطلاعاتی برای نمایش وجود ندارد </slot>
        </td>
      </tr>
      <tr
        v-else
        v-for="(row, index) in sortedData"
        :key="index"
        class="table__tbody-row"
      >
        <td class="table__tbody-number">{{
          (currentPage - 1) * itemsPerPage + index + 1
        }}</td>
        <td
          v-for="(column, index) in headerItems"
          :key="index"
          class="table__tbody-cell"
        >
          <slot
            :name="`cell(${column.key})`"
            :value="row[column.key]"
            :item="row"
          >
            {{ row[column.key] }}</slot
          >
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
  import { ref, watch } from 'vue';

  // import BaseSvgLoader from '@/common/components/base/base-svg-loader.vue';
  // import tooltip from '@/common/components/general/tooltip.vue';

  const props = defineProps({
    headerItems: {
      type: Array,
      default: () => [],
    },
    data: {
      type: Array,
      default: () => [],
    },
    currentPage: {
      type: Number,
      required: true,
    },
    itemsPerPage: {
      type: Number,
      default: 10,
    },
  });

  watch(
    () => props.data,
    (newData) => {
      sortedData.value = [...newData];
    },
    { deep: true },
  );

  const sortedData = ref([...props.data]);
  const currentSortKey = ref(null);
  const currentSortOrder = ref(1);

  const sort = (a, b, header, order) => {
    if (typeof header.sort === 'function') return header.sort(a, b, order);
    return (
      (a[header.key].toLowerCase() > b[header.key].toLowerCase() ? 1 : -1) *
      order
    );
  };

  const sortByColumn = (header) => {
    if (!header.sort) return;
    if (currentSortKey.value === header.key) {
      currentSortOrder.value *= -1;
    } else {
      currentSortKey.value = header.key;
      currentSortOrder.value = 1;
    }
    sortedData.value = [...props.data].sort((a, b) =>
      sort(a, b, header, currentSortOrder.value),
    );
  };
</script>

<style lang="scss" scoped>
  .table {
    width: 100%;
    border-radius: $radius-1x;
    background-color: var(--palette-background);
    border-collapse: collapse;

    &__thead-row {
      background-color: var(--palette-primary);
    }

    &__thead-cell {
      color: #fafafa;
      @include typography(body-medium);
      padding: 10px;
      user-select: none;
      text-align: start;

      &:last-child {
        border-radius: $radius-1x 0 0 0;
      }
      &:first-child {
        border-radius: 0 $radius-1x 0 0;
      }

      &.sortable {
        cursor: pointer;
      }
    }

    &__tbody-row {
      @include typography(body-medium);
      color: var(--palette-text-on-main-10);

      &:nth-child(even) {
        background-color: #e4e4e4;
      }
      &:last-child {
        td {
          &:last-child {
            border-radius: 0.125rem 0.125rem 0.125rem $radius-1x;
          }

          &:first-child {
            border-radius: 0.125rem 0.125rem $radius-1x 0.125rem;
          }
        }
      }
      &:hover {
        background-color: #f9fafb;
      }
    }

    &__tbody-cell {
      padding: space(2.5);
      border-radius: 0.125rem;
      max-width: 418px;
      text-align: start;

      // &:last-child {
      //   text-align: center;
      // }
    }

    &__no-content {
      @include flex($align: center, $justify: center);
      padding: {
        top: space(10);
        bottom: space(20);
      }
    }

    &__tbody-number {
      text-align: center;
      width: 44px;
    }
  }
</style>
