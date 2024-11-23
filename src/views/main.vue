<template>
  <div class="main-container">

    <section class="movie-list">
      <h2>Популярные фильмы</h2>
      <div class="movies-grid">
        <div v-for="(item, index) in data" :key="item.id" class="movie-card">
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
import { onMounted, ref } from 'vue';
import axios from '../config/axios';
import { RouterLink } from 'vue-router';

const data = ref([]);

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/movies');
    data.value = response.data;
  } catch (error) {
    console.error('Ошибка загрузки фильмов:', error);
  }
});

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

.main-container {
  font-family: 'Roboto', sans-serif;
  background: linear-gradient(120deg, #f0f3f4, #ffffff);
  color: #333;
  padding: 20px;
}



.movie-list {
  margin-top: 40px;
}

.movie-list h2 {
  font-size: 24px;
  color: #00416d;
  margin-bottom: 20px;
  text-align: center;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(5, 1fr);
  grid-column-gap: 0px;
  grid-row-gap: 0px;
}



@media (max-width: 1280px) {
  .movies-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(5, 1fr);
    grid-column-gap: 0px;
    grid-row-gap: 0px;
  }

}

@media (max-width: 768px) {
  .movies-grid {
    grid-template-columns: repeat(1, 1fr);
    grid-template-rows: repeat(5, 1fr);
    grid-column-gap: 0px;
    grid-row-gap: 0px;
  }
}

.movie-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.movie-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.movie-link {
  text-decoration: none;
  color: inherit;
}

.movie-cover {
  width: 100%;
  height: 320px;
  object-fit: cover;
}

.movie-title {
  font-size: 20px;
  font-weight: 700;
  margin: 15px 15px 5px;
  color: #00416d;
}

.movie-genre,
.movie-year {
  margin: 0 15px 10px;
  color: #666;
  font-size: 14px;
}

.back-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #00416d;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.back-to-top:hover {
  background: #005792;
}
</style>
