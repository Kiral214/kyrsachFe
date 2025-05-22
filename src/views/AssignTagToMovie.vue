<template>
    <div class="assign-tag-to-movie">
        <h2>Привязать тег к фильму</h2>
        <div>
            <multiselect v-model="value" :options="tags"></multiselect>
        </div>
        <form @submit.prevent="assignTag">
            <div class="form-group">
                <label>Выберите фильм</label>
                <select v-model="selectedMovieId" required>
                    <option value="">Выберите фильм</option>
                    <option v-for="movie in movies" :key="movie.id" :value="movie.id">
                        {{ movie.title }}
                    </option>
                </select>
            </div>

            <div class="form-group">
                <label>Выберите тег</label>
                <select v-model="selectedTagId" required>
                    <option value="">Выберите тег</option>
                    <option v-for="tag in tags" :key="tag.id" :value="tag.id">
                        {{ tag.name }} ({{ tag.category }})
                    </option>
                </select>
            </div>

            <button type="submit">Привязать тег</button>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '../config/axios';
import Multiselect from 'vue-multiselect'

const API_URL = 'http://localhost:3000'; // Добавьте базовый URL API

const movies = ref([]);
const tags = ref([]);
const selectedMovieId = ref(null);
const selectedTagId = ref(null);

// Загрузка фильмов
const fetchMovies = async () => {
    try {
        const response = await axios.get(`${API_URL}/movies`);
        movies.value = response.data;
    } catch (error) {
        console.error('Ошибка при загрузке фильмов:', error);
        alert('Не удалось загрузить фильмы');
    }
};

// Загрузка тегов
const fetchTags = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/tags`);
        if (response.data && Array.isArray(response.data)) {
            tags.value = response.data;
        } else {
            console.error('Некорректный формат ответа:', response.data);
            alert('Некорректный формат данных тегов');
        }
    } catch (error) {
        console.error('Ошибка при загрузке тегов:', error);
        alert('Не удалось загрузить теги');
    }
};

// Привязка тега к фильму
const assignTag = async () => {
    try {
        if (!selectedMovieId.value || !selectedTagId.value) {
            alert('Пожалуйста, выберите фильм и тег.');
            return;
        }

        console.log('Отправка данных:', {
            movieId: selectedMovieId.value,
            tagId: selectedTagId.value,
        });

        const response = await axios.post(`${API_URL}/movies/assign-tag`, {
            movieId: selectedMovieId.value,
            tagId: selectedTagId.value,
        });

        console.log('Ответ от сервера:', response.data);
        alert('Тег успешно привязан к фильму!');

        // Сброс выбора
        selectedMovieId.value = null;
        selectedTagId.value = null;
    } catch (error) {
        console.error('Ошибка при привязке тега:', error);
        alert(`Ошибка: ${error.response?.data?.message || error.message}`);
    }
};

// Инициализация
onMounted(async () => {
    await fetchMovies();
    await fetchTags();
});
</script>

<style scoped>
.assign-tag-to-movie {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
}

select {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 4px;
}

button {
    padding: 10px 15px;
    background-color: #007BFF;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #0056b3;
}
</style>