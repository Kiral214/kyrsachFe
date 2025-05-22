import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
    const user = ref({
        id: null,
        username: '',
        role: 'guest',
        token: localStorage.getItem('token') || '',
        avatarUrl: '',
        status: '',
        moviesAdded: 0,
        moviesWatched: 0,
        reviewsCount: 0,
        achievements: {}, // Добавляем achievements
    });

    const setUser = (userData) => {
        user.value = { ...user.value, ...userData };
        localStorage.setItem('token', userData.token);
    };

    const logout = () => {
        user.value = {
            id: null,
            username: '',
            role: 'guest',
            token: '',
            avatarUrl: '',
            status: '',
            moviesAdded: 0,
            moviesWatched: 0,
            reviewsCount: 0,
            achievements: {},
        };
        localStorage.removeItem('token');
    };

    return { user, setUser, logout };
});