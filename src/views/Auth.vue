<template>
  <div class="auth-container">
    <h1>{{ isLogin ? 'Вход' : 'Регистрация' }}</h1>
    <div class="login-form">
      <input v-model="username" type="text" placeholder="Имя пользователя" class="auth-input" />
      <input v-model="password" type="password" placeholder="Пароль" class="auth-input" />
    </div>
    <div class="bottom-btn">
      <button @click="isLogin ? login() : register()">{{ isLogin ? 'Войти' : 'Зарегистрироваться' }}</button>
      <a @click="toggleMode" class="toggle-mode">
        {{ isLogin ? 'Зарегистрироваться?' : 'Уже есть аккаунт' }}
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { toast } from 'vue3-toastify';
import axios from '../config/axios'; // Подключение Axios
import router from '../config/router'

const isLogin = ref(true);
const username = ref('');
const password = ref('');

const toggleMode = () => {
  isLogin.value = !isLogin.value;
};

const login = async () => {
  try {
    await axios.post('/login', { username: username.value, password: password.value });
    // alert('Успешный вход!');
     toast("Успешный вход!", {
        autoClose: 3000,
      });
    // Перенаправление на защищённую страницу
    setTimeout(() => router.push({ path: '/' }), 2000)
    
  } catch (error) {
    alert('Ошибка при входе: ' + error.response.data.message);
  }
};

const register = async () => {
  try {
    await axios.post('/register', { username: username.value, password: password.value });
    alert('Успешная регистрация! Переключитесь на вход.');
    isLogin.value = true;
  } catch (error) {
    alert('Ошибка при регистрации: ' + error.response.data.message);
  }
};
</script>

<style scoped>
h1 {
  width: 100%;
  text-align: center;
}

.auth-container {
  max-width: 400px;
  margin: 0 auto;
  padding: var(--padding);
  background: #fff;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.bottom-btn {
  display: flex;
  flex-direction: column;
  gap: 12px
}

.auth-input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: var(--border-radius);
}

.toggle-mode {
  text-align: center;
  cursor: pointer;
}
</style>