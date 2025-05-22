<template>
    <div class="add-movie-page">
        <div class="glow-effect top-left"></div>
        <div class="glow-effect bottom-right"></div>
        <h2>Добавить Контент</h2>
        <form @submit.prevent="addMovie">
            <div class="input-group">
                <input v-model="newMovie.title" type="text" placeholder="Название" required />
                <span class="input-highlight"></span>
            </div>
            <div class="input-group">
                <textarea v-model="newMovie.description" placeholder="Описание"></textarea>
                <span class="input-highlight"></span>
            </div>
            <div class="input-group">
                <input v-model="newMovie.coverImage" type="text" placeholder="URL обложки" />
                <span class="input-highlight"></span>
            </div>
            <div class="input-group">
                <input v-model="newMovie.videourl" type="text" placeholder="Ссылка на видео" />
                <span class="input-highlight"></span>
            </div>
            <button type="submit" class="add-button">
                <span class="button-text">Добавить</span>
                <span class="button-glow"></span>
            </button>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '../config/axios';
import { useUserStore } from '@/store/user';
import Multiselect from 'vue-multiselect';

const userStore = useUserStore();
const newMovie = ref({
    title: '',
    description: '',
    coverImage: '',
    videourl: '',
    tags: [],
});
const tags = ref([]);

const fetchTags = async () => {
    try {
        const response = await axios.get('/api/tags');
        tags.value = response.data;
    } catch (error) {
        console.error('Ошибка при загрузке тегов:', error);
    }
};

const addMovie = async () => {
    try {
        await axios.post('/movies', newMovie.value);
        alert('Контент успешно добавлен!');
        // Увеличиваем счетчик добавленных фильмов
        userStore.setUser({ moviesAdded: (userStore.user.moviesAdded || 0) + 1 });
    } catch (error) {
        console.error('Ошибка при добавлении контент:', error);
        alert('Не удалось добавить контент');
    }
};

onMounted(() => {
    fetchTags();
});
</script>

<style scoped>
.add-movie-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 30px;
    background: linear-gradient(125deg, #0f0915 0%, #1b0f2e 40%, #230f33 70%, #0f0915 100%);
    color: #e0d8ff;
    border-radius: 12px;
    font-family: 'Montserrat', Arial, sans-serif;
    box-shadow: 0 10px 30px rgba(83, 51, 210, 0.3), 0 0 40px rgba(103, 71, 173, 0.15);
    position: relative;
    overflow: hidden;
    z-index: 1;
}

.add-movie-page::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(98, 0, 234, 0.02) 0%, transparent 70%);
    z-index: -1;
    animation: pulse 15s infinite linear;
}

.glow-effect {
    position: absolute;
    border-radius: 50%;
    z-index: -1;
    opacity: 0.4;
    filter: blur(70px);
}

.top-left {
    top: -50px;
    left: -50px;
    width: 200px;
    height: 200px;
    background: rgba(98, 0, 234, 0.2);
    animation: float 8s ease-in-out infinite alternate;
}

.bottom-right {
    bottom: -70px;
    right: -70px;
    width: 250px;
    height: 250px;
    background: rgba(61, 90, 254, 0.2);
    animation: float 10s ease-in-out infinite alternate-reverse;
}

@keyframes float {
    0% {
        transform: translate(0, 0) rotate(0deg);
    }

    100% {
        transform: translate(15px, 15px) rotate(5deg);
    }
}

@keyframes pulse {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

h2 {
    color: #8e7bff;
    text-align: center;
    margin-bottom: 25px;
    font-size: 28px;
    font-weight: 600;
    letter-spacing: 1px;
    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    position: relative;
}

h2::after {
    content: '';
    display: block;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #4a5feb, #9575cd);
    margin: 12px auto 0;
    border-radius: 2px;
}

.input-group {
    position: relative;
    margin-bottom: 20px;
}

.input-highlight {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #4e62f7, #8e7bff);
    transition: width 0.3s ease, left 0.3s ease;
}

input:focus+.input-highlight,
textarea:focus+.input-highlight {
    width: 100%;
    left: 0;
}

input,
textarea {
    display: block;
    width: 100%;
    padding: 15px;
    background: rgba(20, 13, 30, 0.7);
    border: 1px solid #3d2c66;
    border-radius: 8px;
    color: #e0d8ff;
    transition: all 0.3s ease;
    font-size: 15px;
    box-shadow: inset 0 1px 5px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(5px);
}

input:focus,
textarea:focus {
    border-color: #8e7bff;
    outline: none;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(142, 123, 255, 0.2), inset 0 1px 5px rgba(0, 0, 0, 0.1);
}

textarea {
    min-height: 150px;
    resize: vertical;
}

button {
    padding: 16px 28px;
    background: linear-gradient(135deg, #4e62f7, #6544e1);
    color: #ffffff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    font-size: 16px;
    width: 100%;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    overflow: hidden;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    box-shadow: 0 6px 15px rgba(90, 68, 198, 0.3);
}

.button-text {
    position: relative;
    z-index: 2;
}

.button-glow {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: 0.5s;
}

button:hover .button-glow {
    left: 100%;
}

button:hover {
    background: linear-gradient(135deg, #5a6ffa, #7556f4);
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(90, 68, 198, 0.4);
}

button:active {
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(90, 68, 198, 0.3);
}

::placeholder {
    color: #8777a8;
    opacity: 0.7;
}

@media (max-width: 768px) {
    .add-movie-page {
        padding: 20px;
    }
}
</style>