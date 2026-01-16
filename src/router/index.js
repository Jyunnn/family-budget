import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SettingView from '../views/SettingView.vue'
import AccountView from '../views/AccountView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/setting',
      name: 'setting',
      component: SettingView
    },
    {
      path: '/account',
      name: 'account',
      component: AccountView
    }
  ]
})

export default router
