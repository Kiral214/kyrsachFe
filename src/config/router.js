import { createMemoryHistory, createRouter } from 'vue-router';

import main from '../views/main.vue';
import movie from '../views/movie.vue';
import AdminPanel from '../views/AdminPanel.vue';
import Auth from '../views/Auth.vue';
import axios from '../config/axios';
import { useUserStore } from '../store/user'


const routes = [
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

    useUserStore().role = response.data.role
    useUserStore().userId = response.data.id
    // Проверка авторизации
    
    if (to.meta.requiresAuth && !user) {
      return next('/Auth'); // Перенаправление на страницу авторизации
    }

    // Проверка, администратор ли пользователь
    if (to.meta.requiresAdmin && user.role !== 'admin') {
      return next('/'); // Перенаправление на главную страницу
    }

    next(); // Разрешить переход
  } catch (error) {
    console.error('Ошибка при проверке пользователя:', error);
    useUserStore().role = 'guest'
    if (to.meta.requiresAuth || to.meta.requiresAdmin) {
      return next('/Auth'); // Перенаправление на авторизацию
    }
    next();
  }
});


export default router;
