<template>
  <header class="main-header">
    <router-link to="/" class="logo">
      <img :src="logoUrl" alt="Логотип" class="logo-image" @mouseover="hoverLogo = true"
        @mouseleave="hoverLogo = false" />
      <div class="logo-glow" :class="{ active: hoverLogo }"></div>
    </router-link>
    <nav class="main-nav">
      <!-- Кнопка Home -->
      <router-link to="/" class="nav-link" active-class="active-link">
        <div class="nav-item">
          <i class="fas fa-home text-2xl"></i>
          <span class="text-xl">Главная</span>
        </div>
      </router-link>

      <!-- Кнопка Media -->
      <router-link to="/main" class="nav-link" active-class="active-link">
        <div class="nav-item">
          <i class="fas fa-film text-2xl"></i>
          <span class="text-xl">Каталог</span>
        </div>
      </router-link>

      <!-- Кнопка Profile -->
      <router-link to="/profile" class="nav-link" active-class="active-link">
        <div class="nav-item">
          <i class="fas fa-user text-2xl"></i>
          <span class="text-xl">Профиль</span>
        </div>
      </router-link>
      <!-- Кнопка Admin -->
      <router-link v-if="userStore.role === 'admin'" to="/admin" class="nav-link" active-class="active-link">
        <div class="nav-item">
          <i class="fas fa-user-shield text-2xl"></i>
          <span class="text-xl">Админ</span>
        </div>
      </router-link>
    </nav>
    <div class="header-right">
      <nav class="user-nav">
        <!-- Кнопка Добавить фильм (видна только для роли user) -->
        <router-link v-if="userStore.role === 'user'" to="/add-movie" class="user-profile add-movie-btn">
          <div class="user-profile-inner">
            <i class="fas fa-plus"></i>
            <span>Добавить Контент</span>
          </div>
        </router-link>

        <!-- Кнопка логина -->
        <router-link v-if="userStore.role === 'guest'" to="/Auth" class="user-profile">
          <div class="user-profile-inner">
            <i class="fas fa-sign-in-alt"></i>
          </div>
        </router-link>

        <!-- Кнопка выхода -->
        <a v-if="['user', 'admin'].includes(userStore.role)" @click="exit" class="user-profile exit-btn">
          <div class="user-profile-inner">
            <i class="fas fa-sign-out-alt"></i>
          </div>
        </a>
      </nav>
    </div>
  </header>

  <!-- Остальная часть шаблона остается без изменений -->
  <div class="content">
    <SearchBar :onSearch="fetchMovies" />
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
import { ref, onMounted } from 'vue';
import axios from './config/axios';
import { useUserStore } from './store/user';
import SearchBar from './components/SearchBar.vue';
import logo from '@/assets/logo.png'; // Импорт логотипа

const userStore = useUserStore();
const movies = ref([]);
const loading = ref(false);
const searchPerformed = ref(false);
const tags = ref([]);
const API_URL = 'http://localhost:3000';
const logoUrl = logo;
const hoverLogo = ref(false); // Для управления свечением логотипа

const exit = async () => {
  await axios.post('http://localhost:3000/logout');
  localStorage.removeItem('role');
  localStorage.removeItem('token');
  userStore.role = 'guest';
};

const fetchMovies = async (query) => {
  loading.value = true;
  searchPerformed.value = true;
  try {
    const response = await axios.get('http://localhost:3000/movies/search', {
      params: { title: query },
    });
    movies.value = response.data;
  } catch (error) {
    console.error('Ошибка при поиске фильмов:', error);
    movies.value = [];
  } finally {
    loading.value = false;
  }
};
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style scoped>
.app-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: var(--padding);
  background: var(--background-color);
}


/* Обновленные стили для верхней панели навигации */
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, rgba(10, 10, 30, 0.95) 0%, rgba(20, 20, 40, 0.9) 100%);
  color: #fff;
  padding: 12px 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid rgba(118, 93, 222, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;
}

/* Стили логотипа */
.logo {
  position: relative;
  display: flex;
  align-items: center;
  height: 50px;
  overflow: visible;
}

.logo-image {
  height: 90px;
  width: auto;
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  filter: drop-shadow(0 0 5px rgba(136, 99, 251, 0.1));
  z-index: 2;
}

.logo:hover .logo-image {
  transform: scale(1.05);
  filter: drop-shadow(0 0 8px rgba(136, 99, 251, 0.5));
}

.logo-glow {
  position: absolute;
  width: 120%;
  height: 120%;
  left: -10%;
  top: -10%;
  background: radial-gradient(circle, rgba(118, 93, 222, 0.4) 0%, rgba(118, 93, 222, 0) 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
  z-index: 1;
}

.logo-glow.active {
  opacity: 1;
  animation: pulse-glow 2s infinite;
}

/* Обновленная навигация */
.main-nav {
  display: flex;
  gap: 10px;
}

.nav-link {
  padding: 8px 18px;
  background-color: rgba(25, 25, 45, 0.7);
  border: 1px solid rgba(118, 93, 222, 0.2);
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #e0e0ff;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(118, 93, 222, 0.1), transparent);
  transition: all 0.5s ease;
}

.nav-link:hover::before {
  left: 100%;
}

.nav-link:hover {
  background-color: rgba(118, 93, 222, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(118, 93, 222, 0.2);
  color: #fff;
}

.active-link {
  background: linear-gradient(45deg, rgba(118, 93, 222, 0.3), rgba(91, 85, 199, 0.2));
  border: 1px solid rgba(118, 93, 222, 0.4);
  box-shadow: 0 0 10px rgba(118, 93, 222, 0.2);
  color: #fff;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item span {
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.nav-item i {
  font-size: 1.1rem;
}

/* Правая часть хедера с кнопками пользователя */
.header-right {
  display: flex;
  align-items: center;
}

.user-nav {
  display: flex;
  gap: 10px;
}

.user-profile {
  width: 110px;
  height: 38px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(45deg, rgba(118, 93, 222, 0.4) 0%, rgba(91, 85, 199, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  text-decoration: none;
}

.user-profile::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(90deg,
      transparent 30%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 70%);
  transform: translateX(-100%) rotate(45deg);
  transition: transform 0.6s ease;
}

.user-profile:hover::before {
  transform: translateX(100%) rotate(45deg);
}

.user-profile:hover {
  background: linear-gradient(45deg, rgba(118, 93, 222, 0.6) 0%, rgba(91, 85, 199, 0.4) 100%);
  box-shadow: 0 0 15px rgba(118, 93, 222, 0.4);
}

.user-profile-inner {
  width: 106px;
  height: 34px;
  border-radius: 6px;
  background-color: rgba(10, 10, 30, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #fff;
  font-weight: 500;
  font-size: 0.9rem;
}

.user-profile-inner i {
  font-size: 1rem;
  color: rgba(118, 93, 222, 0.9);
}

.add-movie-btn {
  background: linear-gradient(45deg, rgba(138, 43, 226, 0.4) 0%, rgba(138, 43, 226, 0.2) 100%);
}

.add-movie-btn:hover {
  background: linear-gradient(45deg, rgba(138, 43, 226, 0.6) 0%, rgba(138, 43, 226, 0.4) 100%);
  box-shadow: 0 0 15px rgba(138, 43, 226, 0.4);
}

.exit-btn {
  background: linear-gradient(45deg, rgba(220, 53, 69, 0.4) 0%, rgba(220, 53, 69, 0.2) 100%);
}

.exit-btn:hover {
  background: linear-gradient(45deg, rgba(220, 53, 69, 0.6) 0%, rgba(220, 53, 69, 0.4) 100%);
  box-shadow: 0 0 15px rgba(220, 53, 69, 0.4);
}

@keyframes pulse-glow {
  0% {
    transform: scale(0.95);
    opacity: 0.5;
  }

  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }

  100% {
    transform: scale(0.95);
    opacity: 0.5;
  }
}

/* Медиа-запрос для адаптивности на маленьких экранах */
@media (max-width: 768px) {
  .main-header {
    flex-direction: column;
    padding: 10px;
    gap: 10px;
  }

  .main-nav {
    width: 100%;
    justify-content: center;
  }

  .nav-item span {
    display: none;
  }

  .nav-link {
    padding: 8px 12px;
  }

  .header-right {
    width: 100%;
    justify-content: center;
    margin-top: 5px;
  }
}
</style>