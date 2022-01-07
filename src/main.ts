import { createApp } from 'vue'
import AppWrapper from './AppWrapper.vue'
import './registerServiceWorker'
import router from './router'
import initSentry from './services/sentry'
import { store, key } from './store'

import './index.css'

const app = createApp(AppWrapper)

initSentry(app, router)

app
  .use(store, key)
  .use(router)
  .mount('#app')