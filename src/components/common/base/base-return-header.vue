<template>
  <div
    class="return-header"
    :class="{ 'return-header--sticky': isSticky }"
    :style="{ backgroundColor: `var(${headerColor})` }"
  >
    <div class="return-header__content">
      <div class="return-header__corner">
        <slot name="append-corner" />
      </div>
      <div class="return-header__title">
        <h3>
          {{ title }}
        </h3>
      </div>
      <div class="return-header__return">
        <base-icon
          @click="returnTo"
          iconName="arrow-left"
          class="return-icon"
          :class="returnIconModifier"
        />
      </div>
    </div>
    <slot name="content-below" />
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import BaseIcon from '@/components/common/base/base-icon.vue';
  import { useRouter } from 'vue-router';
  const router = useRouter();

  const emit = defineEmits(['return']);

  const props = defineProps({
    title: {
      type: String,
      required: true,
    },
    returnPath: {
      type: String,
      default: '',
    },
    headerColor: {
      type: String,
      default: '--palette-primary',
    },
    isSticky: {
      type: Boolean,
      default: true,
    },
    direction: {
      type: String,
      default: 'horizontal',
      validator: (v) => ['horizontal', 'vertical'].includes(v),
    },
  });

  const returnTo = () => {
    const canGoBack = window.history.length > 1;

    if (canGoBack) {
      window.history.back();
    } else {
      router.push({ name: 'dashboard' });
    }

    if (props.returnPath) {
      router.push(props.returnPath);
      emit('return');
      return;
    }

    emit('return');
  };

  const returnIconModifier = computed(() => `return-icon--${props.direction}`);
</script>

<style lang="scss" scoped>
  .return-header {
    width: 100%;
    padding: space(3);
    padding-top: space(4);
    margin: 0;
    box-shadow: 0px 2px 4px var(--palette-background-shadow);

    &__content {
      width: 100%;
      @include flex($justify: space-between, $align: center);
    }

    &--sticky {
      position: sticky;
      top: 0;
      z-index: 10;
    }

    &__title {
      text-align: center;
      flex-shrink: 0;
      font-size: 18px;
      font-weight: bold;
      color: #fafafa;
    }

    &__corner,
    &__return {
      flex: 50%;
    }

    &__return {
      color: #fafafa;
      text-align: left;

      .return-icon {
        cursor: pointer;
        width: 32px;
        height: 32px;

        &--vertical {
          transform: rotate(-90deg);
        }
      }
    }
  }
</style>
