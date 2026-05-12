<template>
  <div class="sign-in">
    <h5 class="sign-in__title">
      برای ورود شماره موبایل و رمز عبور خود را وارد کنید.
    </h5>
    <form class="sign-in__form" @submit.prevent="onSubmit">
      <BaseTextInput
        autocomplete="username"
        placeholder="شماره همراه"
        name="phone"
        type="tel"
        inputmode="tel"
        v-model="phone"
        :hint="showErrors ? phoneErrorMessage : ''"
        :isError="showErrors && !!phoneErrorMessage"
        variant="outlined"
        supportsPersianDigits
        isNumber
      />

      <BaseTextInput
        autocomplete="current-password"
        placeholder="رمز عبور"
        name="password"
        type="password"
        v-model="password"
        :hint="showErrors ? passwordErrorMessage : ''"
        :isError="showErrors && !!passwordErrorMessage"
        variant="outlined"
      />

      <BaseButton
        size="medium"
        :is-loading="isLoading"
        type="submit"
        class="sign-in__submit"
      >
        ورود
      </BaseButton>
    </form>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import BaseTextInput from '@/components/common/base/base-text-input.vue';
  import BaseButton from '@/components/common/base/base-button.vue';
  import router from '@/router';
  import { useField, useForm } from 'vee-validate';

  import useAdminStore from '@/stores/admin';
  const adminStore = useAdminStore();

  const { validate } = useForm();

  const { value: phone, errorMessage: phoneErrorMessage } = useField(
    'phone',
    'required|phoneNumber',
    {
      label: 'شماره همراه',
    },
  );

  const { value: password, errorMessage: passwordErrorMessage } = useField(
    'password',
    'required',
    {
      label: 'رمز عبور',
    },
  );

  const showErrors = ref(false);
  const isLoading = ref(false);
  const onSubmit = async () => {
    try {
      isLoading.value = true;

      const { valid } = await validate();

      if (!valid) {
        showErrors.value = true;
        isLoading.value = false;
        return;
      }

      await adminStore.signIn({ phone: phone.value, password: password.value });
      router.push('/');
    } catch (e) {
      isLoading.value = false;
    }
  };
</script>

<style scoped lang="scss">
  .sign-in {
    height: 100%;
    width: 100%;
    padding: space(6) space(8);
    text-align: center;

    &__title {
      padding-bottom: space(4);
      color: var(--palette-text-on-main-20);
    }

    &__form {
      @include flex(column);
      width: 100%;
      gap: space(3);
      padding: space(5) 0;
    }

    &__submit {
      margin-top: space(2);
      width: 100%;
      border-radius: space(2);
      cursor: pointer;
    }
  }
</style>
