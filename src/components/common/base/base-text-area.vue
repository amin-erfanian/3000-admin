<template>
  <div class="field">
    <textarea
      contenteditable
      v-model="fieldValue"
      :id="name"
      :name="name"
      class="field__textarea"
      rows="3"
      resize="vertical"
    />
    <label v-if="!fieldValue.length" :for="name" class="field__label">
      {{ label }}
    </label>
  </div>
</template>

<script setup>
  const props = defineProps({
    label: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      required: true,
    },
  });

  const fieldValue = defineModel({ default: '' });
</script>

<style lang="scss" scoped>
  .field {
    --label-color: var(--palette-border-20);
    --border-color: var(--palette-border-20);

    position: relative;
    width: 100%;
    padding: space(3) space(4);
    border-radius: $radius-4x;
    border: 1px solid var(--border-color);
    background-color: var(--palette-background);

    &__textarea {
      width: 100%;
      min-height: 16px;
      max-height: 150px;
      overflow-x: hidden;
      overflow-y: auto;
      background-color: transparent;
      resize: vertical;

      @include typography(body-large);

      &:disabled {
        color: var(--palette-container-background);
      }

      &:-webkit-autofill {
        -webkit-background-clip: text;
      }
    }

    &__label {
      right: space(4);
      top: space(2);
      position: absolute;
      pointer-events: none;
      transition: all 0.15s ease;
      color: var(--label-color);
      @include typography(body-large);
    }
  }
</style>
