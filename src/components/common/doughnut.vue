<template>
  <svg :viewBox="`0 0 ${viewBoxSize} ${viewBoxSize}`">
    <g
      stroke-linecap="round"
      fill="none"
      :stroke-width="strokeWidth"
      @click="pieceClicked"
    >
      <path
        :class="pieceClassList(index)"
        v-for="(_, index) in pieceCount || divideBy"
        :data-index="index"
        :key="index"
        :d="pathDCalculation(index)"
      />
    </g>
  </svg>
</template>

<script>
  import { drawArc } from '@/utilities/chart';

  export default {
    name: 'doughnut-chart',
    props: {
      divideBy: {
        default: 7,
      },
      gap: {
        default: 10,
      },
      strokeWidth: {
        default: 18,
      },
      viewBoxSize: {
        default: 230,
      },
      radius: {
        default: 70,
      },
      highlightList: {
        type: Array,
        default: () => [0, 3, 4],
      },
      multiSelect: {
        type: Boolean,
        default: false,
      },
      pieceCount: Number,
      customClass: String,
      activeClass: String,
    },
    computed: {
      divisionSize() {
        return 360 / this.divideBy;
      },
      sideGap() {
        return this.gap / 2;
      },
    },
    methods: {
      pieceClassList(index) {
        const highlight = this.highlightList.indexOf(index) > -1;
        return ['piece', this.customClass, highlight ? 'highlight' : ''];
      },
      pieceClicked(event) {
        const piece = event.target;
        if (this.activeClass) {
          if (!this.multiSelect)
            event.currentTarget.children.forEach((aPiece) =>
              aPiece.classList.remove(this.activeClass),
            );
          piece.classList.toggle(this.activeClass);
        }

        this.$emit('select-piece', piece.dataset?.index);
      },
      pathDCalculation(index) {
        const startAngle = this.divisionSize * index + this.strokeWidth / 3;
        const endAngle =
          startAngle + (this.divisionSize - (this.strokeWidth / 3) * 2);

        return drawArc(
          this.viewBoxSize / 2,
          this.viewBoxSize / 2,
          this.radius,
          startAngle + this.sideGap,
          endAngle - this.sideGap,
        );
      },
    },
  };
</script>

<style lang="scss" scoped>
  .piece {
    cursor: pointer;
    stroke: var(--stroke-color, var(--divider-color));
  }
</style>
