<template>
  <div class="admin-panel">
    <!-- Проверка на доступ администратора -->
    <div v-if="!isAdmin">
      <p>У вас нет доступа к этой странице.</p>
      <router-link to="/">Вернуться на главную</router-link>
    </div>

    <!-- Если пользователь администратор -->
    <div v-else>
      <!-- Секция добавления фильма -->
      <section class="add-movie">
        <h2>Добавить Контент</h2>
        <form @submit.prevent="addMovie">
          <input v-model="newMovie.title" type="text" placeholder="Название" required />
          <textarea v-model="newMovie.description" placeholder="Описание"></textarea>
          <input v-model="newMovie.coverImage" type="text" placeholder="URL обложки" />
          <input v-model="newMovie.videourl" type="text" placeholder="Ссылка на видео" />
          <div class="multiselect-container">
            <multiselect v-model="newMovie.tags" :options="tags" track-by="name" label="name" :multiple="true"
              :taggable="true">
            </multiselect>
          </div>
          <button type="submit" class="add-button">Добавить</button>
        </form>
      </section>

      <!-- Секция управления тегами -->
      <section class="manage-tags">
        <h2>Управление тегами</h2>
        <form @submit.prevent="addTag">
          <input v-model="newTag.name" type="text" placeholder="Название тега" required />
          <select v-model="newTag.category" required>
            <option value="anime">Аниме</option>
            <option value="movie">Фильмы</option>
            <option value="music">Музыка</option>
          </select>
          <button type="submit" class="add-button">Добавить тег</button>
        </form>
      </section>

      <!-- Список фильмов -->
      <section class="list">
        <h2>Список Контента</h2>
        <ul>
          <li v-for="movie in movies" :key="movie.id" class="list-item">
            <div>
              <strong>{{ movie.title }}</strong>
            </div>
            <div class="list-item-actions">
              <router-link :to="{ name: 'edit-movie', params: { id: movie.id } }">
                <button class="edit-button">Редактировать</button>
              </router-link>
              <button @click="deleteMovie(movie.id)" class="delete-button">Удалить</button>
              <button @click="fetchReviews(movie.id)" class="view-button">Посмотреть отзывы</button>
            </div>
          </li>
        </ul>
      </section>

      <!-- Список отзывов для выбранного фильма -->
      <section class="list" v-if="selectedMovie">
        <h2>Отзывы для фильма: {{ selectedMovie.title }}</h2>
        <ul>
          <li v-for="review in reviews" :key="review.id" class="list-item">
            <div>
              <strong>Рейтинг:</strong> {{ review.rating }} <br />
              <strong>Комментарий:</strong> {{ review.comment }} <br />
              <strong>Дата:</strong> {{ formatDate(review.createdAt) }}
            </div>
            <div class="list-item-actions">
              <button @click="deleteReview(review.id)" class="delete-button">Удалить отзыв</button>
            </div>
          </li>
        </ul>
      </section>

      <!-- Модальное окно уведомления -->
      <transition name="modal-fade">
        <div v-if="showNotification" class="notification-modal">
          <div :class="['notification-modal-content', notificationType === 'error' ? 'error' : '']">
            <div class="notification-icon-wrapper">
              <svg v-if="notificationType === 'error'"
                :class="['notification-icon', notificationType === 'error' ? 'error' : '']" fill="none"
                stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <svg v-else :class="['notification-icon', notificationType === 'error' ? 'error' : '']" fill="none"
                stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div class="notification-text-wrapper">
              <p class="notification-title">MediaStorage</p>
              <p class="notification-message">{{ notificationMessage }}</p>
            </div>
            <button @click="closeNotification" class="notification-close-btn">ОК</button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '../config/axios';
import { useUserStore } from '../store/user';
import Multiselect from 'vue-multiselect';

const userStore = useUserStore();
const API_URL = 'http://localhost:3000';
const selectedMovieId = ref(null);
const selectedTagId = ref(null);

// Состояния
const newMovie = ref({
  title: '',
  description: '',
  coverImage: '',
  videourl: '',
  tags: null,
});
const newTag = ref({
  name: '',
  category: 'anime',
});
const movies = ref([]);
const newMovieTags = ref(null);
const tags = ref([]);
const reviews = ref([]);
const selectedMovie = ref(null);
const isAdmin = ref(false);

// Состояния для уведомления
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref('success'); // 'success' или 'error'

// Функция для закрытия уведомления
const closeNotification = () => {
  showNotification.value = false;
  notificationMessage.value = '';
  notificationType.value = 'success'; // Сбрасываем тип уведомления
};

const assignTag = async () => {
  try {
    // Проверка, что выбраны и фильм, и тег
    if (!selectedMovieId.value || !selectedTagId.value) {
      notificationMessage.value = 'Пожалуйста, выберите фильм и тег.';
      notificationType.value = 'error';
      showNotification.value = true;
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

    notificationMessage.value = 'Тег успешно привязан к фильму!';
    notificationType.value = 'success';
    showNotification.value = true;
    selectedMovieId.value = null;
    selectedTagId.value = null;
  } catch (error) {
    console.error('Ошибка при привязке тега:', error);

    if (error.response) {
      console.error('Данные ошибки:', error.response.data);
      notificationMessage.value = `Ошибка: ${error.response.data.message || 'Неизвестная ошибка сервера'}`;
    } else if (error.request) {
      console.error('Запрос был отправлен, но ответ не получен:', километрerror.request);
      notificationMessage.value = 'Ошибка: Сервер не ответил на запрос.';
    } else {
      console.error('Ошибка при настройке запроса:', error.message);
      notificationMessage.value = 'Ошибка: Не удалось отправить запрос.';
    }
    notificationType.value = 'error';
    showNotification.value = true;
  }
};

// Функция для проверки текущего пользователя
const fetchCurrentUser = async () => {
  try {
    isAdmin.value = userStore.role === 'admin';
  } catch (error) {
    console.error('Ошибка при загрузке текущего пользователя:', error);
    isAdmin.value = false;
  }
};

// Получение списка фильмов
const fetchMovies = async () => {
  try {
    const response = await axios.get(`${API_URL}/movies`);
    movies.value = response.data;
  } catch (error) {
    console.error('Ошибка при загрузке фильмов:', error);
    notificationMessage.value = 'Не удалось загрузить фильмы';
    notificationType.value = 'error';
    showNotification.value = true;
  }
};

const fetchTags = async (search = '', category = '') => {
  try {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;

    const response = await axios.get(`${API_URL}/api/tags/`, { params });
    tags.value = response.data;
  } catch (error) {
    console.error('Ошибка при загрузке тегов:', error);
    notificationMessage.value = `Не удалось загрузить теги: ${error.response?.data?.message || error.message}`;
    notificationType.value = 'error';
    showNotification.value = true;
  }
};

// Добавление фильма
const addMovie = async () => {
  try {
    await axios.post(`${API_URL}/movies`, newMovie.value);
    notificationMessage.value = 'Фильм успешно добавлен!';
    notificationType.value = 'success';
    showNotification.value = true;
    newMovie.value = { title: '', description: '', coverImage: '', videourl: '', tags: null };
    await fetchMovies();
  } catch (error) {
    console.error('Ошибка при добавлении фильма:', error);
    notificationMessage.value = 'Не удалось добавить фильм';
    notificationType.value = 'error';
    showNotification.value = true;
  }
};

// Добавление тега
const addTag = async () => {
  try {
    await axios.post(`${API_URL}/api/tags/`, newTag.value);
    notificationMessage.value = 'Тег успешно добавлен!';
    notificationType.value = 'success';
    showNotification.value = true;
    newTag.value = { name: '', category: 'anime' };
    await fetchTags();
  } catch (error) {
    console.error('Ошибка при добавлении тега:', error);
    notificationMessage.value = 'Не удалось добавить тег';
    notificationType.value = 'error';
    showNotification.value = true;
  }
};

// Удаление тега
const deleteTag = async (id) => {
  try {
    await axios.delete(`${API_URL}/api/tags/${id}`);
    notificationMessage.value = 'Тег успешно удалён';
    notificationType.value = 'success';
    showNotification.value = true;
    await fetchTags();
  } catch (error) {
    console.error('Ошибка при удалении тега:', error);
    notificationMessage.value = 'Не удалось удалить тег';
    notificationType.value = 'error';
    showNotification.value = true;
  }
};

// Удаление фильма
const deleteMovie = async (id) => {
  try {
    await axios.delete(`${API_URL}/movies/${id}`);
    notificationMessage.value = 'Фильм успешно удалён';
    notificationType.value = 'success';
    showNotification.value = true;
    await fetchMovies();
  } catch (error) {
    console.error('Ошибка при удалении фильма:', error);
    notificationMessage.value = 'Не удалось удалить фильм';
    notificationType.value = 'error';
    showNotification.value = true;
  }
};

// Получение отзывов для фильма
const fetchReviews = async (movieId) => {
  try {
    const response = await axios.get(`${API_URL}/movies/${movieId}`);
    selectedMovie.value = response.data.movie;
    reviews.value = response.data.reviews;
  } catch (error) {
    console.error('Ошибка при загрузке отзывов:', error);
    notificationMessage.value = 'Не удалось загрузить отзывы';
    notificationType.value = 'error';
    showNotification.value = true;
  }
};

// Удаление отзыва
const deleteReview = async (id) => {
  try {
    await axios.delete(`${API_URL}/reviews/${id}`);
    notificationMessage.value = 'Отзыв успешно удалён';
    notificationType.value = 'success';
    showNotification.value = true;
    reviews.value = reviews.value.filter((review) => review.id !== id);
  } catch (error) {
    console.error('Ошибка при удалении отзыва:', error);
    notificationMessage.value = 'Не удалось удалить отзыв';
    notificationType.value = 'error';
    showNotification.value = true;
  }
};

// Инициализация
onMounted(async () => {
  await fetchCurrentUser();
  if (isAdmin.value) {
    await fetchMovies();
    await fetchTags();
  }
});

// Форматирование даты
const formatDate = (date) => {
  if (!date) return 'Дата отсутствует';
  const parsedDate = new Date(date);
  return parsedDate.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<style scoped>
/* Общие стили */
.admin-panel {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  background: #0f0514;
  color: #e0e0e0;
  font-family: 'Inter', system-ui, sans-serif;
}

/* Карточки для секций */
.add-movie,
.manage-tags,
.list,
.assign-tags {
  background: #1a1025;
  border: 1px solid #3a1b5a;
  border-radius: 16px;
  padding: 1.75rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 20px rgba(66, 0, 131, 0.15);
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 1.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #3a1b5a;
  text-align: center;
}

/* Формы */
form {
  display: grid;
  gap: 1.25rem;
}

input,
textarea,
select {
  width: 100%;
  padding: 0.875rem 1.125rem;
  background: #251231;
  border: 1px solid #4a2273;
  border-radius: 10px;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #9370DB;
  box-shadow: 0 0 0 3px rgba(147, 112, 219, 0.15);
  outline: none;
}

/* Кнопки */
button {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
}

.add-button {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border: none;
  color: #fff;
}

.delete-button {
  background: #dc3545;
  border: none;
  color: #fff;
}

.edit-button {
  background: #38217a;
  border: 1px solid #4a2273;
  color: #fff;
}

.view-button {
  background: #2b6cb0;
  border: none;
  color: #fff;
}

button:hover {
  filter: brightness(1.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

button:active {
  transform: translateY(0);
}

/* Список контента */
.list-item {
  background: #251231;
  border: 1px solid #3a1b5a;
  border-radius: 10px;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.list-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(147, 112, 219, 0.1);
  border-color: #6366f1;
}

.list-item-actions {
  display: flex;
  gap: 0.75rem;
}

/* Multiselect стиль */
.multiselect-container {
  margin-bottom: 0.5rem;
}

.multiselect {
  --ms-bg: #251231;
  --ms-border-color: #4a2273;
  --ms-tag-bg: #6366f120;
  --ms-tag-color: #9370DB;
  --ms-option-bg-selected: #4a2273;
  --ms-option-color-selected: white;
  --ms-ring-width: 3px;
  --ms-ring-color: rgba(147, 112, 219, 0.15);
}

/* Модальное окно */
.notification-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 5, 20, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.notification-modal-content {
  background: #1a1025;
  border: 1px solid #3a1b5a;
  padding: 1.75rem;
  border-radius: 16px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 500px;
  width: 90%;
}

.notification-modal-content.error {
  border-color: #dc3545;
}

.notification-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(147, 112, 219, 0.1);
  margin-right: 16px;
}

.notification-icon {
  width: 24px;
  height: 24px;
  color: #6366f1;
}

.notification-icon.error {
  color: #dc3545;
}

.notification-text-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #9370DB;
  margin-bottom: 6px;
}

.notification-message {
  font-size: 16px;
  line-height: 1.5;
  color: #ffffff;
}

.notification-close-btn {
  padding: 10px 18px;
  background: linear-gradient(90deg, #6366f1, #4f46e5);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-left: 16px;
}

.notification-close-btn:hover {
  background: linear-gradient(90deg, #818cf8, #6366f1);
  transform: scale(1.05);
}

.notification-close-btn:active {
  transform: scale(0.95);
}

/* Анимация появления и исчезновения */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Адаптивность */
@media (max-width: 768px) {
  .admin-panel {
    padding: 1.25rem;
  }

  .list-item {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .list-item-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>