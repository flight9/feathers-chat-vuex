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
    const inWechat = /micromessenger/.test(navigator.userAgent.toLowerCase())
    const isRouteLaunch = (this.$router.currentRoute.name === 'Launch')
    console.info('isRouteLaunch:', isRouteLaunch)
    if (!isRouteLaunch) {
      this.$store.dispatch('auth/authenticate').catch(error => {
        if (!error.message.includes('Could not find stored JWT')) {
          console.error(error)
        }
      }).then(res => {
        console.log('App auth res:', res)
        // In wechat, should we need automatically jump to start launch?
        // If we use codes below to jump, then remove the authenticate() invoking
        // in Launch.vue, and make wechat menu entry pointed to '/' not 'Launch' route.
        // Optinon 1 to use code below; Option 2 make wechat menu entry pointed to
        // '/launch?code=start' and invoke app.authenticate() there too(without code below).
        // Codes below may cause a problem when wx server callback(like refresh):
        // it jumps again to Launch,
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
