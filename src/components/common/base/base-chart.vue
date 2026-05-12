<template>
  <div class="base-chart">
    <component
      :is="chartComponent"
      :data="data"
      :options="options"
      v-bind="$attrs"
    ></component>
  </div>
</template>

<script setup>
  import { defineAsyncComponent } from 'vue';
  import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    RadialLinearScale,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
  } from 'chart.js';

  const props = defineProps({
    data: {
      type: Object,
      default: () => {},
    },
    options: {
      type: Object,
      default: () => {},
    },
    type: {
      type: String,
      default: 'Line',
    },
    dataSetStyle: {
      type: Object,
      default: () => {},
    },
  });

  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    CategoryScale,
    LinearScale,
    ArcElement,
    RadialLinearScale,
    Filler,
    BarElement,
  );

  const chartComponent = defineAsyncComponent(
    async () => (await import('vue-chartjs'))[props.type],
  );
</script>

<style lang="scss" scoped>
  .base-chart {
    margin: 0 auto;
    @include flex($justify: center, $align: center);
    width: 100%;
  }
</style>
