import { defineStore } from 'pinia'
import { ref } from 'vue';
export const useUserStore = defineStore('user', () => {
    state: () => {
        return {

            role: 'guest',
            userId: 0,

        }
    }
})