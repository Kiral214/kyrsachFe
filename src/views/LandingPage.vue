<template>
    <div class="landing-page">
        <!-- Navbar with darker black gradient background -->
        <div class="navbar">
            <div class="logo">Media<span>Storage</span></div>
            <div class="nav-links">
                <!-- Navigation links intentionally left empty as per original code -->
            </div>
        </div>

        <!-- Hero Section with enhanced black visuals -->
        <div class="hero-section">
            <div class="hero-content">
                <h1 class="hero-title">Добро пожаловать в MediaStorage</h1>
                <p class="hero-description">
                    Здесь ты сможешь добовлять, сортировать и просматривать контент приятного просмотра
                </p>
                <button class="cta-button" @click="goToMainPage">
                    <span class="play-icon">▶</span> Начать просмотр
                </button>
                <div class="features-preview">
                    <div class="feature-badge">
                        <span class="feature-icon">🎬</span>
                        <span>Обширная библиотека</span>
                    </div>
                    <div class="feature-badge">
                        <span class="feature-icon">🔍</span>
                        <span>Лёгкий поиск</span>
                    </div>
                    <div class="feature-badge">
                        <span class="feature-icon">⭐</span>
                        <span>Высокие рейтинги</span>
                    </div>
                </div>
            </div>
            <div class="hero-3d-model">
                <!-- Spline 3D Model Viewer -->
                <div class="spline-container">
                    <spline-viewer url="https://prod.spline.design/0ZpVc6-eM79DOzvv/scene.splinecode"></spline-viewer>
                </div>
            </div>
        </div>

        <!-- Categories Section with black theme cards -->
        <div class="categories-section">
            <h2 class="section-title">Популярные Категории</h2>
            <div class="category-cards">
                <div class="category-card">
                    <div class="category-icon-container">
                        <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4NDdkZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTYgMTZWNGExIDEgMCAwIDAtMS0xaC0yYTEgMSAwIDAgMC0xIDF2MTIiPjwvcGF0aD48cGF0aCBkPSJNMjEgMTZWOWExIDEgMCAwIDAtMS0xaC0yYTEgMSAwIDAgMC0xIDF2NyI+PC9wYXRoPjxwYXRoIGQ9Ik0xMSAxNlYyYTEgMSAwIDAgMC0xLTFIOGExIDEgMCAwIDAtMSAxdjE0Ij48L3BhdGg+PHBhdGggZD0iTTYgMTZWMTNhMSAxIDAgMCAwLTEtMUgzYTEgMSAwIDAgMC0xIDF2MyI+PC9wYXRoPjxyZWN0IHg9IjIiIHk9IjE2IiB3aWR0aD0iMjAiIGhlaWdodD0iNiIgcng9IjIiPjwvcmVjdD48L3N2Zz4="
                            alt="Movies Icon" class="vector-icon">
                    </div>
                    <h3>Фильмы</h3>
                    <p>От классики до последних блокбастеров</p>
                    <a href="#" class="category-link">Начать просмотр</a>
                </div>
                <div class="category-card">
                    <div class="category-icon-container">
                        <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4NDdkZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIyIiB5PSI3IiB3aWR0aD0iMjAiIGhlaWdodD0iMTUiIHJ4PSIyIiByeT0iMiI+PC9yZWN0Pjxwb2x5bGluZSBwb2ludHM9IjE3IDIgMTIgNyA3IDIiPjwvcG9seWxpbmU+PC9zdmc+"
                            alt="TV Shows Icon" class="vector-icon">
                    </div>
                    <h3>Видео</h3>
                    <p>Рзличные видео со всего мира</p>
                    <a href="#" class="category-link">Начать просмотр</a>
                </div>
                <div class="category-card">
                    <div class="category-icon-container">
                        <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4NDdkZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNNCAxOFYzYTEgMSAwIDAgMSAxLTFoMTRhMSAxIDAgMCAxIDEgMXYxOGExIDEgMCAwIDEtMS43MS43MUwxNS43IDIwLjI5YS45OTYuOTk2IDAgMCAwLTEuNDEgMEwxMi43IDIxLjdjLS4zOS4zOC0xLjAzLjM3LTEuNDIgMGwtMS4zLTEuM2MtLjM5LS4zOS0xLjAzLS4zOS0xLjQyIDBsLTIuODYgMi44NkExIDEgMCAwIDEgNCAxOHoiPjwvcGF0aD48cGF0aCBkPSJNOSA3aDYiPjwvcGF0aD48cGF0aCBkPSJNOSAxMWg2Ij48L3BhdGg+PC9zdmc+"
                            alt="Documentaries Icon" class="vector-icon">
                    </div>
                    <h3>Прочий контен</h3>
                    <p>Различные видео и фильмы</p>
                    <a href="#" class="category-link">Начать просмотр</a>
                </div>
            </div>
        </div>

        <!-- Enhanced Animated Background Elements -->
        <div class="background-elements">
            <div class="particle particle-1"></div>
            <div class="particle particle-2"></div>
            <div class="particle particle-3"></div>
            <div class="particle particle-4"></div>
            <div class="particle particle-5"></div>
            <div class="side-glow left"></div>
            <div class="side-glow right"></div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LandingPage',
    methods: {
        goToMainPage() {
            this.$router.push('/main');
        }
    },
    mounted() {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://unpkg.com/@splinetool/viewer@1.9.92/build/spline-viewer.js';
        document.head.appendChild(script);
    }
};
</script>

<style>
/* Global Reset & Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', 'Segoe UI', Roboto, Arial, sans-serif;
    color: #fff;
    min-height: 100vh;
    line-height: 1.6;
    overflow-x: hidden;
}

/* Enhanced Black Background with animated gradient */
.landing-page {
    width: 100%;
    min-height: 100vh;
    overflow-x: hidden;
    position: relative;
    background: #000000;
    /* Pure black background */
    background-image:
        radial-gradient(circle at 80% 10%, rgba(93, 63, 211, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 10% 30%, rgba(147, 51, 234, 0.04) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(56, 78, 183, 0.03) 0%, transparent 50%);
}

/* Navbar Styles with Enhanced Black Glass Effect */
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 4rem;
    position: relative;
    z-index: 10;
    backdrop-filter: blur(15px);
    background: rgba(0, 0, 0, 0.8);
    /* Darker black background */
    border-bottom: 1px solid rgba(93, 63, 211, 0.1);
}

.logo {
    font-size: 32px;
    font-weight: 800;
    background: linear-gradient(90deg, #847dff, #b368d9);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 0.5px;
    text-shadow: 0 0 20px rgba(93, 63, 211, 0.5);
}

.logo span {
    background: linear-gradient(90deg, #b368d9, #ff5e87);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.nav-links {
    display: flex;
    gap: 2rem;
}

/* Enhanced Animated Particles Background */
.background-elements {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
}

.particle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.07;
    /* Lower opacity for darker theme */
    filter: blur(40px);
    /* Increased blur */
    animation: float 20s infinite alternate ease-in-out;
}

.particle-1 {
    width: 300px;
    height: 300px;
    background: #5d3fd3;
    /* Updated color */
    top: 10%;
    left: 5%;
    animation-duration: 25s;
}

.particle-2 {
    width: 400px;
    height: 400px;
    background: #9333ea;
    /* Updated color */
    top: 40%;
    right: -100px;
    animation-duration: 30s;
    animation-delay: 2s;
}

.particle-3 {
    width: 250px;
    height: 250px;
    background: #384eb7;
    /* Updated color */
    bottom: 10%;
    left: 10%;
    animation-duration: 22s;
    animation-delay: 1s;
}

.particle-4 {
    width: 200px;
    height: 200px;
    background: #7e22ce;
    /* Updated color */
    top: 60%;
    left: 20%;
    animation-duration: 18s;
    opacity: 0.05;
}

.particle-5 {
    width: 350px;
    height: 350px;
    background: linear-gradient(45deg, #847dff, #9333ea);
    /* Updated colors */
    top: 20%;
    right: 15%;
    animation-duration: 28s;
    animation-delay: 3s;
    opacity: 0.04;
}

/* New side glow elements for harmonious side stripes on black */
.side-glow {
    position: absolute;
    width: 30vw;
    /* Width of the side glow */
    height: 100%;
    top: 0;
    filter: blur(70px);
    opacity: 0.12;
    z-index: 0;
}

.side-glow.left {
    left: -15vw;
    background: linear-gradient(90deg, transparent, #5d3fd3, transparent);
    animation: pulse 10s infinite alternate ease-in-out;
}

.side-glow.right {
    right: -15vw;
    background: linear-gradient(90deg, transparent, #9333ea, transparent);
    animation: pulse 12s infinite alternate-reverse ease-in-out;
}

@keyframes pulse {
    0% {
        opacity: 0.06;
    }

    50% {
        opacity: 0.12;
    }

    100% {
        opacity: 0.06;
    }
}

@keyframes float {
    0% {
        transform: translate(0, 0) scale(1);
    }

    50% {
        transform: translate(30px, 30px) scale(1.05);
    }

    100% {
        transform: translate(-30px, 20px) scale(1);
    }
}

/* Hero Section Styles with Enhanced Black Visuals */
.hero-section {
    display: flex;
    min-height: calc(100vh - 80px);
    padding: 0 4rem;
    position: relative;
    gap: 2rem;
    z-index: 1;
}

.hero-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-right: 2rem;
}

.hero-title {
    font-size: 4rem;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 1.5rem;
    background: linear-gradient(90deg, #ffffff, #c4b5fd);
    /* Updated gradient */
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 30px rgba(132, 125, 255, 0.3);
    letter-spacing: -1px;
}

.hero-description {
    font-size: 1.25rem;
    color: #a5b4fc;
    /* Slightly brighter text for dark theme */
    margin-bottom: 2.5rem;
    max-width: 600px;
    line-height: 1.7;
}

.cta-button {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(90deg, #847dff, #b368d9);
    /* Updated colors */
    color: white;
    border: none;
    padding: 16px 36px;
    border-radius: 50px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 8px 25px rgba(93, 63, 211, 0.5), 0 0 0 rgba(0, 0, 0, 0);
    position: relative;
    overflow: hidden;
}

.cta-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.3));
    transform: translateX(-100%);
    transition: transform 0.6s ease;
}

.cta-button:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow: 0 12px 30px rgba(93, 63, 211, 0.6), 0 0 20px rgba(147, 51, 234, 0.3);
}

.cta-button:hover::before {
    transform: translateX(100%);
}

.play-icon {
    font-size: 18px;
}

.features-preview {
    display: flex;
    gap: 20px;
    margin-top: 3rem;
}

.feature-badge {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(0, 0, 0, 0.5);
    /* Darker black with transparency */
    backdrop-filter: blur(10px);
    padding: 12px 18px;
    border-radius: 50px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    border: 1px solid rgba(93, 63, 211, 0.25);
}

.feature-badge:hover {
    background: rgba(93, 63, 211, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}

.feature-icon {
    font-size: 18px;
}

.hero-3d-model {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.hero-3d-model::before {
    content: '';
    position: absolute;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(147, 51, 234, 0.10) 0%, transparent 70%);
    border-radius: 50%;
    z-index: -1;
}

.spline-container {
    width: 100%;
    height: 100%;
    min-height: 600px;
    filter: drop-shadow(0 0 30px rgba(147, 51, 234, 0.3));
}

spline-viewer {
    width: 100%;
    height: 100%;
}

/* Categories Section with Black Enhanced Cards */
.categories-section {
    padding: 8rem 4rem;
    position: relative;
    z-index: 1;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0) 100%);
}

.section-title {
    text-align: center;
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 5rem;
    background: linear-gradient(90deg, #b368d9, #847dff);
    /* Updated colors */
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.5px;
    position: relative;
    display: inline-block;
    left: 50%;
    transform: translateX(-50%);
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, #b368d9, #847dff);
    /* Updated colors */
    border-radius: 2px;
}

.category-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2.5rem;
}

.category-card {
    background: rgba(0, 0, 0, 0.7);
    /* Pure black cards with transparency */
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 3rem 2rem;
    text-align: center;
    transition: all 0.4s ease;
    border: 1px solid rgba(93, 63, 211, 0.15);
    position: relative;
    overflow: hidden;
}

.category-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(93, 63, 211, 0.03) 0%, rgba(147, 51, 234, 0.03) 100%);
    z-index: -1;
}

.category-card:hover {
    transform: translateY(-15px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(93, 63, 211, 0.3);
}

.category-icon-container {
    width: 80px;
    height: 80px;
    margin: 0 auto 2rem;
    background: rgba(0, 0, 0, 0.8);
    /* Pure black background */
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px rgba(93, 63, 211, 0.2);
    border: 1px solid rgba(93, 63, 211, 0.2);
    transition: all 0.3s ease;
}

.vector-icon {
    width: 40px;
    height: 40px;
    transition: all 0.3s ease;
}

.category-card:hover .category-icon-container {
    transform: scale(1.1);
    box-shadow: 0 0 30px rgba(93, 63, 211, 0.4);
    border-color: rgba(93, 63, 211, 0.4);
}

.category-card h3 {
    font-size: 1.75rem;
    margin-bottom: 1rem;
    font-weight: 600;
    background: linear-gradient(90deg, #847dff, #b368d9);
    /* Updated colors */
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.category-card p {
    color: #a5b4fc;
    /* Brighter text for contrast */
    margin-bottom: 2rem;
    font-size: 1rem;
    line-height: 1.6;
}

.category-link {
    display: inline-block;
    background: transparent;
    color: #847dff;
    /* Updated color */
    border: 2px solid #847dff;
    /* Updated color */
    padding: 10px 24px;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    z-index: 1;
}

.category-link::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #847dff;
    /* Updated color */
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.4s ease;
    z-index: -1;
}

.category-link:hover {
    color: white;
}

.category-link:hover::before {
    transform: scaleX(1);
    transform-origin: left;
}

/* Responsive Design */
@media (max-width: 1024px) {
    .hero-section {
        flex-direction: column-reverse;
        padding: 2rem;
    }

    .hero-content {
        padding-right: 0;
        text-align: center;
        align-items: center;
    }

    .hero-title {
        font-size: 3.5rem;
    }

    .features-preview {
        justify-content: center;
        flex-wrap: wrap;
    }

    .navbar {
        padding: 1rem 2rem;
    }

    .spline-container {
        min-height: 400px;
    }

    .side-glow {
        width: 20vw;
    }
}

@media (max-width: 768px) {
    .nav-links {
        display: none;
    }

    .hero-title {
        font-size: 2.5rem;
    }

    .hero-description {
        font-size: 1rem;
    }

    .categories-section {
        padding: 4rem 2rem;
    }

    .category-cards {
        grid-template-columns: 1fr;
    }

    .section-title {
        font-size: 2.5rem;
    }

    .particle {
        opacity: 0.05;
    }

    .side-glow {
        width: 12vw;
        opacity: 0.08;
    }
}

@media (max-width: 480px) {
    .hero-title {
        font-size: 2rem;
    }

    .cta-button {
        padding: 14px 30px;
        font-size: 16px;
    }

    .feature-badge {
        padding: 10px 15px;
        font-size: 12px;
    }

    .category-icon-container {
        width: 70px;
        height: 70px;
    }

    .vector-icon {
        width: 35px;
        height: 35px;
    }
}
</style>