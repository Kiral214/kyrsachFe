<template>
    <button class="custom-button">
        <slot></slot>
    </button>
</template>

<style scoped>
.custom-button {
    cursor: pointer;
    transition: all 0.3s ease;
    /* Сохраняем плавные переходы для всех свойств */
    background: #3b82f6;
    /* bg-blue-500 */
    color: white;
    padding: 8px 24px;
    /* px-6 py-2 */
    border-radius: 0.5rem;
    /* rounded-lg */
    border: 0 solid #2563eb;
    /* border-blue-600 */
    border-bottom-width: 4px;
    /* border-b-[4px] */
    font-family: 'Montserrat', sans-serif;
    /* Сохраняем ваш шрифт */
    font-size: 16px;
    /* Сохраняем ваш размер шрифта */
}

.custom-button:hover {
    filter: brightness(1.1);
    /* hover:brightness-110 */
    transform: translateY(-1px);
    /* hover:-translate-y-[1px] */
    border-bottom-width: 6px;
    /* hover:border-b-[6px] */
}

.custom-button:active {
    border-bottom-width: 2px;
    /* active:border-b-[2px] */
    filter: brightness(0.9);
    /* active:brightness-90 */
    transform: translateY(2px);
    /* active:translate-y-[2px] */
}
</style>