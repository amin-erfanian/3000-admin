<template>
  <just-pdf-viewer :src="fileSrc" :rotatable="rotatable" :scalable="scalable" :lazyLoad="lazyLoad" />
</template>

<script setup>
  import JustPdfViewer from 'just-pdf-viewer';

  import 'just-pdf-viewer/es/style.css';

  import { computed } from 'vue';

  const props = defineProps({
    source: {
      type: String,
      required: true,
    },
    rotatable: {
      type: Boolean,
      default: false,
    },
    scalable: {
      type: Boolean,
      default: false,
    },
    lazyLoad: {
      type: Boolean,
      default: false,
    },
  });
  const fileSrc = computed(() => `data:application/pdf;base64,${props.source}`);
</script>

<style lang="scss">
  .pdf-page-canvas {
    direction: ltr;
    width: 100% !important;
    height: auto !important;
  }
  .pdf-canvas {
    @include hide-scrollbar();
  }
  .pdf-container .tool-bar {
    display: none !important;
  }
</style>
