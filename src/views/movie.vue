<template>
  <div class="movie-page">
    <header class="movie-header">
      <div class="movie-cover-container">
        <img :src="movie.coverImage || 'placeholder.jpg'" alt="Обложка фильма" class="movie-cover" />
      </div>
      <div class="movie-info">
        <h1>{{ movie.title }}</h1>
        <p class="tags-label"><strong>Теги:</strong></p>
        <div class="movie-tags">
          <span v-for="tag in movie.tags" :key="tag.id" class="tag">{{ tag.name }}</span>
        </div>

        <p class="description"><strong>Описание:</strong> {{ movie?.description || movie.generateddescription }}</p>
        <p class="rating"><strong>Средний рейтинг:</strong> {{ movie.averageRating || 'Нет отзывов' }}</p>

        <div v-if="movie.videourl" class="video-container">
          <iframe width="560" height="315" :src="movie.videourl" frameborder="0" title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin" allowfullscreen>
          </iframe>
        </div>
        <!-- Кнопка для редактирования (только для администраторов) -->
        <button v-if="userStore.role === 'admin'" @click="navigateToEditPage" class="edit-button">
          Редактировать
        </button>
      </div>
    </header>

    <section class="reviews-section">
      <h2>Отзывы:</h2>
      <div v-if="movie.reviews.length" class="reviews-list">
        <div v-for="(item, index) in movie.reviews" :key="item.id" class="review-card">
          <div class="review-header">
            <img :src="item.user.avatar || '/default-avatar.png'" alt="Аватар пользователя" class="avatar"
              @click="toggleMiniProfile(item.user)" />
            <span class="username">{{ item.user.username }}</span>
          </div>
          <p class="review-comment"><strong>Комментарий:</strong> {{ item.comment }}</p>
          <p class="review-rating"><strong>Оценка:</strong> {{ item.rating }} / 10</p>
          <p class="review-date"><strong>Добавлено:</strong> {{ formatDate(item.createdAt) }}</p>
          <button v-if="String(item.userId) === String(userStore.userId)" @click="deleteReview(item.id)"
            class="delete-button">
            Удалить
          </button>
        </div>
      </div>
      <p v-else class="no-reviews">Отзывов пока нет. Будьте первым!</p>
    </section>

    <!-- Мини-профиль с overlay -->
    <div v-if="showMiniProfile" class="mini-profile-overlay" @click="closeMiniProfile">
      <div class="mini-profile" @click.stop>
        <button class="close-btn" @click="closeMiniProfile">✕</button>
        <div class="relative">
          <img :src="selectedUser.avatar || '/default-avatar.png'" alt="Аватар пользователя" class="mini-avatar" />
          <span class="status-indicator" :class="selectedUser.status === 'Онлайн' ? 'online' : 'offline'"></span>
        </div>
        <h3 class="username">{{ selectedUser.username }}</h3>
        <p class="status-text">Статус: {{ selectedUser.status || 'Не указан' }}</p>
      </div>
    </div>

    <section class="add-review">
      <h2>Оставить отзыв</h2>
      <div class="review-form">
        <div class="textarea-wrapper">
          <textarea v-model="comment" placeholder="Поделитесь своими впечатлениями о фильме..."
            class="review-textarea"></textarea>
          <div class="glowing-border"></div>
        </div>

        <div class="rating-container">
          <p class="rating-label">Ваша оценка:</p>
          <div class="stars-container">
            <div v-for="star in 10" :key="star" @click="rating = star" class="star"
              :class="{ 'active': rating >= star }">
              ★
            </div>
            <span class="rating-value">{{ rating || 0 }}/10</span>
          </div>
        </div>

        <button @click="sendReview" class="submit-button">
          <span class="button-text">Отправить отзыв</span>
          <span class="button-icon">✓</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from '../config/axios';
import { useUserStore } from '../store/user';

const props = defineProps({
  id: Number,
});

const router = useRouter();
const movie = ref({
  title: '',
  genre: '',
  releaseYear: '',
  description: '',
  actors: '',
  coverImage: '',
  reviews: [],
  tags: [],
  generateddescription: ''
});

const comment = ref('');
const rating = ref(0);
const userStore = useUserStore();
const selectedUser = ref(null);
const showMiniProfile = ref(false);

// Открытие мини-профиля
const toggleMiniProfile = (user) => {
  selectedUser.value = user;
  showMiniProfile.value = true;
};

// Закрытие мини-профиля
const closeMiniProfile = () => {
  showMiniProfile.value = false;
  selectedUser.value = null;
};

// Функция для перехода на страницу редактирования
const navigateToEditPage = () => {
  router.push(`/movie/${props.id}/edit`);
};

// Функция для получения текущего пользователя
const fetchCurrentUser = async () => {
  try {
    userStore.role = localStorage.getItem('role');
  } catch (error) {
    console.error('Ошибка при получении текущего пользователя:', error);
  }
};

// Удаление отзыва
const deleteReview = async (reviewId) => {
  try {
    await axios.delete(`/reviews/${reviewId}`);
    await getReviews();
  } catch (error) {
    console.error('Ошибка при удалении отзыва:', error);
  }
};

// Функция для сохранения фильма в localStorage
const saveMovieToRecent = (movieData) => {
  const recentMovies = JSON.parse(localStorage.getItem('recentMovies') || '[]');
  const updatedMovies = recentMovies.filter(m => m.id !== movieData.id);
  updatedMovies.unshift(movieData);
  const limitedMovies = updatedMovies.slice(0, 5);
  localStorage.setItem('recentMovies', JSON.stringify(limitedMovies));
};

// Функция для получения данных о фильме
const getReviews = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/movies/${props.id}?include=tags`);
    movie.value = response.data.movie;
    movie.value.reviews = response.data.reviews;
    movie.value.averageRating = response.data.movie.averageRating;
    movie.value.videourl = response.data.movie.videourl;

    saveMovieToRecent({
      id: movie.value.id,
      title: movie.value.title,
      coverImage: movie.value.coverImage,
    });
  } catch (error) {
    console.error('Ошибка при загрузке данных фильма:', error);
  }
};

// Функция для отправки отзыва
const sendReview = async () => {
  if (!comment.value.trim() || rating.value === 0) {
    // Здесь можно добавить уведомление пользователю
    return;
  }

  try {
    await axios.post(`http://localhost:3000/movies/${props.id}/reviews`, {
      comment: comment.value,
      rating: rating.value,
    });
    await getReviews();
    comment.value = '';
    rating.value = 0;
  } catch (error) {
    console.error('Ошибка при отправке отзыва:', error);
  }
};

// Форматирование даты для отображения
const formatDate = (date) => {
  if (!date) return 'Дата отсутствует';
  const parsedDate = new Date(date);
  if (isNaN(parsedDate)) return 'Некорректная дата';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return parsedDate.toLocaleDateString('ru-RU', options);
};

onMounted(async () => {
  await fetchCurrentUser();
  await getReviews();
});
</script>

<style scoped>
/* Импорт шрифтов через Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Lora&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Roboto:wght@400;700&family=Nunito+Sans:wght@400;700&display=swap');

/* Основной контейнер страницы */
.movie-page {
  width: 100%;
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #0f0921 0%, #1c1134 50%, #2b1352 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Inter', sans-serif;
  color: #ffffff;
  overflow-x: hidden;
}

.movie-info p,
.review-comment,
.review-rating,
.review-date,
.status-text,
.join-date {
  line-height: 1.7;
  padding: 2px 0;
}

/* Хедер с обложкой и информацией */
.movie-header {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  padding: 60px;
  width: 100%;
  max-width: 1400px;
  background: rgba(26, 19, 47, 0.8);
  border-radius: 0 0 24px 24px;
  box-shadow: 0 8px 32px rgba(138, 43, 226, 0.2);
  position: relative;
  overflow: hidden;
  margin-bottom: 40px;
  backdrop-filter: blur(8px);
  border-top: 1px solid rgba(148, 87, 235, 0.2);
}

.movie-cover-container {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 0 30px rgba(138, 43, 226, 0.3);
}

.movie-cover {
  max-width: 350px;
  width: 100%;
  height: auto;
  border-radius: 16px;
  transition: transform 0.6s ease;
}

.movie-cover:hover {
  transform: scale(1.05);
}

/* Информация о фильме */
.movie-info {
  flex: 1;
  position: relative;
  z-index: 1;
  color: #ffffff;
}

.movie-info h1 {
  font-family: 'Montserrat', sans-serif;
  font-size: 2.8em;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.2;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(138, 43, 226, 0.5);
  letter-spacing: 0.5px;
}

.movie-info p {
  font-family: 'Inter', sans-serif;
  font-size: 1.1em;
  margin: 12px 0;
  color: #d8d8ff;
}

.movie-info .description {
  font-size: 1.2em;
  line-height: 1.8;
  margin: 20px 0;
  color: #c9c9ff;
}

.movie-info .rating {
  font-size: 1.25em;
  color: #a587ff;
  font-weight: 500;
}

/* Видео контейнер */
.video-container {
  margin: 40px 0;
  width: 100%;
  max-width: 900px;
  text-align: center;
}

.video-container iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
  height: auto;
  border-radius: 16px;
  border: 2px solid rgba(138, 43, 226, 0.3);
  box-shadow: 0 8px 24px rgba(138, 43, 226, 0.25);
}

/* Кнопка редактирования */
.edit-button {
  margin-top: 20px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #4568dc 0%, #3f5efb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 1.1em;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(63, 94, 251, 0.4);
}

.edit-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(63, 94, 251, 0.6);
}

/* Секция отзывов */
.reviews-section {
  margin: 40px 0;
  padding: 50px;
  width: 100%;
  max-width: 1400px;
  background: rgba(26, 19, 47, 0.8);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(138, 43, 226, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(148, 87, 235, 0.2);
}

.reviews-section h2 {
  font-family: 'Montserrat', sans-serif;
  font-size: 2.4em;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 30px;
  text-shadow: 0 0 10px rgba(138, 43, 226, 0.5);
  letter-spacing: 0.5px;
}

.no-reviews {
  font-size: 1.2em;
  color: #a587ff;
  text-align: center;
  margin: 40px 0;
}

/* Список отзывов */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Карточка отзыва */
.review-card {
  background: rgba(41, 25, 71, 0.8);
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(138, 43, 226, 0.15);
  border: 1px solid rgba(148, 87, 235, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.review-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(138, 43, 226, 0.3);
}

/* Хедер отзыва (аватар и никнейм) */
.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  margin-right: 15px;
  cursor: pointer;
  border: 2px solid rgba(138, 43, 226, 0.5);
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.avatar:hover {
  transform: scale(1.1);
  border-color: rgba(138, 43, 226, 1);
}

.username {
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  color: #c9c9ff;
  font-size: 1.1em;
  letter-spacing: 0.5px;
}

.review-comment,
.review-rating,
.review-date {
  font-family: 'Inter', sans-serif;
  font-size: 1.05em;
  margin: 10px 0;
  color: #d8d8ff;
}

.review-rating {
  color: #a587ff;
  font-weight: 500;
}

/* Кнопка удаления отзыва */
.delete-button {
  margin-top: 15px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #4568dc 0%, #3f5efb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(63, 94, 251, 0.4);
}

.delete-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(63, 94, 251, 0.6);
}

/* Overlay для мини-профиля */
.mini-profile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 9, 33, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(8px);
}

/* Сам мини-профиль */
.mini-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  background: rgba(41, 25, 71, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(138, 43, 226, 0.4);
  animation: slideIn 0.4s ease-in-out;
  border: 1px solid rgba(148, 87, 235, 0.4);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mini-profile {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Кнопка закрытия */
.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.5em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: #ff5c8d;
  transform: rotate(90deg);
}

/* Аватар в мини-профиле */
.mini-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  margin: 0 auto 20px;
  display: block;
  border: 4px solid rgba(138, 43, 226, 0.6);
  box-shadow: 0 8px 25px rgba(138, 43, 226, 0.3);
}

.relative {
  position: relative;
  display: inline-block;
}

.status-indicator {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  border: 3px solid rgba(41, 25, 71, 0.9);
}

.online {
  background-color: #4CAF50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.8);
}

.offline {
  background-color: #757575;
}

.mini-profile .username {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.8em;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 10px;
  text-align: center;
  text-shadow: 0 0 10px rgba(138, 43, 226, 0.5);
}

.status-text,
.join-date {
  font-family: 'Inter', sans-serif;
  font-size: 1.1em;
  color: #a587ff;
  margin: 8px 0;
  text-align: center;
}

/* НОВЫЕ СТИЛИ ДЛЯ ФОРМЫ ОТЗЫВА */

/* Секция добавления отзыва */
.add-review {
  margin: 40px 0 60px;
  padding: 50px;
  width: 100%;
  max-width: 1400px;
  background: rgba(26, 19, 47, 0.8);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(138, 43, 226, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(148, 87, 235, 0.2);
}

.add-review h2 {
  font-family: 'Montserrat', sans-serif;
  font-size: 2.4em;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 30px;
  text-shadow: 0 0 10px rgba(138, 43, 226, 0.5);
  letter-spacing: 0.5px;
}

/* Форма отзыва */
.review-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* Стили для textarea */
.textarea-wrapper {
  position: relative;
  width: 100%;
  margin-bottom: 5px;
}

.review-textarea {
  width: 100%;
  min-height: 150px;
  padding: 20px;
  font-family: 'Inter', sans-serif;
  font-size: 1.1em;
  color: #ffffff;
  background: rgba(41, 25, 71, 0.5);
  border: 2px solid rgba(138, 43, 226, 0.3);
  border-radius: 16px;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.2);
  resize: vertical;
  transition: all 0.3s ease;
  outline: none;
  z-index: 1;
}

.review-textarea::placeholder {
  color: rgba(201, 201, 255, 0.6);
}

.review-textarea:focus {
  border-color: rgba(138, 43, 226, 0.8);
  box-shadow: 0 0 20px rgba(138, 43, 226, 0.4), inset 0 2px 10px rgba(0, 0, 0, 0.2);
}

/* Glowing effect для textarea */
.glowing-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
  box-shadow: 0 0 25px rgba(138, 43, 226, 0.6);
  pointer-events: none;
}

.review-textarea:focus+.glowing-border {
  opacity: 1;
}

/* Рейтинг со звездами */
.rating-container {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 10px 0;
}

.rating-label {
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 1.1em;
  color: #a587ff;
  margin: 0;
}

.stars-container {
  display: flex;
  align-items: center;
  gap: 5px;
}

.star {
  font-size: 1.6em;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.star:hover {
  transform: scale(1.2);
}

.star.active {
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.7);
}

.rating-value {
  margin-left: 15px;
  font-family: 'Inter', sans-serif;
  font-size: 1.1em;
  font-weight: 600;
  color: #a587ff;
}

/* Кнопка отправки */
.submit-button {
  align-self: flex-start;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #4568dc 0%, #3f5efb 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 1.15em;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 6px 16px rgba(63, 94, 251, 0.4);
  position: relative;
  overflow: hidden;
}

.submit-button:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent);
  transition: 0.5s;
}

.submit-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(63, 94, 251, 0.6);
}

.submit-button:hover:before {
  left: 100%;
}

.button-icon {
  font-size: 1.2em;
}

/* Стили для тегов */
.movie-tags {
  margin: 15px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tags-label {
  margin-bottom: 5px;
  color: #a587ff;
}

.tag {
  display: inline-block;
  margin: 0 8px 8px 0;
  padding: 8px 16px;
  border-radius: 30px;
  background: linear-gradient(135deg, #4568dc 0%, #3f5efb 100%);
  color: white;
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 10px rgba(63, 94, 251, 0.4);
  transition: all 0.3s ease;
  cursor: pointer;
}

.tag:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 15px rgba(63, 94, 251, 0.6);
}

/* Адаптивность */
@media (max-width: 1024px) {
  .movie-header {
    padding: 40px;
    gap: 30px;
  }

  .video-container iframe {
    height: auto;
  }

  .reviews-section,
  .add-review {
    padding: 40px;
  }

  .rating-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .movie-header {
    flex-direction: column;
    align-items: center;
    padding: 30px;
  }

  .movie-cover {
    max-width: 280px;
  }

  .video-container iframe {
    height: auto;
  }

  .reviews-section h2,
  .add-review h2,
  .movie-info h1 {
    font-size: 2em;
  }

  .star {
    font-size: 1.4em;
  }
}

@media (max-width: 480px) {
  .movie-header {
    padding: 20px;
  }

  .movie-cover {
    max-width: 220px;
  }

  .video-container iframe {
    height: auto;
  }

  .mini-profile {
    max-width: 90%;
    padding: 20px;
  }

  .mini-avatar {
    width: 80px;
    height: 80px;
  }

  .mini-profile .username {
    font-size: 1.4em;
  }

  .status-text,
  .join-date {
    font-size: 0.95em;
  }

  .status-indicator {
    width: 20px;
    height: 20px;
  }

  .reviews-section,
  .add-review {
    padding: 25px;
  }

  .reviews-section h2,
  .add-review h2 {
    font-size: 1.7em;
  }

  .movie-info h1 {
    font-size: 1.8em;
  }

  .review-textarea {
    padding: 15px;
  }

  .star {
    font-size: 1.3em;
  }

  .submit-button {
    width: 100%;
    padding: 12px 20px;
  }
}
</style>