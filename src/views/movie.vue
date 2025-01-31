<template>
  <div class="movie-page">
    <header class="movie-header">
      <img :src="movie.coverImage || 'placeholder.jpg'" alt="Обложка фильма" class="movie-cover" />
      <div class="movie-info">
        <h1>{{ movie.title }}</h1>
        <p><strong>Жанр:</strong> {{ movie.genre }}</p>
        <p><strong>Год выпуска:</strong> {{ movie.releaseYear }}</p>
        <p><strong>Описание:</strong> {{ movie.description }}</p>
        <p><strong>Актеры:</strong> {{ movie.actors || 'Неизвестно' }}</p>
        <p><strong>Средний рейтинг:</strong> {{ movie.averageRating || 'Нет отзывов' }}</p>
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
          <p class="review-comment"><strong>Комментарий:</strong> {{ item.comment }}</p>
          <p class="review-rating"><strong>Оценка:</strong> {{ item.rating }} / 10</p>
          <p class="review-date"><strong>Добавлено:</strong> {{ formatDate(item.createdAt) }}</p>
          <button v-if="item.userId === userStore.userId" @click="deleteReview(item.id)" class="delete-button">
            Удалить
          </button>
        </div>
      </div>
      <p v-else>Отзывов пока нет. Будьте первым!</p>
    </section>

    <section class="add-review">
      <h2>Оставить отзыв</h2>
      <WTextarea v-model="comment" placeholder="Введите ваш комментарий" />
      <WRatings v-model="rating" />
      <WButton @click="sendReview">Отправить</WButton>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from '../config/axios';
import WTextarea from '../components/wTextarea.vue';
import WButton from '../components/wButton.vue';
import WRatings from '../components/wRatings.vue';
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
});

const comment = ref('');
const rating = ref(0);
const userStore = useUserStore(); // Текущий пользователь

// Функция для перехода на страницу редактирования
const navigateToEditPage = () => {
  router.push(`/movie/${props.id}/edit`);
};

// Функция для получения текущего пользователя
const fetchCurrentUser = async () => {
  try {
    userStore.role = localStorage.getItem('role'); // Получение роли из localStorage
  } catch (error) {
    console.error('Ошибка при получении текущего пользователя:', error);
  }
};

// Удаление отзыва
const deleteReview = async (reviewId) => {
  try {
    await axios.delete(`/reviews/${reviewId}`);
    await getReviews(); // Обновить отзывы
  } catch (error) {
    console.error('Ошибка при удалении отзыва:', error);
  }
};

// Функция для получения данных о фильме
const getReviews = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/movies/${props.id}`);
    movie.value = response.data.movie;
    movie.value.reviews = response.data.reviews;
    movie.value.averageRating = response.data.movie.averageRating; // Средний рейтинг
  } catch (error) {
    console.error('Ошибка при загрузке данных фильма:', error);
  }
};

// Функция для отправки отзыва
const sendReview = async () => {
  try {
    await axios.post(`http://localhost:3000/movies/${props.id}/reviews`, {
      comment: comment.value,
      rating: rating.value,
    });
    await getReviews(); // Обновление данных после отправки
    comment.value = ''; // Очистка поля комментария
    rating.value = 0; // Сброс рейтинга
  } catch (error) {
    console.error('Ошибка при отправке отзыва:', error);
  }
};

// Форматирование даты для отображения
const formatDate = (date) => {
  if (!date) return 'Дата отсутствует'; // Если дата отсутствует
  const parsedDate = new Date(date);
  if (isNaN(parsedDate)) return 'Некорректная дата'; // Если дата некорректная
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return parsedDate.toLocaleDateString('ru-RU', options);
};

onMounted(async () => {
  await fetchCurrentUser();
  await getReviews();
});
</script>

<style scoped>
.movie-page {
  max-width: 800px;
  margin: 0 auto;
}

.movie-header {
  display: flex;
  gap: var(--padding);
}

.movie-cover {
  max-width: 300px;
  border-radius: var(--border-radius);
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-card {
  background: #fff;
  padding: var(--padding);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.edit-button {
  margin-top: 10px;
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.edit-button:hover {
  background-color: #0056b3;
}
</style>
