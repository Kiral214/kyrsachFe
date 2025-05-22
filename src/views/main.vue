<template>
  <div class="main-container" :class="{ 'sidebar-open': isSidebarOpen }">
    <!-- Кнопка-стрелка для открытия боковой панели -->
    <button class="sidebar-toggle" @click="toggleSidebar">
      <svg v-if="!isSidebarOpen" class="arrow-icon" width="24" height="24" viewBox="0 0 24 24" fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <svg v-else class="arrow-icon" width="24" height="24" viewBox="0 0 24 24" fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path d="M6 18L12 12L6 6" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <!-- Боковая панель -->
    <aside class="sidebar" :class="{ open: isSidebarOpen }">
      <!-- Поиск фильмов -->
      <div class="search-container">
        <span class="search-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
              stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M21 21L16.65 16.65" stroke="#888" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </span>
        <input type="text" v-model="query" @input="updateSuggestions" @keyup.enter="submitSearch"
          placeholder="Поиск фильмов..." class="search-input" />
        <button @click="clearSearch" class="clear-search">✕</button>
        <div v-if="showDropdown" class="dropdown">
          <ul v-if="suggestions.length > 0" class="suggestions-list">
            <li v-for="(suggestion, index) in suggestions" :key="index" @click="selectSuggestion(suggestion)">{{
              suggestion }}</li>
          </ul>
          <ul v-if="movies.length > 0" class="movies-list">
            <li v-for="movie in movies" :key="movie.id" @click="goToMoviePage(movie.id)">{{ movie.title }}</li>
          </ul>
          <div v-if="!loading && movies.length === 0 && suggestions.length === 0" class="no-results">Ничего не найдено
          </div>
        </div>
      </div>

      <!-- Группа: Теги -->
      <div class="filter-group">
        <h3 class="group-title">Теги</h3>
        <ul class="tag-list">
          <li v-for="tag in allTags" :key="tag.id" :class="{ active: selectedTag === tag.id }"
            @click="filterMovies(tag.id, tag.name)">
            {{ tag.name }}
            <span v-if="selectedTag === tag.id" class="reset-tag" @click.stop="resetTag">✕</span>
          </li>
        </ul>
      </div>

      <div class="separator"></div>

      <!-- Группа: Средний рейтинг -->
      <div class="filter-group">
        <h3 class="group-title">Средний рейтинг</h3>
        <div class="select-wrapper">
          <select v-model="selectedRating" @change="fetchFilteredMovies" class="rating-select">
            <option value="">Любой</option>
            <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
          </select>
          <span v-if="selectedRating" class="reset-tag" @click="resetRating">✕</span>
        </div>
      </div>

      <div class="separator"></div>

      <!-- Сброс всех -->
      <button class="reset-all" @click="resetAll">Сбросить фильтры</button>
    </aside>

    <div class="app-container">
      <div class="menu-container">
        <!-- Убрана кнопка "Теги" -->
      </div>
    </div>

    <!-- Секция фильмов по тегам -->
    <section class="filter-section">
      <h2>Контент по тегам</h2>
      <div v-if="filteredMovies.length === 0" class="no-movies">
        По выбранным фильтрам фильмов не найдено.
      </div>
      <div class="movies-grid">
        <div v-for="movie in filteredMovies" :key="movie.id" class="movie-card">
          <RouterLink :to="{ name: 'movie', params: { id: movie.id } }" class="movie-link">
            <img :src="movie.coverImage || 'https://via.placeholder.com/200x300'" alt="Обложка фильма"
              class="movie-cover" />
            <h3 class="movie-title">{{ movie.title }}</h3>
            <p class="movie-genre">{{ movie.genre }}</p>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Секция "Популярное" -->
    <section class="movie-list">
      <h2>Популярное</h2>
      <div class="movies-grid">
        <div v-for="item in popularMovies" :key="item.id" class="movie-card">
          <RouterLink :to="{ name: 'movie', params: { id: item.id } }" class="movie-link">
            <img :src="item.coverImage || 'https://via.placeholder.com/200x300'" alt="Обложка фильма"
              class="movie-cover" />
            <h3 class="movie-title">{{ item.title }}</h3>
            <p class="movie-genre">{{ item.genre }}</p>
            <p class="movie-year">{{ item.releaseYear }}</p>
          </RouterLink>
        </div>
      </div>
    </section>

    <button class="back-to-top" @click="scrollToTop">⬆</button>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from '../config/axios';
import { RouterLink } from 'vue-router';

const popularMovies = ref([]);
const filteredMovies = ref([]);
const allTags = ref([]);
const selectedTag = ref('');
const selectedTagName = ref('');
const selectedRating = ref('');
const isSidebarOpen = ref(false);

const query = ref('');
const movies = ref([]);
const loading = ref(false);
const suggestions = ref([]);
const searchHistory = ref(JSON.parse(localStorage.getItem('searchHistory')) || []);
const popularSearches = ['комедии 2023', 'аниме 2024', 'рок музыка', 'боевики'];

const router = useRouter();
const route = useRoute();

const showDropdown = computed(() => {
  return query.value.trim().length > 0 && (suggestions.value.length > 0 || movies.value.length > 0 || (!loading.value && movies.value.length === 0));
});

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

onMounted(async () => {
  const moviesRes = await axios.get('/movies');
  popularMovies.value = moviesRes.data;

  const tagsRes = await axios.get('/api/tags');
  allTags.value = tagsRes.data;

  fetchFilteredMovies();
});

const fetchFilteredMovies = async () => {
  const params = {};
  if (selectedTag.value) params.tag = selectedTag.value;
  if (selectedRating.value) params.rating = selectedRating.value;
  const res = await axios.get('/movies', { params });
  filteredMovies.value = res.data;
};

const filterMovies = (id, name) => {
  selectedTag.value = id;
  selectedTagName.value = name;
  fetchFilteredMovies();
};

const resetTag = () => {
  selectedTag.value = '';
  selectedTagName.value = '';
  fetchFilteredMovies();
};

const resetRating = () => {
  selectedRating.value = '';
  fetchFilteredMovies();
};

const resetAll = () => {
  selectedTag.value = '';
  selectedTagName.value = '';
  selectedRating.value = '';
  fetchFilteredMovies();
};

const scrollToTop = () =>
  window.scrollTo({ top: 0, behavior: 'smooth' });

const updateSuggestions = () => {
  const input = query.value.trim().toLowerCase();
  if (!input) {
    suggestions.value = [];
    return;
  }
  suggestions.value = [...new Set([...searchHistory.value, ...popularSearches])]
    .filter(s => s.toLowerCase().includes(input))
    .slice(0, 5);
};

const selectSuggestion = (suggestion) => {
  query.value = suggestion;
  fetchMovies();
};

const fetchMovies = async () => {
  if (!query.value.trim()) {
    movies.value = [];
    suggestions.value = [];
    return;
  }
  loading.value = true;
  try {
    const params = { title: query.value.trim() };
    const response = await axios.get('/movies/search', { params });
    movies.value = Array.isArray(response.data) ? response.data.map(movie => ({
      id: movie.id || movie._id,
      title: movie.title || 'Без названия'
    })) : [];
    updateSuggestions();
    if (!searchHistory.value.includes(query.value)) {
      searchHistory.value.unshift(query.value);
      searchHistory.value = searchHistory.value.slice(0, 5);
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value));
    }
  } catch (error) {
    console.error('Ошибка при поиске фильмов:', error);
    movies.value = [];
    suggestions.value = [];
  } finally {
    loading.value = false;
  }
};

const clearSearch = () => {
  query.value = '';
  movies.value = [];
  suggestions.value = [];
};

const submitSearch = () => {
  fetchMovies();
};

const goToMoviePage = (id) => {
  router.push(`/movie/${id}`);
  movies.value = [];
  query.value = '';
};
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Poppins:wght@300;400;500&display=swap');

.main-container {
  font-family: 'Poppins', sans-serif;
  background: linear-gradient(135deg, #060314 0%, #0a071a 50%, #0d0418 100%);
  color: #d0d0d5;
  padding: var(--padding);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.4s ease;
  margin-left: 40px;
}

.main-container.sidebar-open {
  margin-left: 300px;
}

.app-container {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.menu-container {
  display: flex;
  background-color: rgba(16, 8, 24, 0.7);
  padding: 10px 0;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 15px rgba(43, 32, 82, 0.15);
  animation: fadeIn 0.5s ease-in;
  backdrop-filter: blur(8px);
  position: relative;
  z-index: 1100;
}

.sidebar-toggle {
  position: fixed;
  top: 80px;
  left: -10px;
  z-index: 1200;
  background: linear-gradient(135deg, #441b8a 0%, #552b94 100%);
  border: none;
  border-radius: 0 8px 8px 0;
  padding: 12px;
  cursor: pointer;
  transition: transform 0.3s ease, background-color 0.3s ease;
  box-shadow: 0 2px 10px rgba(43, 32, 82, 0.4);
}

.sidebar-toggle:hover {
  background: linear-gradient(135deg, #522399 0%, #6133a0 100%);
  transform: translateX(3px);
}

.arrow-icon {
  display: block;
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: 300px;
  background: linear-gradient(145deg, #0c0a19, #140d28);
  border-right: 1px solid rgba(43, 32, 82, 0.3);
  transform: translateX(-100%);
  opacity: 0;
  transition: transform 0.4s ease, opacity 0.4s ease;
  z-index: 1000;
  padding: 20px;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.5);
  overflow-x: hidden;
}

.sidebar.open {
  transform: translateX(0);
  opacity: 1;
}

.search-container {
  position: relative;
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 40px;
  border: 1px solid rgba(43, 32, 82, 0.4);
  border-radius: 12px;
  background: rgba(12, 6, 30, 0.6);
  color: #d0d0d5;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.search-input:focus {
  outline: none;
  border-color: #552b94;
  box-shadow: 0 0 12px rgba(69, 42, 119, 0.4);
  background: rgba(14, 8, 32, 0.8);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.3s ease;
}

.search-input:focus+.search-icon {
  color: #552b94;
}

.clear-search {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: color 0.3s ease, transform 0.3s ease;
}

.clear-search:hover {
  color: #a53a7a;
  transform: scale(1.1) translateY(-50%);
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: rgba(16, 9, 34, 0.95);
  border-radius: 12px;
  z-index: 1300;
  max-height: 250px;
  overflow-y: auto;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(43, 32, 82, 0.2);
  backdrop-filter: blur(10px);
  margin-top: 5px;
}

.suggestions-list,
.movies-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestions-list li,
.movies-list li {
  padding: 12px 15px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
  border-bottom: 1px solid rgba(43, 32, 82, 0.1);
}

.suggestions-list li:hover,
.movies-list li:hover {
  background: rgba(43, 32, 82, 0.2);
  transform: translateX(5px);
}

.no-results {
  padding: 15px;
  color: #d0d0d5;
  text-align: center;
  font-style: italic;
}

.filter-group {
  margin-top: 25px;
}

.filter-group h3 {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.2em;
  color: #d0d0d5;
  margin-bottom: 15px;
  text-align: center;
  margin-top: 20px;
  position: relative;
  display: inline-block;
  padding-bottom: 5px;
  width: 100%;
}

.filter-group h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #552b94, transparent);
}

.tag-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.tag-list li {
  padding: 8px 14px;
  background: rgba(43, 32, 82, 0.2);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #d0d0d5;
  font-size: 0.9em;
  border: 1px solid rgba(43, 32, 82, 0.3);
}

.tag-list li:hover {
  background: rgba(43, 32, 82, 0.4);
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.tag-list li.active {
  background: linear-gradient(135deg, #441b8a 0%, #552b94 100%);
  color: #d0d0d5;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(43, 32, 82, 0.4);
}

.reset-tag {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s;
  margin-left: 6px;
}

.reset-tag:hover {
  color: #a53a7a;
}

.separator {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(43, 32, 82, 0.3), transparent);
  margin: 25px 0;
}

.reset-all {
  width: 100%;
  margin-top: 15px;
  padding: 12px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #8a2147 0%, #a53a7a 100%);
  color: #d0d0d5;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(138, 33, 71, 0.3);
}

.reset-all:hover {
  background: linear-gradient(135deg, #9c2552 0%, #b34386 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(138, 33, 71, 0.4);
}

.select-wrapper {
  position: relative;
}

.rating-select {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(43, 32, 82, 0.3);
  background: rgba(12, 6, 30, 0.6);
  color: #d0d0d5;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23552b94' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  padding-right: 40px;
}

.rating-select:focus {
  outline: none;
  box-shadow: 0 0 12px rgba(69, 42, 119, 0.4);
  border-color: #552b94;
}

.select-wrapper .reset-tag {
  position: absolute;
  top: 50%;
  right: 40px;
  transform: translateY(-50%);
}

.filter-section {
  margin-bottom: 50px;
}

.filter-section h2,
.movie-list h2 {
  font-family: 'Montserrat', sans-serif;
  font-size: 2em;
  color: #d0d0d5;
  margin-bottom: 30px;
  text-align: center;
  animation: slideUp 0.5s ease-in;
  position: relative;
  display: inline-block;
  padding-bottom: 10px;
  width: 100%;
}

.filter-section h2::after,
.movie-list h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #552b94, #a53a7a, transparent);
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  padding: 20px;
}

@media (max-width: 1280px) {
  .movies-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .main-container.sidebar-open {
    margin-left: 0;
  }

  .sidebar {
    width: 100%;
  }

  .movies-grid {
    grid-template-columns: 1fr;
  }

  .filter-section h2,
  .movie-list h2 {
    font-size: 1.5em;
  }

  .dropdown {
    width: 100%;
  }

  .search-input {
    padding: 10px 35px 10px 35px;
  }

  .search-icon {
    left: 10px;
  }

  .clear-search {
    right: 8px;
  }
}

@media (max-width: 480px) {

  .filter-section h2,
  .movie-list h2 {
    font-size: 1.2em;
  }

  .search-input {
    padding: 8px 30px 8px 30px;
    font-size: 0.9em;
  }
}

.movie-card {
  background: linear-gradient(145deg, #0c0a19, #140d28);
  border: 1px solid rgba(43, 32, 82, 0.3);
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: all 0.4s ease;
  display: flex;
  flex-direction: column;
  z-index: 1;
  opacity: 0;
  animation: fadeInCard 0.6s forwards;
  position: relative;
}

.movie-card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  z-index: -1;
  border-radius: 20px;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.movie-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.movie-card:hover::before {
  opacity: 1;
}

.movie-link {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  border-radius: 16px;
}

.movie-cover {
  position: relative;
  width: 100%;
  height: 380px;
  object-fit: cover;
  transition: transform 0.5s ease;
  border-bottom: 1px solid rgba(43, 32, 82, 0.3);
}

.movie-card:hover .movie-cover {
  transform: scale(1.05);
  filter: brightness(1.1) contrast(1.1);
}

.movie-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
  color: #d0d0d5;
  margin: 16px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: color 0.3s ease;
}

.movie-card:hover .movie-title {
  color: #ffffff;
}

.movie-genre,
.movie-year {
  margin: 0 16px 12px;
  font-size: 0.9rem;
  color: rgba(208, 208, 213, 0.7);
  transition: color 0.3s ease;
}

.back-to-top {
  position: fixed;
  bottom: 25px;
  right: 25px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #441b8a 0%, #552b94 100%);
  color: #d0d0d5;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(43, 32, 82, 0.5);
  transition: all 0.3s ease;
  animation: pulse 2s infinite;
  font-size: 1.2rem;
  z-index: 1500;
}

.back-to-top:hover {
  background: linear-gradient(135deg, #522399 0%, #6133a0 100%);
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(43, 32, 82, 0.7);
  animation: none;
}

.no-movies {
  text-align: center;
  padding: 40px;
  color: #d0d0d5;
  font-size: 18px;
  animation: fadeIn 0.5s ease-in;
  background: rgba(16, 9, 34, 0.3);
  border-radius: 15px;
  border: 1px solid rgba(43, 32, 82, 0.2);
  margin: 20px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInCard {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(43, 32, 82, 0.7);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(43, 32, 82, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(43, 32, 82, 0);
  }
}
</style>
