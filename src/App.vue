<template>
  <main id="app">
    <router-view></router-view>
  </main>
</template>

<script>
import './styles/base.css'
import './styles/chat.css'
import wx from 'weixin-js-sdk'

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
        // TODO: Mike: Do jsconfig ONLY after user logged in && ONLY inside Wechat
        // move this.wxStartJsconfig() here

        if (newVal) { // TODO: By user.active
          this.$router.replace({name: 'Chat'})
        } else {
          this.$router.replace({name: 'Wait'}) // for block user
        }
      }
    }
  },
  mounted () {
    // If using quasar, this.$route can't get correct route info, you should use
    // the method written by LinusBorg to watch and get it.
    // ref: https://forum.vuejs.org/t/problem-this-router-currentroute-can-not-get-current-route/32001/5
    const isRouteLaunch = (this.$route.name === 'Launch')
    console.info('App isRouteLaunch:', isRouteLaunch)
    console.info('App this route:', this.$route) // or this.$router.currentRoute

    if (!isRouteLaunch) {
      console.info('App invoke authenticate()')
      this.$store.dispatch('auth/authenticate').catch(error => {
        if (!error.message.includes('Could not find stored JWT')) {
          console.error(error)
        }
      }).then(res => {
        console.log('App auth res:', res)
        // In wechat, should we need automatically jump to start launch?
        // Optinon 1 to use code below:
        // If we use codes below to jump, then remove the authenticate() invoking
        // in Launch.vue, and make wechat menu entry pointed to '/' not 'Launch' route.
        // Option 2 to make wechat menu entry pointed to
        // '/launch?code=start' and invoke app.authenticate() there too(without code below).
        // Codes below may cause a problem when wx server callback(like refresh):
        // it jumps again to Launch,
        // isRouteLaunch above is used to solve that problem.
        const inWechat = /micromessenger/.test(navigator.userAgent.toLowerCase())
        if (!res && inWechat) {
          // this.$router.replace({name: 'Launch', query: {code: 'start'}})
        }
      })
    } else {
      console.info('App skip authenticate()')
    }

    this.wxStartJsconfig()
  },
  methods: {
    wxStartJsconfig () {
      var params = {
        query: {
          type: 'jsconfig',
          url: window.location.href.split('#')[0],
          $limit: 9999
        }
      }
      console.info('App start jsconfig')
      this.$store.dispatch('wxauth/find', params).catch(error => {
        console.error('wxauth/find', error)
      }).then(page => {
        if (page.length > 0 && page[0].status === 200) {
          let cfg = page[0].result
          console.info('App get jsconfig:', cfg)
          wx.config({
            debug: true, // true 开启调试模式。
            appId: cfg.appId,
            timestamp: cfg.timestamp,
            nonceStr: cfg.nonceStr,
            signature: cfg.signature,
            jsApiList: ['chooseImage', 'uploadImage', 'scanQRCode', 'getLocalImgData'] // 看具体要调用的接口
          })
          wx.error(function (res) {
            alert('wx.error:' + res.errMsg)
          })
          wx.ready(function () {
            // This will always be called even when there is an error
          })
        } else {
          console.error('Err in jsconfig response')
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
