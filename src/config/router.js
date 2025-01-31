import { createMemoryHistory, createRouter } from 'vue-router';

import main from '../views/main.vue';
import movie from '../views/movie.vue';
import AdminPanel from '../views/AdminPanel.vue';
import Auth from '../views/Auth.vue';
import axios from '../config/axios';
import { useUserStore } from '../store/user'
import EditMovie from '../views/EditMovie.vue';

const routes = [
  { path: '/movie/:id/edit', component: EditMovie, name: 'edit-movie', meta: { requiresAdmin: true } },
  { path: '/', component: main, name: 'main' },
  { path: '/movie/:id', component: movie, props: true, name: 'movie' },
  { path: '/admin', component: AdminPanel, name: 'admin', meta: { requiresAdmin: true, requiresAuth: true } },
  { path: '/Auth', component: Auth, name: 'auth' },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

// Middleware для проверки авторизации и роли
router.beforeEach(async (to, from, next) => {
  try {
    const response = await axios.get('/current-user');
    const user = response?.data;

    const userStore = useUserStore();
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

    useUserStore().role = 'guest'; // Устанавливаем роль как 'guest'
    if (to.meta.requiresAuth || to.meta.requiresAdmin) {
      return next('/Auth'); // Перенаправление на авторизацию
    }

    next();
  }
});


export default router;
