<template>
  <header class="main-header">
    <router-link to="/">
      <h1>КиноОбзор</h1>
    </router-link>
    {{ userStore.role }}
    <nav>
      <router-link v-if="userStore.role === 'admin'" to="/admin" class="nav-link">Админ-панель</router-link>
      <router-link v-if="userStore.role === 'guest'" to="/Auth" class="nav-link">Логин</router-link>
      <a v-if="['user', 'admin'].includes(userStore.role)" @click="exit" class="nav-link">Выйти</a>
    </nav>
    <!-- Компонент поиска -->
    <SearchBar :onSearch="fetchMovies" />
  </header>
  <div class="app-container">
    <!-- Результаты поиска -->
    <div v-if="searchPerformed">
      <div v-if="movies.length > 0">
        <h2>Результаты поиска:</h2>
        <ul class="movie-list">
          <li v-for="movie in movies" :key="movie._id" class="movie-item">
            <h3>{{ movie.title }}</h3>
            <p>{{ movie.description }}</p>
          </li>
        </ul>
      </div>
      <div v-else>
        <p>Фильм не найден</p>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from './config/axios';
import { useUserStore } from './store/user';
import SearchBar from './components/SearchBar.vue'; // Компонент поиска

const userStore = useUserStore();
const movies = ref([]); // Хранение результатов поиска
const loading = ref(false);
const searchPerformed = ref(false); // Индикатор выполнения поиска

const exit = async () => {
  await axios.post('http://localhost:3000/logout');
  localStorage.removeItem('role');
  localStorage.removeItem('token');
  userStore.role = 'guest';
};

// Логика поиска фильмов
const fetchMovies = async (query) => {
  loading.value = true;
  searchPerformed.value = true; // Устанавливаем, что поиск был выполнен
  try {
    const response = await axios.get('http://localhost:3000/movies/search', {
      params: { title: query }, // Передаем параметр поиска
    });
    movies.value = response.data; // Сохраняем результаты поиска
  } catch (error) {
    console.error('Ошибка при поиске фильмов:', error);
    movies.value = []; // Очистить список фильмов при ошибке
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.app-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: var(--padding);
  background: var(--background-color);
}

.main-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #5796bb;
  color: #fff;
  padding: 15px 20px;
  border-radius: 8px;
}

.main-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.nav-link {
  color: #ffc107;
  text-decoration: none;
  margin-left: 20px;
  font-size: 16px;
}

.nav-link:hover {
  text-decoration: underline;
}

/* Стили для списка фильмов */
.movie-list {
  list-style: none;
  padding: 0;
}

.movie-item {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.movie-item h3 {
  margin: 0;
  font-size: 20px;
  color: #00416d;
}

.movie-item p {
  margin: 5px 0 0;
  color: #666;
}
</style>
