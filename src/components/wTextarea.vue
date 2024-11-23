<template>
    <div class="textarea-container">
      <textarea
        v-model="value"
        class="textarea"
        placeholder="Введите ваш текст..."
      />
    </div>
  </template>
  
  <script setup>
  import { computed } from "vue";
  
  const props = defineProps({
    modelValue: String,
  });
  const emit = defineEmits(["update:modelValue"]);
  
  const value = computed({
    get() {
      return props.modelValue;
    },
    set(value) {
      emit("update:modelValue", value);
    },
  });
  </script>
  
  <style scoped>
  .textarea-container {
    width: 100%;
    margin-bottom: 1rem;
  }
  
  .textarea {
    width: 100%;
    min-height: 120px;
    padding: 10px 15px;
    font-size: 16px;
    line-height: 1.5;
    color: var(--text-color, #333);
    background-color: var(--background-color, #fff);
    border: 1px solid var(--primary-color, #00416d);
    border-radius: var(--border-radius, 8px);
    resize: vertical; /* Позволяет изменять высоту */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  
  .textarea:focus {
    outline: none;
    border-color: var(--secondary-color, #5796bb);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .textarea::placeholder {
    color: #aaa;
  }
  
  @media (max-width: 768px) {
    .textarea {
      font-size: 14px;
      padding: 8px 12px;
    }
  }
  
  @media (max-width: 480px) {
    .textarea {
      font-size: 12px;
      padding: 6px 10px;
    }
  }
  </style>
  