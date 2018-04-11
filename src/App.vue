<template>
  <main id="app">
    <router-view></router-view>
  </main>
</template>

<script>
import './styles/base.css'
import './styles/chat.css'

export default {
  name: 'app',
  computed: {
    // The user is automatically set by the feathers-vuex auth module upon login.
    user () {
      return this.$store.state.auth.user
    }
  },
  watch: {
    // When the user is set, redirect to the Chat page.
    // ZM: Add router condition here for wechat
    user (newVal) {
      console.log('User newVal:', newVal)
      if (!newVal) {
        // After logout
        this.$router.replace({name: 'Login'})
      } else {
        if (newVal) { // TODO: By user.active
          this.$router.replace({name: 'Chat'})
        } else {
          this.$router.replace({name: 'Wait'}) // for block user
        }
      }
    }
  },
  mounted () {
    // console.info('currentRoute:', this.$router.currentRoute)
    const inWechat = /micromessenger/.test(navigator.userAgent.toLowerCase())
    const isRouteLaunch = (this.$router.currentRoute === 'Launch')
    if (!isRouteLaunch) {
      this.$store.dispatch('auth/authenticate').catch(error => {
        if (!error.message.includes('Could not find stored JWT')) {
          console.error(error)
        }
      }).then(res => {
        console.log('App auth res:', res)
        // In wechat, should we need automatically jump to start launch?
        // It may cause a problem when wx server callback: jump again to Launch,
        // isRouteLaunch above is used to solve that problem.
        if (!res && inWechat) {
          // this.$router.replace({name: 'Launch', query: {code: 'start'}})
        }
      })
    }
  }
}
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
