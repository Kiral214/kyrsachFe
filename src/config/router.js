// src/router.js
import { createMemoryHistory, createRouter } from 'vue-router';
import LandingPage from '../views/LandingPage.vue';
import main from '../views/main.vue';
import movie from '../views/movie.vue';
import AdminPanel from '../views/AdminPanel.vue';
import UserProfile from '../views/UserProfile.vue';
import Auth from '../views/Auth.vue';
import axios from '../config/axios';
import { useUserStore } from '../store/user';
import EditMovie from '../views/EditMovie.vue';
import AssignTagToMovie from '../views/AssignTagToMovie.vue';
import AddMovie from '../views/AddMovie.vue'; // Новый импорт компонента

const routes = [
  { path: '/movie/:id/edit', component: EditMovie, name: 'edit-movie', meta: { requiresAdmin: true } },
  { path: '/', component: LandingPage, name: 'landing' },
  { path: '/main', component: main, name: 'main' },
  { path: '/movie/:id', component: movie, props: true, name: 'movie' },
  { path: '/admin', component: AdminPanel, name: 'admin', meta: { requiresAdmin: true, requiresAuth: true } },
  { path: '/profile', name: 'UserProfile', component: UserProfile },
  { path: '/Auth', component: Auth, name: 'auth' },
  { path: '/assign-tag', component: AssignTagToMovie, name: 'assign-tag' },
  { path: '/add-movie', component: AddMovie, name: 'add-movie' }, // Новый маршрут
  // Маршруты для категорий (заглушки)
  { path: '/books', component: main, name: 'books' },
  { path: '/series', component: main, name: 'series' },
  { path: '/documents', component: main, name: 'documents' },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

// Middleware для проверки авторизации и роли
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  try {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.get('/current-user');
    const user = response?.data;

    userStore.role = user.role;    // Устанавливаем роль
    userStore.userId = user.id;    // Устанавливаем ID

    if (to.meta.requiresAuth && !user) {
      return next('/Auth'); // Перенаправление на авторизацию
    }

    if (to.meta.requiresAdmin && user.role !== 'admin') {
      return next('/'); // Перенаправление на главную
    }

    next();
  } catch (error) {
    console.error('Ошибка при проверке пользователя:', error);

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      userStore.role = 'guest'; // Устанавливаем роль как 'guest'
      if (to.meta.requiresAuth || to.meta.requiresAdmin) {
        return next('/Auth'); // Перенаправление на авторизацию
      }
    }

    next();
  }
});

export default router;