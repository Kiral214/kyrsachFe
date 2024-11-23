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
        <h2>Добавить фильм</h2>
        <form @submit.prevent="addMovie">
          <input v-model="newMovie.title" type="text" placeholder="Название фильма" required />
          <input v-model="newMovie.genre" type="text" placeholder="Жанр" required />
          <input v-model.number="newMovie.releaseYear" type="number" placeholder="Год выпуска" required />
          <textarea v-model="newMovie.description" placeholder="Описание фильма"></textarea>
          <input v-model="newMovie.actors" type="text" placeholder="Актеры (через запятую)" />
          <input v-model="newMovie.coverImage" type="text" placeholder="URL обложки фильма" />
          <input v-model.number="newMovie.productionYear" type="number" placeholder="Год производства" />
          <input v-model="newMovie.country" type="text" placeholder="Страна" />
          <input v-model="newMovie.slogan" type="text" placeholder="Слоган" />
          <input v-model="newMovie.director" type="text" placeholder="Режиссер" />
          <input v-model="newMovie.screenwriters" type="text" placeholder="Сценаристы" />
          <input v-model="newMovie.producers" type="text" placeholder="Продюсеры" />
          <input v-model="newMovie.operator" type="text" placeholder="Оператор" />
          <input v-model="newMovie.composer" type="text" placeholder="Композитор" />
          <input v-model="newMovie.artist" type="text" placeholder="Художник" />
          <input v-model="newMovie.editor" type="text" placeholder="Монтажер" />
          <input v-model="newMovie.budget" type="text" placeholder="Бюджет" />
          <input v-model="newMovie.premiere" type="text" placeholder="Премьера" />
          <input v-model="newMovie.mpaaRating" type="text" placeholder="Рейтинг MPAA" />
          <input v-model="newMovie.duration" type="text" placeholder="Продолжительность" />
          <button type="submit" class="add-button">Добавить фильм</button>
        </form>
      </section>

      <!-- Список фильмов -->
      <section class="list">
        <h2>Список фильмов</h2>
        <ul>
          <li v-for="movie in movies" :key="movie.id" class="list-item">
            <div>
              <strong>{{ movie.title }}</strong> ({{ movie.releaseYear }}) — {{ movie.genre }}
            </div>
            <button @click="deleteMovie(movie.id)" class="delete-button">Удалить фильм</button>
            <button @click="fetchReviews(movie.id)" class="view-button">Посмотреть отзывы</button>
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
            <button @click="deleteReview(review.id)" class="delete-button">Удалить отзыв</button>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '../config/axios';
import { useUserStore } from '../store/user'

const userStore = useUserStore()
// Базовый URL API
const API_URL = 'http://localhost:3000';

// Состояния
const newMovie = ref({
  title: '',
  genre: '',
  releaseYear: null,
  description: '',
  actors: '',
  coverImage: '',
  productionYear: null,
  country: '',
  slogan: '',
  director: '',
  screenwriters: '',
  producers: '',
  operator: '',
  composer: '',
  artist: '',
  editor: '',
  budget: '',
  premiere: '',
  mpaaRating: '',
  duration: ''
});
const movies = ref([]);
const reviews = ref([]);
const selectedMovie = ref(null);
const isAdmin = ref(false)


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
    alert('Не удалось загрузить фильмы');
  }
};

// Добавление фильма
const addMovie = async () => {
  try {
    await axios.post(`${API_URL}/movies`, newMovie.value);
    alert('Фильм успешно добавлен!');
    newMovie.value = { title: '', genre: '', releaseYear: null, description: '' };
    await fetchMovies(); // Обновляем список фильмов
  } catch (error) {
    console.error('Ошибка при добавлении фильма:', error);
    alert('Не удалось добавить фильм');
  }
};

// Удаление фильма
const deleteMovie = async (id) => {
  try {
    await axios.delete(`${API_URL}/movies/${id}`);
    alert('Фильм успешно удалён');
    await fetchMovies(); // Обновляем список фильмов
  } catch (error) {
    console.error('Ошибка при удалении фильма:', error);
    alert('Не удалось удалить фильм');
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
    alert('Не удалось загрузить отзывы');
  }
};

// Удаление отзыва
const deleteReview = async (id) => {
  try {
    await axios.delete(`${API_URL}/reviews/${id}`);
    alert('Отзыв успешно удалён');
    reviews.value = reviews.value.filter((review) => review.id !== id);
  } catch (error) {
    console.error('Ошибка при удалении отзыва:', error);
    alert('Не удалось удалить отзыв');
  }
};

// Инициализация
onMounted(async () => {
  await fetchCurrentUser();
  if (isAdmin.value) {
    await fetchMovies();
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
.admin-panel {
  max-width: 800px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.add-movie,
.movies-list,
.reviews-list {
  margin-bottom: 20px;
}

input,
textarea {
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.add-button {
  background-color: #28a745;
  color: white;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.view-button {
  background-color: #007bff;
  color: white;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 5px;
}

button:hover {
  opacity: 0.9;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
}

h2 {
  margin-bottom: 10px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.list-item {
  background: #fff;
  padding: var(--padding);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
