<template>
  <div class="edit-movie">
    <div class="glow-effect top-left"></div>
    <div class="glow-effect bottom-right"></div>

    <h2>Редактировать Контента</h2>
    <!-- Уведомление -->
    <div v-if="showNotification" class="notification" :class="notificationStatus">
      <div class="notification-content">
        <div class="notification-icon">
          <svg v-if="notificationStatus === 'success'" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="notification-message">{{ notificationMessage }}</div>
      </div>
    </div>
    <form @submit.prevent="updateMovie">
      <div class="form-group">
        <label>Название</label>
        <input type="text" v-model="movie.title" required />
      </div>
      <div class="form-group">
        <label>Описание</label>
        <textarea v-model="movie.description"></textarea>
      </div>
      <div class="form-group">
        <label>URL обложки</label>
        <input type="text" v-model="movie.coverImage" />
      </div>
      <div class="form-group">
        <label>Ссылка на видео</label>
        <input type="text" v-model="movie.videourl" />
      </div>

      <!-- Секция выбора тегов -->
      <div class="form-group">
        <label>Теги</label>
        <div v-if="isLoading" class="loading-message">
          Загрузка данных...
        </div>
        <div v-else-if="allTags.length === 0" class="error-message">
          Теги не найдены. Попробуйте обновить страницу.
        </div>
        <div v-else>
          <multiselect v-model="selectedTags" :options="allTags" :multiple="true" :close-on-select="false"
            :clear-on-select="false" :preserve-search="true" placeholder="Выберите теги" label="name" track-by="id"
            :searchable="true" :taggable="false">
            <!-- Кастомный шаблон для отображения тегов -->
            <template #option="{ option }">
              {{ option.name }} ({{ option.category }})
            </template>
            <template #tag="{ option, remove }">
              <span class="multiselect__tag">
                {{ option.name }} ({{ option.category }})
                <i class="multiselect__tag-icon" @click="remove(option)"></i>
              </span>
            </template>
          </multiselect>
        </div>
      </div>



      <div class="button-group">
        <button type="submit" :disabled="isLoading" class="save-button">
          <span class="button-content">Сохранить изменения</span>
          <span class="button-glow"></span>
        </button>
        <router-link to="/admin">
          <button type="button" class="cancel-button">
            <span class="button-content">Отмена</span>
          </button>
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from '../config/axios';
import { useUserStore } from '@/store/user';
import Multiselect from 'vue-multiselect';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const movie = ref({
  title: '',
  description: '',
  coverImage: '',
  videourl: '',
});
const allTags = ref([]);
const selectedTags = ref([]);
const isLoading = ref(true);

const getMovieDetails = async () => {
  try {
    const { data } = await axios.get(`/movies/${route.params.id}`);
    if (!data.movie) {
      throw new Error('Данные фильма не найдены в ответе сервера');
    }
    movie.value = { ...data.movie, productionYear: data.movie.productionYear || null };
    selectedTags.value = data.movie.tags || [];
  } catch (error) {
    console.error('Ошибка при загрузке данных фильма:', error);
    alert('Не удалось загрузить данные фильма: ' + (error.response?.data?.message || error.message));
    movie.value = {
      title: '',
      genre: '',
      releaseYear: '',
      description: '',
      coverImage: '',
      productionYear: null,
      videourl: '',
      actors: '',
    };
    selectedTags.value = [];
  }
};

const fetchAllTags = async () => {
  try {
    const response = await axios.get('/api/tags');
    if (Array.isArray(response.data)) {
      allTags.value = response.data;
    } else {
      throw new Error('Неверный формат данных тегов');
    }
  } catch (error) {
    console.error('Ошибка при загрузке тегов:', error);
    alert('Не удалось загрузить теги: ' + (error.response?.data?.message || error.message));
    allTags.value = [];
  }
};

const showNotification = ref(false);
const notificationMessage = ref('');
const notificationStatus = ref('success');

const updateMovie = async () => {
  try {
    const payload = {
      ...movie.value,
      tags: selectedTags.value.map(tag => tag.id),
    };
    await axios.put(`/movies/${route.params.id}`, payload);
    notificationMessage.value = 'Фильм успешно обновлен!';
    notificationStatus.value = 'success';
    showNotification.value = true;
    setTimeout(() => {
      showNotification.value = false;
      router.push('/admin');
    }, 2000);
  } catch (error) {
    console.error('Ошибка при обновлении фильма:', error);
    notificationMessage.value = 'Не удалось обновить фильм: ' + (error.response?.data?.message || error.message);
    notificationStatus.value = 'error';
    showNotification.value = true;
    setTimeout(() => {
      showNotification.value = false;
    }, 3000);
  }
};

const markAsWatched = () => {
  userStore.setUser({ moviesWatched: (userStore.user.moviesWatched || 0) + 1 });
  notificationMessage.value = 'Фильм отмечен как просмотренный!';
  notificationStatus.value = 'success';
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 2000);
};

onMounted(async () => {
  try {
    isLoading.value = true;
    await Promise.all([getMovieDetails(), fetchAllTags()]);

    // Добавляем эффект появления для элементов формы
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
      setTimeout(() => {
        group.style.opacity = '0';
        group.style.transform = 'translateY(20px)';
        group.style.transition = 'all 0.4s ease';

        nextTick(() => {
          group.style.opacity = '1';
          group.style.transform = 'translateY(0)';
        });
      }, index * 100);
    });

  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.edit-movie {
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Montserrat', Arial, sans-serif;
  background: linear-gradient(135deg, #130f24 0%, #191431 100%);
  color: #e0d8f0;
  padding: 30px;
  border-radius: 12px;
  border: 1px solid #3a2a5a;
  box-shadow: 0 6px 25px rgba(88, 28, 135, 0.18);
  position: relative;
  backdrop-filter: blur(10px);
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

h2 {
  color: #a78bfa;
  text-align: center;
  margin-bottom: 28px;
  font-size: 32px;
  font-weight: 700;
  text-shadow: 0 0 15px rgba(167, 139, 250, 0.4);
  letter-spacing: 1px;
  position: relative;
  display: inline-block;
  width: 100%;
}

h2:after {
  content: '';
  position: absolute;
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, rgba(167, 139, 250, 0) 0%, rgba(167, 139, 250, 0.8) 50%, rgba(167, 139, 250, 0) 100%);
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
}

.form-group {
  margin-bottom: 22px;
  position: relative;
  transition: all 0.3s ease;
}

.form-group:hover label {
  color: #a78bfa;
  transform: translateY(-2px);
}

label {
  display: block;
  margin-bottom: 10px;
  color: #c4b5e0;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 16px;
  letter-spacing: 0.5px;
}

input,
textarea {
  display: block;
  width: 100%;
  margin-bottom: 15px;
  padding: 14px 16px;
  background: rgba(26, 19, 37, 0.7);
  border: 1px solid #3a2a5a;
  border-radius: 8px;
  color: #e0d8f0;
  transition: all 0.3s ease;
  font-size: 15px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #6d4aff;
  box-shadow: 0 0 0 3px rgba(109, 74, 255, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.1);
  background: rgba(30, 23, 44, 0.8);
}

.glow-effect {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  z-index: 0;
  opacity: 0.4;
  pointer-events: none;
}

.top-left {
  top: -100px;
  left: -100px;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(122, 90, 211, 0.3) 0%, rgba(76, 29, 149, 0.1) 70%, transparent 100%);
  animation: pulse 8s infinite alternate;
}

.bottom-right {
  bottom: -100px;
  right: -100px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(79, 70, 229, 0.2) 0%, rgba(67, 56, 202, 0.1) 70%, transparent 100%);
  animation: pulse 10s infinite alternate-reverse;
}

@keyframes pulse {
  0% {
    opacity: 0.2;
    transform: scale(0.8);
  }

  100% {
    opacity: 0.4;
    transform: scale(1.2);
  }
}

button {
  padding: 14px 28px;
  border-radius: 8px;
  cursor: pointer;
  margin: 8px 5px 0 0;
  transition: all 0.3s ease;
  font-weight: 600;
  letter-spacing: 0.5px;
  font-size: 15px;
  position: relative;
  overflow: hidden;
}

.button-content {
  position: relative;
  z-index: 2;
}

.button-glow {
  position: absolute;
  top: -20%;
  left: -10%;
  width: 120%;
  height: 140%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: skewX(-25deg);
  transition: all 0.5s ease;
  opacity: 0;
}

button:hover .button-glow {
  animation: shine 1.5s ease-in-out;
}

@keyframes shine {
  0% {
    left: -100%;
    opacity: 0;
  }

  20% {
    opacity: 0.6;
  }

  100% {
    left: 100%;
    opacity: 0;
  }
}

.save-button {
  background: linear-gradient(135deg, #4a30a0 0%, #3c15c7 100%);
  color: #ffffff;
  border: none;
  box-shadow: 0 4px 10px rgba(74, 48, 160, 0.3);
}

.save-button:hover {
  background: linear-gradient(135deg, #5a40b0 0%, #4c25d7 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(74, 48, 160, 0.4);
}

.save-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 6px rgba(74, 48, 160, 0.4);
}

.save-button:disabled {
  background: linear-gradient(135deg, #39305a 0%, #332b55 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.cancel-button {
  background: linear-gradient(135deg, #2d2241 0%, #3d2852 100%);
  color: #c0b6e0;
  border: 1px solid #4a3968;
}

.cancel-button:hover {
  background: linear-gradient(135deg, #3d3251 0%, #4d3862 100%);
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(45, 34, 65, 0.3);
}

.cancel-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 6px rgba(45, 34, 65, 0.3);
}

.action-button {
  background: linear-gradient(135deg, #3a2b8a 0%, #2d1e70 100%);
  color: #ffffff;
  border: none;
  box-shadow: 0 4px 8px rgba(58, 43, 138, 0.25);
}

.action-button:hover {
  background: linear-gradient(135deg, #4a3b9a 0%, #3d2e80 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(58, 43, 138, 0.35);
}

.action-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 6px rgba(58, 43, 138, 0.35);
}

.button-group {
  display: flex;
  justify-content: flex-start;
  margin-top: 25px;
}

.loading-message,
.error-message {
  color: #a394d0;
  font-style: italic;
  padding: 12px;
  border-radius: 8px;
  background: rgba(47, 30, 82, 0.3);
  border-left: 3px solid #6d4aff;
}

/* Стили для мультиселекта */
.multiselect {
  margin-bottom: 15px;
}

.multiselect__tags {
  background: rgba(26, 19, 37, 0.7);
  border: 1px solid #3a2a5a;
  border-radius: 8px;
  color: #e0d8f0;
  padding: 12px;
  transition: all 0.3s ease;
}

.multiselect__tags:hover {
  border-color: #533d89;
}

.multiselect__tag {
  background: #4a30a0;
  color: #ffffff;
  border-radius: 4px;
  margin: 3px;
  padding: 6px 26px 6px 10px;
}

.multiselect__tag-icon {
  border-radius: 0 4px 4px 0;
}

.multiselect__tag-icon::after {
  color: #e0d8f0;
}

.multiselect__tag-icon:hover::after {
  color: #ffffff;
}

.multiselect__option--highlight {
  background: #4a30a0;
  color: #ffffff;
}

.multiselect__option--selected {
  background: #2d1e70;
  color: #ffffff;
}

.multiselect__option--highlight.multiselect__option--selected {
  background: #5a40b0;
}

.multiselect__input,
.multiselect__single {
  background: transparent;
  color: #e0d8f0;
  font-size: 15px;
}

.multiselect__content-wrapper {
  background: rgba(26, 19, 37, 0.95);
  border: 1px solid #3a2a5a;
  color: #e0d8f0;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.multiselect__option {
  padding: 10px 12px;
}

.multiselect__select::before {
  border-color: #9370DB transparent transparent transparent;
}

.multiselect__placeholder {
  color: #8870b0;
  padding-top: 0;
}

/* Стили для уведомления */
.notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  min-width: 320px;
  max-width: 450px;
  padding: 18px;
  border-radius: 10px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  animation: slideDown 0.4s ease-out forwards, glow 2s infinite alternate;
  backdrop-filter: blur(5px);
}

.notification.success {
  background: linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(55, 48, 163, 0.95) 100%);
  border-left: 5px solid #4f46e5;
  color: white;
}

.notification.error {
  background: linear-gradient(135deg, rgba(127, 29, 29, 0.95) 0%, rgba(153, 27, 27, 0.95) 100%);
  border-left: 5px solid #ef4444;
  color: white;
}

.notification-content {
  display: flex;
  align-items: center;
}

.notification-icon {
  margin-right: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  padding: 8px;
}

.notification-message {
  font-weight: 500;
  font-size: 16px;
  line-height: 1.5;
  letter-spacing: 0.3px;
}

@keyframes slideDown {
  0% {
    opacity: 0;
    transform: translate(-50%, -30px);
  }

  100% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@keyframes glow {
  0% {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }

  100% {
    box-shadow: 0 8px 30px rgba(106, 76, 156, 0.35);
  }
}

/* Добавление фонового эффекта */
body {
  background: linear-gradient(135deg, #0f0820 0%, #17102b 100%);
  min-height: 100vh;
  background-attachment: fixed;
  position: relative;
}

body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 10% 20%, rgba(106, 76, 156, 0.1) 0%, transparent 35%),
    radial-gradient(circle at 90% 80%, rgba(74, 48, 160, 0.08) 0%, transparent 35%);
  pointer-events: none;
  z-index: -1;
}

h2 {
  color: #9370DB;
  text-align: center;
  margin-bottom: 25px;
  font-size: 28px;
  text-shadow: 0 0 10px rgba(147, 112, 219, 0.3);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #b8a9d8;
  font-weight: 500;
}

input,
textarea {
  display: block;
  width: 100%;
  margin-bottom: 15px;
  padding: 14px;
  background: #1a1325;
  border: 1px solid #3a2a5a;
  border-radius: 6px;
  color: #e0d8f0;
  transition: all 0.3s ease;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #6a4c9c;
  box-shadow: 0 0 10px rgba(106, 76, 156, 0.25);
}

button {
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  margin: 8px 5px 0 0;
  transition: all 0.3s ease;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.save-button {
  background: linear-gradient(135deg, #4a30a0 0%, #3c15c7 100%);
  color: #ffffff;
  border: none;
  box-shadow: 0 4px 10px rgba(74, 48, 160, 0.3);
}

.save-button:hover {
  background: linear-gradient(135deg, #5a40b0 0%, #4c25d7 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(74, 48, 160, 0.4);
}

.save-button:disabled {
  background: #39305a;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.cancel-button {
  background: linear-gradient(135deg, #2d2241 0%, #3d2852 100%);
  color: #c0b6e0;
  border: 1px solid #4a3968;
}

.cancel-button:hover {
  background: linear-gradient(135deg, #3d3251 0%, #4d3862 100%);
  color: #ffffff;
}

.action-button {
  background: linear-gradient(135deg, #3a2b8a 0%, #2d1e70 100%);
  color: #ffffff;
  border: none;
  box-shadow: 0 4px 8px rgba(58, 43, 138, 0.25);
}

.action-button:hover {
  background: linear-gradient(135deg, #4a3b9a 0%, #3d2e80 100%);
  transform: translateY(-2px);
}

.button-group {
  display: flex;
  justify-content: flex-start;
  margin-top: 20px;
}

.loading-message,
.error-message {
  color: #9985c8;
  font-style: italic;
  padding: 10px;
  border-radius: 6px;
  background: rgba(47, 30, 82, 0.3);
}

/* Стили для мультиселекта */
.multiselect {
  margin-bottom: 15px;
}

.multiselect__tags {
  background: #1a1325;
  border: 1px solid #3a2a5a;
  border-radius: 6px;
  color: #e0d8f0;
  padding: 10px;
}

.multiselect__tag {
  background: #4a30a0;
  color: #ffffff;
  border-radius: 4px;
}

.multiselect__tag-icon::after {
  color: #e0d8f0;
}

.multiselect__tag-icon:hover::after {
  color: #ffffff;
}

.multiselect__option--highlight {
  background: #4a30a0;
  color: #ffffff;
}

.multiselect__option--selected {
  background: #2d1e70;
  color: #ffffff;
}

.multiselect__option--highlight.multiselect__option--selected {
  background: #5a40b0;
}

.multiselect__input,
.multiselect__single {
  background: #1a1325;
  color: #e0d8f0;
}

.multiselect__content-wrapper {
  background: #1a1325;
  border: 1px solid #3a2a5a;
  color: #e0d8f0;
  border-radius: 6px;
}

.multiselect__select::before {
  border-color: #9370DB transparent transparent transparent;
}

.multiselect__placeholder {
  color: #8870b0;
}
</style>