// tailwind.config.js
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary': '#1a237e',
                'secondary': '#e91e63',
                'accent': '#00bcd4',
                'background': '#f8fafc',
                'text-color': '#333',
                // Добавляем цвета для градиента заголовка
                'gradient-start': '#6B46C1', // Синий для градиента
                'gradient-end': '#D53F8C',   // Розовый для градиента
                // Добавляем цвет фона карточек
                'card-bg': '#1A1A1A',
                // Добавляем цвет для серого текста
                'text-gray': '#D1D5DB',
            },
            borderRadius: {
                'default': '12px',
            },
            boxShadow: {
                'card': '0 4px 10px rgba(0, 0, 0, 0.2)', // Усиливаем тень
                'card-hover': '0 8px 20px rgba(0, 0, 0, 0.3)',
            },
            fontFamily: {
                montserrat: ['Montserrat', 'sans-serif'],
                lora: ['Lora', 'serif'],
            },
        },
    },
    plugins: [],
};