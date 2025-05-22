<template>
  <div class="form_main">
    <h1 class="heading">{{ isLogin ? 'Вход' : 'Регистрация' }}</h1>
    <div class="inputContainer">
      <input v-model="username" class="inputField" type="text" placeholder="Имя пользователя" />
    </div>
    <div class="inputContainer">
      <input v-model="password" class="inputField" type="password" placeholder="Пароль" />
    </div>
    <button id="button" @click="isLogin ? login() : register()">
      {{ isLogin ? 'Войти' : 'Зарегистрироваться' }}
    </button>
    <div class="signupContainer">
      <a @click="toggleMode">
        {{ isLogin ? 'Зарегистрироваться?' : 'Уже есть аккаунт' }}
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { toast } from 'vue3-toastify';
import axios from '../config/axios';
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
    toast.success("Успешный вход!", {
      autoClose: 3000,
      position: toast.POSITION.TOP_CENTER,
      theme: "dark",
      className: "custom-toast success-toast",
      icon: "✓",
    });
    setTimeout(() => router.push({ path: '/' }), 2000)
  } catch (error) {
    toast.error('Ошибка при входе: ' + error.response.data.message, {
      autoClose: 3000,
      position: toast.POSITION.TOP_CENTER,
      theme: "dark",
      className: "custom-toast error-toast",
      icon: "✕",
    });
  }
};

const register = async () => {
  try {
    await axios.post('/register', { username: username.value, password: password.value });
    toast.success('Успешная регистрация! Переключитесь на вход.', {
      autoClose: 3000,
      position: toast.POSITION.TOP_CENTER,
      theme: "dark",
      className: "custom-toast success-toast",
      icon: "✓",
    });
    isLogin.value = true;
  } catch (error) {
    toast.error('Ошибка при регистрации: ' + error.response.data.message, {
      autoClose: 3000,
      position: toast.POSITION.TOP_CENTER,
      theme: "dark",
      className: "custom-toast error-toast",
      icon: "✕",
    });
  }
};
</script>

<style scoped>
/* Устанавливаем стилизацию для всей страницы */
html,
body,
#app {
  background-color: #000000;
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  min-height: 100vh;
  background: radial-gradient(circle at center, rgba(20, 20, 40, 0.7) 0%, rgba(10, 10, 20, 0.9) 50%, #000000 100%);
}

/* Стилизация формы */
.form_main {
  width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(30, 30, 50, 0.9) 0%, rgba(20, 20, 40, 0.95) 100%);
  padding: 40px;
  border-radius: 18px;
  box-shadow: 0px 0px 30px rgba(118, 93, 222, 0.2), 0px 10px 20px rgba(0, 0, 0, 0.3);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  z-index: 1;
  border: 1px solid rgba(118, 93, 222, 0.3);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.form_main:hover {
  box-shadow: 0px 0px 40px rgba(118, 93, 222, 0.3), 0px 15px 25px rgba(0, 0, 0, 0.4);
}

/* Заголовок формы */
.heading {
  font-size: 2.5em;
  background: linear-gradient(45deg, #8863FB, #A18CEA);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700;
  margin: 10px 0 30px 0;
  text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  letter-spacing: 1px;
}

.heading::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, rgba(118, 93, 222, 0.2), rgba(118, 93, 222, 0.8), rgba(118, 93, 222, 0.2));
  border-radius: 2px;
}

/* Контейнер для полей ввода */
.inputContainer {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  margin: 12px 0;
}

/* Поля ввода */
.inputField {
  width: 100%;
  height: 50px;
  background-color: rgba(30, 30, 50, 0.8);
  border: 1px solid rgba(118, 93, 222, 0.3);
  border-radius: 12px;
  color: #ffffff;
  font-size: 1em;
  font-weight: 400;
  padding-left: 20px;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.15);
}

.inputField:focus {
  outline: none;
  border-color: rgba(118, 93, 222, 0.8);
  box-shadow: 0 0 12px rgba(118, 93, 222, 0.3), inset 0 2px 5px rgba(0, 0, 0, 0.1);
  background-color: rgba(40, 40, 60, 0.8);
}

.inputField::placeholder {
  color: rgba(200, 200, 220, 0.6);
  font-size: 0.95em;
}

/* Кнопка */
#button {
  width: 100%;
  border: none;
  background: linear-gradient(45deg, rgba(118, 93, 222, 0.9), rgba(91, 85, 199, 0.8));
  height: 50px;
  color: white;
  font-size: 1.1em;
  font-weight: 500;
  border-radius: 12px;
  margin: 25px 0 15px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(118, 93, 222, 0.3);
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

#button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.5s ease;
}

#button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(118, 93, 222, 0.4);
  background: linear-gradient(45deg, rgba(118, 93, 222, 1), rgba(91, 85, 199, 0.9));
}

#button:hover::before {
  left: 100%;
}

#button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(118, 93, 222, 0.3);
}

/* Контейнер для ссылки регистрации/входа */
.signupContainer {
  margin-top: 15px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.signupContainer a {
  background-color: rgba(40, 40, 70, 0.6);
  color: rgba(200, 200, 220, 0.9);
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 0.9em;
  border: 1px solid rgba(118, 93, 222, 0.2);
  text-decoration: none;
}

.signupContainer a:hover {
  background-color: rgba(118, 93, 222, 0.15);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(118, 93, 222, 0.2);
  border-color: rgba(118, 93, 222, 0.4);
}

/* Стилизация уведомлений (тостов) */
:global(.custom-toast) {
  background: linear-gradient(135deg, rgba(25, 25, 40, 0.95) 0%, rgba(35, 35, 60, 0.98) 100%) !important;
  border-radius: 12px !important;
  border: 1px solid rgba(118, 93, 222, 0.3) !important;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3), 0 0 20px rgba(118, 93, 222, 0.2) !important;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
  font-weight: 500 !important;
  color: #ffffff !important;
  backdrop-filter: blur(8px) !important;
  padding: 16px 20px !important;
  min-width: 300px !important;
  max-width: 90% !important;
  position: relative;
  overflow: hidden !important;
}

:global(.custom-toast::before) {
  content: '' !important;
  position: absolute !important;
  bottom: 0 !important;
  left: 0 !important;
  height: 3px !important;
  width: 100% !important;
  background: linear-gradient(90deg, transparent 0%, rgba(118, 93, 222, 0.3) 20%, rgba(118, 93, 222, 1) 100%) !important;
}

:global(.success-toast::before) {
  background: linear-gradient(90deg, transparent 0%, rgba(115, 248, 215, 0.3) 20%, rgba(115, 248, 215, 1) 100%) !important;
}

:global(.error-toast::before) {
  background: linear-gradient(90deg, transparent 0%, rgba(255, 107, 129, 0.3) 20%, rgba(255, 107, 129, 1) 100%) !important;
}

:global(.success-toast .Vue-Toastification__icon) {
  background: linear-gradient(135deg, #73F8D7, #50CDBD) !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  color: transparent !important;
  font-size: 1.5em !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
}

:global(.error-toast .Vue-Toastification__icon) {
  background: linear-gradient(135deg, #FF6B81, #FF4757) !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  color: transparent !important;
  font-size: 1.5em !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
}

:global(.Vue-Toastification__close-button) {
  color: rgba(200, 200, 220, 0.7) !important;
  font-size: 1.2em !important;
  transition: all 0.3s ease !important;
}

:global(.Vue-Toastification__close-button:hover) {
  color: #ffffff !important;
  transform: rotate(90deg) !important;
}

:global(.Vue-Toastification__toast-body) {
  font-size: 1.05em !important;
  line-height: 1.5 !important;
  padding-left: 6px !important;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 480px) {
  .form_main {
    width: 85%;
    padding: 30px 20px;
  }

  .heading {
    font-size: 2em;
  }

  .inputField {
    height: 45px;
  }

  #button {
    height: 45px;
    font-size: 1em;
  }

  :global(.custom-toast) {
    min-width: auto !important;
    max-width: 90% !important;
    padding: 12px 16px !important;
  }
}
</style>