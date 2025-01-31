<template>
  <div class="search-bar">
    <div class="search-input-container">
      <i class="search-icon">🔍</i>
      <input
        v-model="query"
        type="text"
        placeholder="Введите название фильма..."
        @input="fetchMovies"
      />
      <span v-if="loading" class="loading-icon">⏳</span>
    </div>
    <ul v-if="movies.length && query" class="dropdown-menu">
      <li
        v-for="movie in movies"
        :key="movie.id"
        @click="goToMoviePage(movie.id)"
        class="dropdown-item"
      >
        {{ movie.title }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from '../config/axios';

const query = ref('');
const movies = ref([]);
const loading = ref(false);
const router = useRouter();

// Запрос фильмов по введенному тексту
const fetchMovies = async () => {
  if (!query.value) {
    movies.value = [];
    return;
  }
  loading.value = true;
  try {
    const response = await axios.get('/movies/search', { params: { title: query.value } });
    movies.value = response.data;
  } catch (error) {
    console.error('Ошибка при поиске фильмов:', error);
  } finally {
    loading.value = false;
  }
};

// Переход на страницу фильма
const goToMoviePage = (id) => {
  router.push(`/movie/${id}`); // Перенаправление на страницу фильма
  movies.value = []; // Очищаем меню после выбора
  query.value = ''; // Очищаем поле поиска
};
</script>

<style scoped>
/* Контейнер поиска */
.search-bar {
  position: relative;
  width: 100%;
}

/* Поле ввода с иконкой */
.search-input-container {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 10px;
  font-size: 18px;
  color: #888;
}

input {
  width: 100%;
  padding: 10px 10px 10px 35px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

input:focus {
  outline: none;
  box-shadow: 0 0 8px rgba(81, 203, 238, 0.6);
  border-color: rgba(81, 203, 238, 1);
}

.loading-icon {
  position: absolute;
  right: 10px;
  font-size: 16px;
  color: #888;
}

/* Выпадающее меню */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.3s ease-in-out;
  z-index: 1000;
}

/* Анимация появления */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Элемент списка */
.dropdown-item {
  padding: 10px 15px;
  cursor: pointer;
  font-size: 16px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.dropdown-item:last-child {
  border-bottom: none; /* Убираем линию для последнего элемента */
}

.dropdown-item:hover {
  background-color: #f9f9f9;
  color: #007bff; /* Цвет текста при наведении */
}
</style>
