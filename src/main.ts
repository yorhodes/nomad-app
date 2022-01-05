import { createApp } from 'vue'
import AppWrapper from './AppWrapper.vue'
import './registerServiceWorker'
import router from './router'
import { store, key } from './store'

import './index.css'

createApp(AppWrapper).use(store, key).use(router).mount('#app')