import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// createApp(App).mount('#app')

// 1. import Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 2. import router configuration
import router from './router'

const app = createApp(App)

// register all Element Plus icons globally
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 3. use Element Plus
app.use(ElementPlus)

// 4. use router
app.use(router)

app.mount('#app')