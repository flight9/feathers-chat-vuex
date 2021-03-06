import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Login from '@/components/Login'
import Signup from '@/components/Signup'
import Chat from '@/components/Chat/Chat'
import Launch from '@/components/Launch'
import Wait from '@/components/Wait'

Vue.use(Router)

export default new Router({
  routes: [
    { path: '', name: 'Home', component: Home },
    { path: '/login', name: 'Login', component: Login, props: true },
    { path: '/signup', name: 'Signup', component: Signup, props: true },
    { path: '/chat', name: 'Chat', component: Chat },
    { path: '/wx', name: 'Launch', component: Launch },
    { path: '/wait', name: 'Wait', component: Wait }
  ]
})
