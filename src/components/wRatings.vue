<template>
    <div>
        <div class="stars">
            <!-- Массив звезд для отображения, через v-for -->
            <span v-for="star in stars" :key="star" class="star" :class="{ 'active': star <= value }"
                @click="setRating(star)">★</span>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
const stars = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
const setRating = (star) => { value.value = star }
const props = defineProps({
    modelValue: String,
})
const emit = defineEmits(['update:modelValue'])
const value = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit('update:modelValue', value)
    },
})

</script>

<style scoped>
.stars {
    display: flex;
    justify-content: center;
    font-size: 24px;
    color: #ccc;
}

.star {
    cursor: pointer;
    margin: 0 5px;
    transition: color 0.3s ease, transform 0.3s ease;
}

.star.active {
    color: var(--accent-color);
}

.star:hover {
    transform: scale(1.2);
    color: var(--secondary-color);
}
</style>