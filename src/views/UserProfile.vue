<template>
  <div class="profile-container">
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else>
      <!-- Модальное окно для редактирования -->
      <div v-if="showEditModal" class="modal-overlay">
        <div class="modal-content">
          <h3>Редактировать профиль</h3>
          <form @submit.prevent="updateProfile">
            <div class="form-group">
              <label>Имя пользователя</label>
              <input v-model="editForm.username" type="text" required minlength="3" maxlength="50">
            </div>
            <div class="form-group">
              <label>Статус</label>
              <input v-model="editForm.status" type="text" maxlength="100">
            </div>
            <div class="form-group">
              <label>Аватар</label>
              <input type="file" @change="handleAvatarChange" accept="image/*">
              <img v-if="previewAvatar" :src="previewAvatar" alt="Preview" class="avatar-preview" />
            </div>
            <div class="modal-actions">
              <button type="button" @click="showEditModal = false">Отмена</button>
              <button type="submit" :disabled="loading">
                <span v-if="loading" class="spinner"></span>
                {{ loading ? 'Сохранение...' : 'Сохранить' }}
              </button>
            </div>
            <p v-if="error" class="error-message">{{ error }}</p>
            <p v-if="success" class="success-message">{{ success }}</p>
          </form>
        </div>
      </div>

      <!-- Модальное окно для нового достижения -->
      <div v-if="showAchievementModal" class="achievement-modal-overlay">
        <div class="achievement-modal-content">
          <h3>Новое достижение!</h3>
          <div class="achievement-icon-wrapper">
            <component :is="newAchievement?.icon" class="achievement-icon" />
          </div>
          <p>{{ newAchievement?.title }}: {{ newAchievement?.description }}</p>
          <button @click="showAchievementModal = false">Закрыть</button>
        </div>
      </div>

      <!-- Главный блок профиля -->
      <div class="main-profile-section">
        <!-- Карточка профиля -->
        <div class="profile-card">
          <div class="avatar-section">
            <div class="avatar-container">
              <img :src="userStore.user?.avatarUrl || defaultAvatar" alt="User avatar" class="avatar"
                @error="handleImageError" />
            </div>
            <button class="edit-profile-btn" @click="showEditModal = true">
              <i class="fas fa-edit"></i> Редактировать
            </button>
          </div>
          <div class="profile-info">
            <h2>{{ userStore.user?.username || 'Неизвестный пользователь' }}</h2>
            <p class="status-text">{{ userStore.user?.status || 'Нет статуса' }}</p>
            <p class="member-since"><i class="fas fa-calendar-alt"></i> Участник с: {{
              formatDate(userStore.user?.created_at) }}</p>
          </div>
        </div>

        <!-- Навигационные вкладки -->
        <div class="navigation-tabs">
          <button class="tab" :class="{ active: activeTab === 'activity' }" @click="activeTab = 'activity'">
            Активность
          </button>
          <button class="tab" :class="{ active: activeTab === 'badges' }" @click="activeTab = 'badges'">
            Достижения
          </button>
          <button class="tab" :class="{ active: activeTab === 'stats' }" @click="activeTab = 'stats'">
            Статистика
          </button>
        </div>

        <!-- Секция контента в зависимости от активной вкладки -->
        <div class="tab-content">
          <!-- Секция активности -->
          <div v-if="activeTab === 'activity'" class="activity-section">
            <h3>Недавняя активность</h3>
            <div v-if="recentMovies.length" class="activity-list">
              <div v-for="movie in recentMovies" :key="movie.id" class="activity-item" @click="goToMovie(movie.id)">
                <div class="movie-cover-container">
                  <img :src="movie.coverImage || defaultAvatar" alt="Обложка фильма" class="movie-cover"
                    @error="handleImageError" />
                </div>
                <div class="movie-info">
                  <p class="movie-title">{{ movie.title }}</p>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <i class="fas fa-film empty-icon"></i>
              <p>Нет недавней активности</p>
            </div>
          </div>

          <!-- Секция достижений -->
          <div v-if="activeTab === 'badges'" class="badges-section">
            <h3>Достижения</h3>
            <div class="badges-list">
              <div v-for="badge in badges" :key="badge.id" class="badge-item"
                :class="{ 'badge-unlocked': badge.unlocked }">
                <div class="badge-icon-container">
                  <component :is="badge.icon" class="badge-icon" :class="{ 'unlocked': badge.unlocked }" />
                  <div v-if="!badge.unlocked" class="badge-lock">
                    <Lock class="lock-icon" />
                  </div>
                </div>
                <div class="badge-details">
                  <p class="badge-name">{{ badge.label }}</p>
                  <p class="badge-description">{{ badge.description }}</p>
                </div>
              </div>
            </div>
            <div class="achievement-actions">
              <button class="unlock-achievement-btn" @click="unlockNextAchievement">
                Разблокировать достижение
              </button>
            </div>
          </div>

          <!-- Секция статистики -->
          <div v-if="activeTab === 'stats'" class="stats-section">
            <h3>Статистика</h3>
            <div class="stats-content">
              <div class="stat-item">
                <div class="stat-icon"><i class="fas fa-star"></i></div>
                <div class="stat-details">
                  <p class="stat-value">{{ userStats.reviewsCount }}</p>
                  <p class="stat-label">Отзывов</p>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon"><i class="fas fa-film"></i></div>
                <div class="stat-details">
                  <p class="stat-value">{{ userStats.moviesAdded }}</p>
                  <p class="stat-label">Добавлено фильмов</p>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon"><i class="fas fa-eye"></i></div>
                <div class="stat-details">
                  <p class="stat-value">{{ userStats.moviesWatched }}</p>
                  <p class="stat-label">Просмотрено</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Секция списков -->
          <div v-if="activeTab === 'lists'" class="lists-section">
            <h3>Мои списки</h3>
            <div class="empty-state">
              <i class="fas fa-list-ul empty-icon"></i>
              <p>У вас пока нет списков</p>
              <button class="create-list-btn">Создать список</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '../config/axios';
import defaultAvatar from '@/assets/default-avatar.png';
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';
import {
  CheckCircle,
  Star,
  Lock,
  Film,
  Eye,
} from 'lucide-vue-next';

export default {
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    return { userStore, defaultAvatar, router };
  },
  data() {
    return {
      loading: true,
      error: null,
      success: null,
      showEditModal: false,
      showAchievementModal: false,
      newAchievement: null,
      activeTab: 'activity',
      editForm: { username: '', status: '', avatar: null },
      previewAvatar: null,
      recentMovies: [],
      userStats: {
        reviewsCount: 0,
        profileCompleted: false,
        moviesAdded: 0,
        moviesWatched: 0,
      },
      badges: [
        {
          id: 'moviesAdded5',
          label: 'Новичок-киноман',
          description: 'Вы добавили 5 фильмов!',
          icon: Film,
          unlocked: false,
        },
        {
          id: 'reviewsCount10',
          label: 'Активный критик',
          description: 'Вы написали 10 отзывов!',
          icon: Star,
          unlocked: false,
        },
        {
          id: 'profile',
          label: 'Настройка профиля',
          description: 'Обновите аватар и статус',
          icon: CheckCircle,
          unlocked: false,
        },
        {
          id: 'moviesWatched',
          label: 'Киномарафон',
          description: 'Посмотрите 5 фильмов',
          icon: Eye,
          unlocked: false,
        },
      ],
    };
  },
  async created() {
    if (this.$route.path === '/') this.$router.push('/profile');
    await this.loadProfile();
    this.loadRecentMovies();
  },
  beforeUnmount() {
    if (this.previewAvatar) URL.revokeObjectURL(this.previewAvatar);
  },
  watch: {
    'userStore.user': {
      handler(newUser) {
        if (newUser) {
          this.editForm.username = newUser.username || '';
          this.editForm.status = newUser.status || '';
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    async loadProfile() {
      try {
        this.loading = true;
        this.error = null;
        const response = await axios.get('/api/profile');
        const userData = response.data.user;
        this.userStore.setUser({
          id: userData.id,
          username: userData.username,
          status: userData.status || '',
          avatarUrl: userData.avatar ? `http://localhost:3000${userData.avatar}` : defaultAvatar,
          created_at: userData.created_at,
          token: localStorage.getItem('token') || '',
          achievements: userData.achievements,
        });
        this.userStats = {
          reviewsCount: userData.reviewsCount || 0,
          profileCompleted: !!userData.username && !!userData.status && !!userData.avatar,
          moviesAdded: userData.moviesAdded || 0,
          moviesWatched: userData.moviesWatched || 0,
        };

        const achievements = userData.achievements || {};
        this.badges = this.badges.map(badge => {
          if (badge.id === 'moviesAdded5') {
            badge.unlocked = this.userStats.moviesAdded >= 5;
          } else if (badge.id === 'reviewsCount10') {
            badge.unlocked = this.userStats.reviewsCount >= 10;
          } else if (badge.id === 'profile') {
            badge.unlocked = this.userStats.profileCompleted;
          } else if (badge.id === 'moviesWatched') {
            badge.unlocked = this.userStats.moviesWatched >= 5;
          }
          return badge;
        });

        if (response.data.newAchievement) {
          const achievement = response.data.newAchievement;
          const isAlreadyShown = achievements[achievement.id];
          if (!isAlreadyShown) {
            const badge = this.badges.find(b => b.id === achievement.id);
            if (badge) {
              this.newAchievement = {
                ...achievement,
                icon: badge.icon,
              };
              this.showAchievementModal = true;
            }
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        this.error = error.response?.data?.message || 'Ошибка сервера при получении профиля';
        if (error.response?.status === 401 || error.response?.status === 403) {
          this.$router.push('/login');
        }
      } finally {
        this.loading = false;
      }
    },
    async updateProfile() {
      if (!this.editForm.username.trim()) {
        this.error = 'Имя пользователя обязательно';
        return;
      }
      if (this.editForm.username.length < 3) {
        this.error = 'Имя пользователя должно содержать минимум 3 символа';
        return;
      }
      try {
        this.loading = true;
        this.error = null;
        this.success = null;

        const formData = new FormData();
        formData.append('username', this.editForm.username.trim());
        formData.append('status', this.editForm.status.trim());
        if (this.editForm.avatar) formData.append('avatar', this.editForm.avatar);

        const response = await axios.put('/api/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const updatedUser = response.data.user;
        this.userStore.setUser({
          id: updatedUser.id,
          username: updatedUser.username,
          status: updatedUser.status || '',
          avatarUrl: updatedUser.avatar ? `http://localhost:3000${updatedUser.avatar}` : defaultAvatar,
          created_at: updatedUser.created_at,
          token: localStorage.getItem('token') || '',
        });
        this.userStats.profileCompleted = !!updatedUser.username && !!updatedUser.status && !!updatedUser.avatar;
        this.showEditModal = false;
        this.previewAvatar = null;
        this.success = 'Профиль успешно обновлен!';
        setTimeout(() => (this.success = null), 3000);

        await this.loadProfile();
      } catch (error) {
        console.error('Ошибка обновления профиля:', error);
        if (error.response?.status === 400) {
          this.error = error.response.data.message;
        } else if (error.response?.status === 401) {
          this.error = 'Требуется авторизация';
          this.$router.push('/login');
        } else {
          this.error = 'Ошибка при обновлении профиля';
        }
      } finally {
        this.loading = false;
      }
    },
    handleAvatarChange(event) {
      const file = event.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        this.error = 'Пожалуйста, загрузите изображение.';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'Размер файла не должен превышать 5 МБ.';
        return;
      }
      this.editForm.avatar = file;
      if (this.previewAvatar) URL.revokeObjectURL(this.previewAvatar);
      this.previewAvatar = URL.createObjectURL(file);
    },
    handleImageError(event) {
      console.warn('Не удалось загрузить изображение, используется аватар по умолчанию');
      event.target.src = defaultAvatar;
    },
    formatDate(date) {
      if (!date) return 'Неизвестно';
      return new Date(date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    },
    loadRecentMovies() {
      const movies = JSON.parse(localStorage.getItem('recentMovies') || '[]');
      this.recentMovies = movies;
    },
    goToMovie(movieId) {
      this.router.push(`/movie/${movieId}`);
    },
    unlockNextAchievement() {
      const lockedBadges = this.badges.filter(b => !b.unlocked);
      if (lockedBadges.length > 0) {
        const badge = lockedBadges[0];
        badge.unlocked = true;
        this.newAchievement = {
          id: badge.id,
          title: badge.label,
          description: badge.description,
          icon: badge.icon,
        };
        this.showAchievementModal = true;
      } else {
        alert('Все достижения уже разблокированы!');
      }
    },
  },
};
</script>

<style scoped>
/* Основные переменные */
:root {
  --primary-color: #d81b60;
  --primary-hover: #ff2a6d;
  --accent-color: #6b48ff;
  --accent-secondary: #ff6b97;
  --accent-tertiary: #00d4ff;
  --background-dark: #0d001a;
  --background-lighter: #1f1a40;
  --card-bg: #2a1f4d;
  --card-bg-hover: #3d2a6e;
  --text-color: #ffffff;
  --text-muted: #d1c4ff;
  --error-color: #ef4444;
  --success-color: #10b981;
  --badge-gold: #ffd700;
  --badge-locked: #9b9b9b;
  --border-radius: 14px;
  --shadow-sm: 0 4px 10px rgba(107, 72, 255, 0.5);
  --shadow-md: 0 6px 12px rgba(107, 72, 255, 0.6);
  --shadow-lg: 0 10px 20px rgba(107, 72, 255, 0.7);
  --glow-purple: 0 0 20px rgba(107, 72, 255, 0.8);
  --glow-pink: 0 0 15px rgba(255, 107, 151, 0.6);
  --glow-cyan: 0 0 20px rgba(0, 212, 255, 0.5);
}

/* Основной контейнер */
.profile-container {
  background: radial-gradient(ellipse at top left, #1f1a40 0%, #0d001a 50%, #1a0d2e 100%);
  background-attachment: fixed;
  background-size: cover;
  position: relative;
  overflow: hidden;
}

.profile-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 80%, rgba(107, 72, 255, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 107, 151, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(0, 212, 255, 0.08) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

/* Главная секция профиля */
.main-profile-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  position: relative;
  z-index: 1;
}

/* Карточка профиля */
.profile-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, var(--card-bg) 0%, #261a60 50%, #2a1f4d 100%);
  border-radius: var(--border-radius);
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-md), 0 0 40px rgba(107, 72, 255, 0.2);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(168, 85, 247, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.profile-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg), 0 0 60px rgba(107, 72, 255, 0.3);
}

.profile-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, var(--accent-secondary), var(--accent-color), var(--accent-tertiary));
  animation: shimmer 3s ease-in-out infinite;
}

.profile-card::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(107, 72, 255, 0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
  pointer-events: none;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  margin-right: 2.5rem;
  position: relative;
  z-index: 2;
}

.avatar-container {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid transparent;
  background: linear-gradient(45deg, var(--accent-color), var(--accent-secondary), var(--accent-tertiary)) padding-box,
    linear-gradient(45deg, var(--accent-color), var(--accent-secondary), var(--accent-tertiary)) border-box;
  box-shadow: var(--glow-purple), var(--glow-pink);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
}

.avatar-container::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(45deg, var(--accent-color), var(--accent-secondary), var(--accent-tertiary));
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  animation: borderRotate 4s linear infinite;
}

.avatar-container:hover {
  transform: scale(1.08) rotate(5deg);
  box-shadow: 0 0 40px rgba(168, 85, 247, 0.8), 0 0 60px rgba(255, 107, 151, 0.4);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.avatar-container:hover .avatar {
  filter: brightness(1.1) saturate(1.2);
}

.edit-profile-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color), var(--accent-secondary));
  background-size: 200% 200%;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.8rem 1.6rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
  position: relative;
  overflow: hidden;
  animation: gradientShift 3s ease-in-out infinite;
}

.edit-profile-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.edit-profile-btn:hover::before {
  left: 100%;
}

.edit-profile-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: var(--shadow-md), var(--glow-pink);
  background-position: 100% 0;
}

.profile-info {
  flex: 1;
  position: relative;
  z-index: 2;
}

.profile-info h2 {
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 0.7rem;
  color: #ffffff;
  text-shadow:
    0 0 10px rgba(255, 255, 255, 0.8),
    0 2px 5px rgba(107, 72, 255, 0.6);
  filter: brightness(1.4);
}

.profile-info h2::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, #ffffff, var(--accent-color));
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
  animation: expandLine 2s ease-in-out infinite;
}

.status-text {
  font-size: 1.2rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
  opacity: 0.9;
  transition: all 0.3s ease;
}

.profile-card:hover .status-text {
  color: var(--accent-tertiary);
  opacity: 1;
}

.member-since {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.95rem;
  color: var(--text-muted);
  transition: all 0.3s ease;
}

.member-since i {
  color: var(--accent-color);
  transition: all 0.3s ease;
}

.profile-card:hover .member-since {
  color: var(--accent-tertiary);
}

/* Навигационные вкладки */
.navigation-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.8rem;
  background: rgba(30, 26, 56, 0.8);
  padding: 0.8rem;
  border-radius: var(--border-radius);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(168, 85, 247, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.tab {
  padding: 1rem 1.8rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.05rem;
  font-weight: 500;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-secondary));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.tab:hover {
  color: white;
  transform: translateY(-2px) scale(1.02);
}

.tab:hover::before {
  opacity: 0.2;
}

.tab.active {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  color: white;
  box-shadow: var(--shadow-sm), var(--glow-purple);
  transform: translateY(-1px);
}

.tab.active::before {
  opacity: 1;
}

/* Контент вкладок */
.tab-content {
  background: linear-gradient(135deg, var(--card-bg) 0%, #261e56 50%, #2a1f4d 100%);
  border-radius: var(--border-radius);
  padding: 2.2rem;
  box-shadow: var(--shadow-md), 0 0 30px rgba(107, 72, 255, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.tab-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
  animation: scanLine 3s ease-in-out infinite;
}

.tab-content h3 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1.8rem;
  color: #ffffff;
  text-shadow:
    0 0 10px rgba(255, 255, 255, 0.8),
    0 2px 5px rgba(107, 72, 255, 0.6);
  filter: brightness(1.4);
}

.tab-content h3::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #ffffff, var(--accent-color));
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
  animation: expandLine 2s ease-in-out infinite;
}

/* Секция активности */
.activity-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.8rem;
}

.activity-item {
  background: linear-gradient(135deg, var(--card-bg-hover), #3d2a6e);
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(168, 85, 247, 0.15);
  position: relative;
}

.activity-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(107, 72, 255, 0.1), rgba(255, 107, 151, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.activity-item:hover::before {
  opacity: 1;
}

.activity-item:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-lg), var(--glow-purple);
  border-color: rgba(168, 85, 247, 0.4);
}

.movie-cover-container {
  height: 200px;
  overflow: hidden;
  position: relative;
}

.movie-cover-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent 30%, rgba(107, 72, 255, 0.1) 50%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.activity-item:hover .movie-cover-container::after {
  opacity: 1;
}

.movie-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  filter: brightness(0.9) saturate(0.8);
}

.activity-item:hover .movie-cover {
  transform: scale(1.1);
  filter: brightness(1.1) saturate(1.2);
}

.movie-info {
  padding: 1.2rem;
  background: rgba(30, 26, 56, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.activity-item:hover .movie-info {
  background: rgba(30, 26, 56, 0.95);
}

.movie-title {
  font-weight: 600;
  font-size: 1.1rem;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.activity-item:hover .movie-title {
  color: var(--accent-tertiary);
}

/* Секция достижений */
.badges-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.8rem;
}

.badge-item {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, var(--card-bg-hover), #3d2a6e);
  border-radius: var(--border-radius);
  padding: 1.4rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(168, 85, 247, 0.15);
  position: relative;
  overflow: hidden;
}

.badge-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.6s;
}

.badge-item:hover::before {
  left: 100%;
}

.badge-item:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: var(--shadow-md), var(--glow-purple);
  border-color: rgba(168, 85, 247, 0.4);
}

.badge-item.badge-unlocked {
  background: linear-gradient(135deg, rgba(140, 43, 250, 0.3), rgba(191, 101, 255, 0.25));
  border-color: rgba(168, 85, 247, 0.5);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

.badge-item.badge-unlocked:hover {
  box-shadow: var(--shadow-md), 0 0 30px rgba(255, 215, 0, 0.4);
}

.badge-icon-container {
  position: relative;
  width: 64px;
  height: 64px;
  margin-right: 1.4rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.badge-item:hover .badge-icon-container {
  transform: scale(1.1);
  background: rgba(107, 72, 255, 0.2);
}

.badge-icon {
  width: 40px;
  height: 40px;
  color: var(--badge-locked);
  transition: all 0.4s ease;
}

.badge-icon.unlocked {
  color: var(--badge-gold);
  filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8));
  transform: scale(1.1);
  animation: goldGlow 2s ease-in-out infinite;
}

.badge-lock {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(168, 85, 247, 0.3);
  transition: all 0.3s ease;
}

.badge-item:hover .badge-lock {
  background: rgba(107, 72, 255, 0.3);
  border-color: rgba(168, 85, 247, 0.5);
}

.lock-icon {
  width: 14px;
  height: 14px;
  color: #bbb;
}

.badge-details {
  flex: 1;
}

.badge-name {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: #ffffff;
  transition: all 0.3s ease;
}

.badge-item:hover .badge-name {
  color: var(--accent-tertiary);
}

.badge-description {
  font-size: 0.95rem;
  color: var(--text-muted);
  line-height: 1.4;
  transition: all 0.3s ease;
}

.badge-item:hover .badge-description {
  color: rgba(209, 196, 255, 0.9);
}

.achievement-actions {
  margin-top: 2rem;
  text-align: center;
}

.unlock-achievement-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color), var(--accent-secondary));
  background-size: 200% 200%;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s ease;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
  animation: gradientShift 3s ease-in-out infinite;
}

.unlock-achievement-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.unlock-achievement-btn:hover::before {
  left: 100%;
}

.unlock-achievement-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: var(--shadow-md), var(--glow-purple);
  background-position: 100% 0;
}

/* Статистика */
.stats-content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.8rem;
}

.stat-item {
  background: linear-gradient(135deg, var(--card-bg-hover) 0%, rgba(42, 31, 82, 0.8) 100%);
  border-radius: var(--border-radius);
  padding: 1.7rem;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(168, 85, 247, 0.15);
  position: relative;
  overflow: hidden;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, var(--accent-color), var(--accent-secondary), var(--accent-tertiary));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.stat-item:hover::before {
  transform: scaleX(1);
}

.stat-item:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: var(--shadow-md), var(--glow-purple);
  border-color: rgba(168, 85, 247, 0.4);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(255, 107, 151, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: var(--accent-color);
  box-shadow: 0 4px 15px rgba(126, 34, 206, 0.3);
  transition: all 0.3s ease;
}

.stat-item:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(255, 107, 151, 0.3));
  box-shadow: 0 6px 20px rgba(126, 34, 206, 0.5);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.stat-item:hover .stat-value {
  color: var(--accent-tertiary);
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.stat-label {
  font-size: 0.95rem;
  color: var(--text-muted);
  transition: all 0.3s ease;
}

.stat-item:hover .stat-label {
  color: rgba(255, 255, 255, 0.9);
}

/* Пустые состояния */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3.5rem 1.5rem;
  color: var(--text-muted);
  background: rgba(30, 26, 56, 0.6);
  border-radius: var(--border-radius);
  border: 2px dashed rgba(168, 85, 247, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.empty-state:hover {
  border-color: rgba(168, 85, 247, 0.5);
  background: rgba(30, 26, 56, 0.8);
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 1.3rem;
  opacity: 0.6;
  color: var(--accent-color);
  transition: all 0.3s ease;
  animation: float 3s ease-in-out infinite;
}

.empty-state:hover .empty-icon {
  opacity: 0.8;
  transform: scale(1.1);
}

.create-list-btn {
  margin-top: 1.8rem;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s ease;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}

.create-list-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.create-list-btn:hover::before {
  left: 100%;
}

.create-list-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: var(--shadow-md), var(--glow-purple);
}

/* Модальные окна - улучшенные */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(15px);
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: linear-gradient(135deg, var(--card-bg) 0%, #261a60 50%, #2a1f4d 100%);
  border-radius: var(--border-radius);
  padding: 2.5rem;
  width: 100%;
  max-width: 500px;
  box-shadow: var(--shadow-lg), 0 0 50px rgba(107, 72, 255, 0.3);
  animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(168, 85, 247, 0.3);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, var(--accent-color), var(--accent-secondary), var(--accent-tertiary));
  animation: shimmer 2s ease-in-out infinite;
}

.modal-content h3 {
  font-size: 1.9rem;
  font-weight: 600;
  margin-bottom: 1.8rem;
  background: linear-gradient(45deg, var(--accent-color), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.form-group {
  margin-bottom: 1.8rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.6rem;
  font-size: 1rem;
  color: var(--text-muted);
  font-weight: 500;
  transition: all 0.3s ease;
}

.form-group:focus-within label {
  color: var(--accent-color);
}

.form-group input {
  width: 100%;
  padding: 1rem 1.4rem;
  border-radius: 12px;
  border: 2px solid rgba(168, 85, 247, 0.2);
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.2);
  background: rgba(0, 0, 0, 0.4);
  transform: translateY(-1px);
}

.form-group input:hover {
  border-color: rgba(168, 85, 247, 0.4);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  margin-top: 2.5rem;
}

.modal-actions button {
  padding: 1rem 2rem;
  border-radius: 12px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.modal-actions button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.modal-actions button:hover::before {
  left: 100%;
}

.modal-actions button:first-child {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.modal-actions button:first-child:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px) scale(1.02);
  border-color: rgba(255, 255, 255, 0.3);
}

.modal-actions button:last-child {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  color: white;
  box-shadow: var(--shadow-sm);
}

.modal-actions button:last-child:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: var(--shadow-md), var(--glow-purple);
}

.avatar-preview {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  margin-top: 1.2rem;
  border: 4px solid var(--accent-color);
  box-shadow: var(--glow-purple);
  transition: all 0.3s ease;
}

.avatar-preview:hover {
  transform: scale(1.05);
  box-shadow: 0 0 25px rgba(168, 85, 247, 0.8);
}

/* Достижения модальное окно - улучшенное */
.achievement-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(20px);
  animation: fadeIn 0.3s ease;
}

.achievement-modal-content {
  background: linear-gradient(135deg, var(--card-bg) 0%, #2a1a70 50%, #1f1a40 100%);
  border-radius: var(--border-radius);
  padding: 3rem;
  width: 100%;
  max-width: 420px;
  text-align: center;
  box-shadow: var(--shadow-lg), 0 0 60px rgba(107, 72, 255, 0.4);
  animation: achievementPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 2px solid rgba(168, 85, 247, 0.4);
  backdrop-filter: blur(15px);
  position: relative;
  overflow: hidden;
}

.achievement-modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(107, 72, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
  animation: sparkle 3s ease-in-out infinite;
}

.achievement-modal-content h3 {
  font-size: 2.2rem;
  margin-bottom: 1.8rem;
  background: linear-gradient(45deg, #ffffff, var(--accent-color), var(--badge-gold));
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  animation: textGradient 3s ease-in-out infinite;
}

.achievement-icon-wrapper {
  width: 140px;
  height: 140px;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.4), rgba(168, 85, 247, 0.1) 70%);
  border-radius: 50%;
  border: 4px solid var(--badge-gold);
  box-shadow:
    0 0 40px rgba(255, 215, 0, 0.6),
    0 0 80px rgba(107, 72, 255, 0.3),
    inset 0 0 20px rgba(255, 215, 0, 0.2);
  position: relative;
  animation: iconFloat 3s ease-in-out infinite;
}

.achievement-icon-wrapper::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: linear-gradient(45deg, var(--badge-gold), var(--accent-color), var(--badge-gold));
  animation: borderRotate 4s linear infinite;
  z-index: -1;
}

.achievement-icon {
  width: 80px;
  height: 80px;
  color: var(--badge-gold);
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
  animation: iconPulse 2s ease-in-out infinite;
  z-index: 1;
}

.achievement-modal-content p {
  font-size: 1.3rem;
  margin-bottom: 2.5rem;
  line-height: 1.5;
  color: var(--text-muted);
  transition: all 0.3s ease;
}

.achievement-modal-content button {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color), var(--badge-gold));
  background-size: 200% 200%;
  color: white;
  border: none;
  border-radius: 15px;
  padding: 1.2rem 3rem;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s ease;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
  animation: gradientShift 3s ease-in-out infinite;
}

.achievement-modal-content button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.achievement-modal-content button:hover::before {
  left: 100%;
}

.achievement-modal-content button:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: var(--shadow-lg), 0 0 30px rgba(255, 215, 0, 0.4);
  background-position: 100% 0;
}

/* Загрузка и ошибки - улучшенные */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  font-size: 1.6rem;
  color: var(--accent-color);
  position: relative;
}

.loading::after {
  content: '';
  width: 40px;
  height: 40px;
  border: 3px solid rgba(107, 72, 255, 0.3);
  border-top: 3px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 1rem;
}

.error-message {
  color: var(--error-color);
  text-align: center;
  margin: 1.2rem 0;
  padding: 1.2rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  backdrop-filter: blur(10px);
  animation: shake 0.5s ease-in-out;
}

.success-message {
  color: var(--success-color);
  text-align: center;
  margin: 1.2rem 0;
  padding: 1.2rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(16, 185, 129, 0.3);
  backdrop-filter: blur(10px);
  animation: successPulse 0.5s ease-in-out;
}

/* Анимации */
@keyframes shimmer {

  0%,
  100% {
    transform: translateX(-100%);
  }

  50% {
    transform: translateX(100%);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes borderRotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes gradientShift {

  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

@keyframes textGradient {

  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

@keyframes scanLine {

  0%,
  100% {
    transform: translateX(-100%);
    opacity: 0;
  }

  50% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes expandLine {

  0%,
  100% {
    width: 50px;
  }

  50% {
    width: 80px;
  }
}

@keyframes goldGlow {

  0%,
  100% {
    filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8));
    transform: scale(1.1);
  }

  50% {
    filter: drop-shadow(0 0 25px rgba(255, 215, 0, 1));
    transform: scale(1.15);
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes achievementPop {
  0% {
    opacity: 0;
    transform: scale(0.8) rotate(-10deg);
  }

  60% {
    opacity: 1;
    transform: scale(1.1) rotate(5deg);
  }

  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes sparkle {

  0%,
  100% {
    opacity: 0.3;
  }

  50% {
    opacity: 0.8;
  }
}

@keyframes iconFloat {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }

  50% {
    transform: translateY(-5px) rotate(5deg);
  }
}

@keyframes iconPulse {

  0%,
  100% {
    filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
    transform: scale(1);
  }

  50% {
    filter: drop-shadow(0 0 30px rgba(255, 215, 0, 1));
    transform: scale(1.05);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-5px);
  }

  75% {
    transform: translateX(5px);
  }
}

@keyframes successPulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.02);
  }

  100% {
    transform: scale(1);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .profile-card {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1.5rem;
  }

  .avatar-section {
    margin-right: 0;
    margin-bottom: 1.8rem;
  }

  .navigation-tabs {
    overflow-x: auto;
    padding: 0.6rem;
    gap: 0.5rem;
    justify-content: flex-start;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .navigation-tabs::-webkit-scrollbar {
    display: none;
  }

  .tab {
    padding: 0.8rem 1.4rem;
    white-space: nowrap;
    font-size: 1rem;
    min-width: fit-content;
  }

  .tab-content {
    padding: 1.8rem;
  }

  .stats-content,
  .badges-list {
    grid-template-columns: 1fr;
  }

  .activity-list {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  .profile-info h2 {
    font-size: 2.2rem;
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: 1.2rem 0.5rem;
  }

  .main-profile-section {
    padding: 0.5rem;
  }

  .profile-card {
    padding: 1.5rem 1rem;
  }

  .profile-info h2 {
    font-size: 1.8rem;
  }

  .avatar-container {
    width: 120px;
    height: 120px;
  }

  .tab-content {
    padding: 1.2rem;
  }

  .movie-cover-container {
    height: 160px;
  }

  .modal-content,
  .achievement-modal-content {
    padding: 1.8rem 1.2rem;
    margin: 1rem;
  }

  .badge-item {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .badge-icon-container {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }

  .activity-list {
    grid-template-columns: 1fr;
  }
}
</style>