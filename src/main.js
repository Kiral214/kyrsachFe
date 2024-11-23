import { createApp } from 'vue'

import './style.css'
import './global.css'
import App from './App.vue'
import router from './config/router'
import axios from 'axios'
import wButton from './components/wButton.vue'
import wInput from './components/wInput.vue'
import wTextarea from './components/wTextarea.vue'
import WRatings from './components/wRatings.vue'
import 'vue3-toastify/dist/index.css';
import { createPinia } from 'pinia'
const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(axios)

app.component("wRatings",WRatings)
app.component("wTextarea",wTextarea)
app.component("wButton", wButton)
app.component ("wInput",wInput)
app.mount('#app')
