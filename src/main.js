import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import CustomerView from './views/CustomerView.vue'
import StaffView from './views/StaffView.vue'
import './styles/global.css'

const routes = [
  { path: '/', redirect: '/customer' },
  { path: '/customer', component: CustomerView, meta: { title: '顾客端' } },
  { path: '/staff', component: StaffView, meta: { title: '店员端' } }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

createApp(App).use(router).mount('#app')
