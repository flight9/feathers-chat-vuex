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
        // TODO: Do we need automatic jump here?
        // this.$router.replace({name: 'Launch', query: {code: 'start'}})
      } else {
        if (newVal) { // TODO: By newVal.active
          this.$router.replace({name: 'Chat'})
        } else {
          this.$router.replace({name: 'Wait'})
        }
      }
    }
  },
  mounted () {
    const inWechat = /micromessenger/.test(navigator.userAgent.toLowerCase())
    if (!inWechat) {
      this.$store.dispatch('auth/authenticate').catch(error => {
        if (!error.message.includes('Could not find stored JWT')) {
          console.error(error)
        }
      }).then(res => {
        console.log('App auth res:', res)
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
