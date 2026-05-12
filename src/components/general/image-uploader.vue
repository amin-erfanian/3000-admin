<template>
  <div class="image-uploader">
    <div class="image-uploader__previews" v-if="images.length">
      <draggable
        v-model="images"
        item-key="url"
        handle=".image-uploader__drag-handle"
        class="image-uploader__drag-list"
        @end="onReorder"
      >
        <template #item="{ element: img, index }">
          <div
            class="image-uploader__preview"
            :class="{ 'is-main': img.isMain }"
          >
            <span class="image-uploader__drag-handle">⠿</span>

            <img
              :src="img.url"
              :alt="img.name"
              class="image-uploader__preview-img"
            />

            <div class="image-uploader__preview-info">
              <span class="image-uploader__preview-name">{{ img.name }}</span>
            </div>

            <div class="image-uploader__actions">
              <button
                class="image-uploader__main-badge"
                :class="{ 'is-active': img.isMain }"
                @click="setMain(index)"
              >
                {{ img.isMain ? 'تصویر اصلی' : 'انتخاب به عنوان اصلی' }}
              </button>
              <button
                class="image-uploader__preview-remove"
                @click="remove(index)"
              >
                ✕
              </button>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <div class="image-uploader__box" @click="triggerInput">
      <span class="image-uploader__icon">+</span>
      <span class="image-uploader__label">افزودن تصویر</span>
      <input
        ref="inputRef"
        type="file"
        accept="image/*"
        multiple
        class="image-uploader__input"
        @change="onFileChange"
      />
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import draggable from 'vuedraggable';

  const emit = defineEmits(['update:modelValue']);

  const inputRef = ref(null);
  const images = ref([]);

  const triggerInput = () => inputRef.value.click();

  const emitValue = () => {
    emit(
      'update:modelValue',
      images.value.map((i) => i.file),
    );
  };

  const onFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      isMain: false,
      file,
    }));
    images.value.push(...newImages);
    if (!images.value.some((i) => i.isMain)) images.value[0].isMain = true;
    emitValue();
    e.target.value = '';
  };

  const remove = (index) => {
    const wasMain = images.value[index].isMain;
    URL.revokeObjectURL(images.value[index].url);
    images.value.splice(index, 1);
    if (wasMain && images.value.length) images.value[0].isMain = true;
    emitValue();
  };

  const setMain = (index) => {
    images.value.forEach((img, i) => (img.isMain = i === index));
    // move main to top
    const [main] = images.value.splice(index, 1);
    images.value.unshift(main);
    emitValue();
  };

  const onReorder = () => {
    // if main got dragged away from top, re-pin it to top
    const mainIndex = images.value.findIndex((i) => i.isMain);
    if (mainIndex > 0) {
      const [main] = images.value.splice(mainIndex, 1);
      images.value.unshift(main);
    }
    emitValue();
  };
</script>

<style lang="scss" scoped>
  .image-uploader {
    @include flex(column);
    gap: space(4);
    width: 100%;

    &__previews {
      width: 100%;
      @include flex(column);
      gap: space(2);
    }

    &__drag-list {
      @include flex(column);
      gap: space(2);
      width: 100%;
    }

    &__preview {
      width: 100%;
      @include flex($align: center);
      gap: space(3);
      padding: space(2) space(3);
      border: 1px solid var(--palette-border-20);
      border-radius: $radius-2x;
      transition: border-color 0.15s;

      &.is-main {
        border-color: var(--palette-primary);
      }
    }

    &__drag-handle {
      font-size: 18px;
      color: var(--palette-text-on-main-10);
      cursor: grab;
      user-select: none;
      flex-shrink: 0;

      &:active {
        cursor: grabbing;
      }
    }

    &__preview-img {
      width: 56px;
      height: 56px;
      object-fit: cover;
      border-radius: $radius-1x;
      flex-shrink: 0;
    }

    &__preview-info {
      @include flex(column);
      gap: space(1);
      flex: 1;
      min-width: 0;
    }

    &__preview-name {
      @include typography(body-medium);
      color: var(--palette-text-on-main-30);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &__actions {
      @include flex($align: center);
      gap: space(4);
    }

    &__main-badge {
      @include typography(caption);
      align-self: flex-start;
      padding: space(1) space(2);
      border-radius: $radius-1x;
      border: 1px solid var(--palette-border-20);
      background: transparent;
      color: var(--palette-text-on-main-10);
      cursor: pointer;
      transition: all 0.15s;

      &.is-active {
        border-color: var(--palette-primary);
        background: var(--palette-primary);
        color: #fff;
        cursor: default;
      }

      &:not(.is-active):hover {
        border-color: var(--palette-primary);
        color: var(--palette-primary);
      }
    }

    &__preview-remove {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: none;
      background: var(--palette-error);
      color: #fff;
      font-size: 10px;
      cursor: pointer;
      flex-shrink: 0;
      @include flex($align: center, $justify: center);
    }

    &__box {
      @include flex(column, $align: center, $justify: center);
      gap: space(2);
      width: 100%;
      min-height: 120px;
      border: 2px dashed var(--palette-border-20);
      border-radius: $radius-2x;
      cursor: pointer;
      transition: all 0.15s;

      &:hover {
        border-color: var(--palette-primary);
        background: var(--palette-background);
      }
    }

    &__icon {
      font-size: 28px;
      color: var(--palette-text-on-main-10);
      line-height: 1;
    }

    &__label {
      @include typography(body-medium);
      color: var(--palette-text-on-main-10);
    }

    &__input {
      display: none;
    }
  }
</style>
