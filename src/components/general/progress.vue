<template>
  <div class="progress-container">
    <!-- Pie Progress -->
    <svg
      v-if="type === 'pie'"
      :width="size"
      :height="size"
      :viewBox="`0 0 ${size} ${size}`"
    >
      <!-- Background Circle (Gray) -->
      <circle :cx="center" :cy="center" :r="radius" fill="#77777710" />

      <!-- Full Circle when 100% -->
      <circle
        v-if="percentage === 100"
        :cx="center"
        :cy="center"
        :r="radius"
        fill="#7fc97f"
      />

      <!-- Progress Pie Slice (Green) -->
      <path v-else-if="percentage > 0" :d="progressPath" fill="#7fc97f" />
    </svg>

    <!-- Linear Progress Bar -->
    <div v-else-if="type === 'bar'" class="bar-container">
      <div class="bar-background" :style="{ height: `${barHeight}px` }">
        <div
          class="bar-progress"
          :style="{
            width: `${percentage}%`,
            backgroundColor: progressColor,
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    type: { type: String, required: true, default: 'pie' }, // "pie" or "bar"
    percentage: { type: Number, required: true, default: 0 },
    size: { type: Number, default: 120 }, // Circle size
    barHeight: { type: Number, default: 8 },
    colorChange: { type: Boolean, default: false }, // New prop for color change behavior
  });

  const radius = computed(() => props.size / 2);
  const center = computed(() => props.size / 2);

  // Convert degrees to radians
  const degToRad = (degrees) => (degrees - 90) * (Math.PI / 180);

  // Compute the pie slice path
  const progressPath = computed(() => {
    if (props.percentage >= 100) return ''; // Full circle handled separately

    const endAngle = (props.percentage / 100) * 360;
    const largeArcFlag = endAngle > 180 ? 1 : 0;

    const x1 = center.value + radius.value * Math.cos(degToRad(0));
    const y1 = center.value + radius.value * Math.sin(degToRad(0));

    const x2 = center.value + radius.value * Math.cos(degToRad(endAngle));
    const y2 = center.value + radius.value * Math.sin(degToRad(endAngle));

    return `
    M ${center.value},${center.value} 
    L ${x1},${y1} 
    A ${radius.value},${radius.value} 0 ${largeArcFlag} 1 ${x2},${y2} 
    Z
  `;
  });

  // Compute the progress bar color
  const progressColor = computed(() => {
    if (!props.colorChange) return '#7fc97f'; // Default green color

    if (props.percentage > 90) return '#ff4d4d'; // Red for > 90%
    if (props.percentage > 70) return '#ffa64d'; // Orange for > 70%
    return '#7fc97f'; // Default green color
  });
</script>

<style scoped>
  .progress-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* Bar Progress Styles */
  .bar-container {
    width: 100%;
  }

  .bar-background {
    width: 100%;
    height: 8px;
    background-color: rgba(var(--palette-background-rgb), 1);
    border-radius: 4px;
    overflow: hidden;
  }

  .bar-progress {
    height: 100%;
    transition: width 0.3s ease, background-color 0.3s ease;
  }
</style>
