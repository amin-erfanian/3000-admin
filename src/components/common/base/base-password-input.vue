<template>
  <base-text-input v-model="password" v-bind="$attrs" :type="type">
    <template #append>
      <base-icon
        class="certificate-pin__show-pin"
        :icon-name="iconName"
        :key="iconName"
        @click="togglePasswordVisibility"
      />
    </template>
  </base-text-input>
</template>

<script setup>
  import BaseTextInput from '@/components/common/base/base-text-input.vue';
  import BaseIcon from '@/components/common/base/base-icon.vue';

  import { ref, computed } from 'vue';
  const emit = defineEmits(['update:modelValue']);

  const props = defineProps({
    modelValue: {
      type: String,
      default: '',
    },
  });

  const password = computed({
    get() {
      return props.modelValue;
    },
    set(value) {
      emit('update:modelValue', value);
    },
  });

  const type = ref('password');
  const showEyeSlashIcon = ref(true);
  const iconName = computed(() =>
    showEyeSlashIcon.value ? 'eye-slash' : 'eye',
  );

  const togglePasswordVisibility = () => {
    type.value = type.value === 'password' ? 'text' : 'password';
    showEyeSlashIcon.value = !showEyeSlashIcon.value;
  };
</script>

<style scoped lang="scss">
  .certificate-pin {
    &__show-pin {
      cursor: pointer;
      color: #fafafa;
      width: 20px;
      height: 20px;
      background-color: transparent;
      border: none;
      padding: 0;
    }
  }
</style>
