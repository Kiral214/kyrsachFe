<template>
  <header class="main-header">
    <router-link to="/">
      <h1>КиноОбзор</h1>
    </router-link>
    {{ userStore.role }}
    <nav>
      <router-link v-if='userStore.role === "admin"' to="/admin" class="nav-link">Админ-панель</router-link>
      <router-link v-if='userStore.role === "guest"' to="/Auth" class="nav-link">Логин</router-link>
      <a v-if='["user", "admin"].includes(userStore.role)' @click='exit' class="nav-link">Выйти</a>
    </nav>
  </header>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from './config/axios';
import { useUserStore } from './store/user'

const userStore = useUserStore()
const currentUser = ref('');

const exit = async () => {
  const response = await axios.post('http://localhost:3000/logout');
  localStorage.removeItem('role')
  localStorage.removeItem('token')
  userStore.role = 'guest'
}
</script>

<style scoped>
.app-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: var(--padding);
  background: var(--background-color);
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #5796bb;
  color: #fff;
  padding: 15px 20px;
  border-radius: 8px;
}

.main-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.nav-link {
  color: #ffc107;
  text-decoration: none;
  margin-left: 20px;
  font-size: 16px;
}

.nav-link:hover {
  text-decoration: underline;
}
</style>
