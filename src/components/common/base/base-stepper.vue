<template>
  <div class="stepper-wrapper">
    <div class="stepper">
      <div v-for="(step, index) in steps" :key="step.path" class="step-item">
        <!-- Circle + Label -->
        <div
          class="step-head"
          :class="getStatus(index)"
          @click="goTo(step, index)"
        >
          <div class="circle">
            <span v-if="getStatus(index) === 'done'" class="icon">✓</span>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="step-name">{{ step.name }}</span>
        </div>

        <!-- Connector line -->
        <div
          v-if="index < steps.length - 1"
          class="connector"
          :class="{ filled: index < currentIndex }"
        />
      </div>
    </div>

    <div class="step-content">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  const props = defineProps({
    steps: {
      type: Array,
      required: true,
    },
  });

  const route = useRoute();
  const router = useRouter();

  const currentIndex = computed(() =>
    props.steps.findIndex((s) => route.path.endsWith(s.path)),
  );

  const getStatus = (index) => {
    if (index < currentIndex.value) return 'done';
    if (index === currentIndex.value) return 'active';
    return 'pending';
  };

  const goTo = (step, index) => {
    if (index <= currentIndex.value) router.push({ name: step.pathName });
  };
</script>

<style lang="scss" scoped>
  .stepper-wrapper {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .stepper {
    display: flex;
    align-items: center;
    gap: space(4);
  }

  .step-item {
    display: flex;
    align-items: center;
    gap: space(4);
  }

  .step-head {
    display: flex;
    align-items: center;
    gap: space(4);
    cursor: default;
  }

  .step-head.done,
  .step-head.active {
    cursor: pointer;
  }

  .circle {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.875rem;
    border: 2px solid #d1d5db;
    background: #fff;
    color: #6b7280;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .step-head.active .circle {
    border-color: var(--palette-primary);
    background: var(--palette-primary);
    color: #fff;
  }

  .step-head.done .circle {
    border-color: var(--palette-primary);
    background: #ede9fe;
    color: var(--palette-primary);
  }

  .step-name {
    font-size: 0.875rem;
    color: #6b7280;
    white-space: nowrap;
  }

  .step-head.active .step-name {
    color: var(--palette-primary);
    font-weight: 600;
  }

  .step-head.done .step-name {
    color: var(--palette-primary);
  }

  .connector {
    flex: 1;
    height: 1px;
    min-width: 8rem;
    background: #d1d5db;
    // margin: 0 0.75rem;
    transition: all 0.2s;
  }

  .connector.filled {
    background: var(--palette-primary);
  }

  .step-content {
    width: 100%;
  }
</style>
