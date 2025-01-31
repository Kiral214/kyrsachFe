<template>
    <div class="edit-movie">
      <h2>Редактировать фильм</h2>
      <form @submit.prevent="updateMovie">
        <div class="form-group">
          <label>Название</label>
          <input type="text" v-model="movie.title" required />
        </div>
        <div class="form-group">
          <label>Жанр</label>
          <input type="text" v-model="movie.genre" required />
        </div>
        <div class="form-group">
          <label>Год выпуска</label>
          <input type="number" v-model="movie.releaseYear" required />
        </div>
        <div class="form-group">
          <label>Описание</label>
          <textarea v-model="movie.description"></textarea>
        </div>
        <div class="form-group">
          <label>Актеры</label>
          <input type="text" v-model="movie.actors" />
        </div>
        <button type="submit">Сохранить изменения</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import axios from '../config/axios';
  import { useRoute } from 'vue-router';
  
  const route = useRoute();
  const movie = ref({
    title: '',
    genre: '',
    releaseYear: '',
    description: '',
    actors: '',
  });
  
  const getMovieDetails = async () => {
    try {
      const { data } = await axios.get(`/movies/${route.params.id}`);
      movie.value = data.movie;
    } catch (error) {
      console.error('Ошибка при загрузке данных фильма:', error);
    }
  };
  
  const updateMovie = async () => {
    try {
      await axios.put(`/movies/${route.params.id}`, movie.value);
      alert('Фильм успешно обновлен!');
    } catch (error) {
      console.error('Ошибка при обновлении фильма:', error);
    }
  };
  
  onMounted(getMovieDetails);
  </script>
  
  <style scoped>
  .edit-movie {
    max-width: 600px;
    margin: 0 auto;
  }
  .form-group {
    margin-bottom: 15px;
  }
  label {
    display: block;
    margin-bottom: 5px;
  }
  input, textarea {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
  }
  button {
    padding: 10px 15px;
    background-color: #007BFF;
    color: #fff;
    border: none;
    cursor: pointer;
  }
  button:hover {
    background-color: #0056b3;
  }
  </style>
  