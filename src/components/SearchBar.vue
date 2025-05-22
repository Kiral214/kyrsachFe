<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from '../config/axios';

const query = ref('');
const movies = ref([]);
const loading = ref(false);
const router = useRouter();
const route = useRoute();
const suggestions = ref([]);

// Проверка, находимся ли мы на главной странице
const isHomePage = computed(() => route.path === '/main');

// Условие для отображения выпадающего меню
const showDropdown = computed(() => {
  return query.value.trim().length > 0 && (suggestions.value.length > 0 || movies.value.length > 0 || (!loading.value && movies.value.length === 0));
});

// История поиска и популярные запросы
const searchHistory = ref(JSON.parse(localStorage.getItem('searchHistory')) || []);
const popularSearches = ['комедии 2023', 'аниме 2024', 'рок музыка', 'боевики'];

// Обновление предложений автодополнения
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

// Выбор предложенного запроса
const selectSuggestion = (suggestion) => {
  query.value = suggestion;
  fetchMovies();
};

// Запрос фильмов по введенному тексту
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

// Очистка поиска
const clearSearch = () => {
  query.value = '';
  movies.value = [];
  suggestions.value = [];
};

// Отправка поиска
const submitSearch = () => {
  fetchMovies();
};

// Переход на страницу фильма
const goToMoviePage = (id) => {
  router.push(`/movie/${id}`);
  movies.value = [];
  query.value = '';
};
</script>

<style scoped>
/* Основной контейнер поиска */
.search-container {
  position: relative;
  width: 100%;
  padding: 0 20px;
  margin: 0;
}

/* Контейнер для строки поиска */
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: linear-gradient(90deg, #1e1e1e, #2a2a2a);
  border-radius: 12px;
  padding: 12px 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
}

/* Контейнер для поля ввода */
.search-input-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

/* Поле ввода */
.search-input {
  width: 100%;
  border: 1px solid #333;
  background: none;
  color: #f1f1f1;
  font-size: 18px;
  padding: 10px 15px 10px 40px;
  outline: none;
  font-family: 'Roboto', sans-serif;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #00ccff;
  box-shadow: 0 0 8px rgba(0, 204, 255, 0.3);
}

.search-input::placeholder {
  color: #888;
  font-style: italic;
}

/* Иконка поиска */
.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #f1f1f1;
  font-size: 16px;
}

/* Иконка очистки */
.clear-icon {
  position: absolute;
  right: 70px;
  top: 50%;
  transform: translateY(-50%);
  color: #f1f1f1;
  cursor: pointer;
  font-size: 16px;
  padding: 5px;
}

.clear-icon:hover {
  color: #00ccff;
}

/* Эффект свечения при наведении */
.search-bar:hover {
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

/* Эффект свечения при фокусе */
.search-bar:focus-within {
  box-shadow: 0 0 40px rgba(255, 255, 255, 0.5);
}

/* Элемент свечения (glow) */
.glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120%;
  height: 300%;
  border-radius: 100px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15), transparent);
  transition: all 0.5s ease;
  transform: translate(-50%, -50%) scale(0);
  z-index: -1;
}

/* Анимация свечения при наведении */
.search-bar:hover+.glow {
  transform: translate(-50%, -50%) scale(1);
}

/* Анимация свечения при фокусе */
.search-bar:focus-within+.glow {
  transform: translate(-50%, -50%) scale(1.3);
  background: radial-gradient(circle, rgba(255, 255, 255, 0.25), transparent);
}

/* Иконка загрузки */
.loading-icon {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  color: #f1f1f1;
  animation: spin 1s linear infinite;
  font-size: 18px;
}

/* Выпадающее меню */
.dropdown-menu {
  position: absolute;
  width: 100%;
  margin-top: 0.75rem;
  background: #1e1e1e;
  border-radius: 12px;
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.6);
  border: 1px solid #3a3a3a;
  z-index: 50;
  max-height: 350px;
  overflow-y: auto;
}

/* Элемент выпадающего меню */
.dropdown-item {
  padding: 1rem 1.5rem;
  color: #f1f1f1;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
}

.dropdown-item.suggestion {
  background: #2a2a2a;
}

/* Эффект при наведении на элемент выпадающего меню */
.dropdown-item:hover {
  background: linear-gradient(90deg, #333, #444);
  color: #fff;
}

/* Разделитель между элементами выпадающего меню */
.dropdown-item:not(:last-child) {
  border-bottom: 1px solid #3a3a3a;
}

/* Сообщение "Нет результатов" */
.no-results {
  color: #f1f1f1;
  font-style: italic;
}

/* Кнопка поиска */
.search-button {
  display: none;
  padding: 12px 24px;
  background: linear-gradient(135deg, #00ccff, #007acc);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-button:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

/* Анимация вращения для иконки загрузки */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .search-container {
    padding: 0 10px;
  }

  .search-input {
    font-size: 14px;
    padding: 8px 15px 8px 35px;
  }

  .search-icon {
    font-size: 14px;
    left: 8px;
  }

  .clear-icon {
    right: 60px;
    font-size: 14px;
  }

  .loading-icon {
    right: 30px;
    font-size: 16px;
  }

  .dropdown-item {
    padding: 0.75rem 1rem;
    font-size: 14px;
  }

  .search-button {
    display: block;
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 100;
  }
}
</style>