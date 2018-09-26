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
    user (newUser) {
      console.log('User newVal:', newUser)
      if (!newUser) {
        // After logout
        this.$router.replace({name: 'Login'})
      } else {
        // After login
        if (this.inWechat()) {
          if (newUser.bind_status === 'bound') {
            // bound user
            this.$router.replace({name: 'Chat'}) // or dashboard for wechat
            console.log('Router redirects to Chat for bound user.')
          } else {
            // createdByOauth user
            this.$router.replace({name: 'SignupOauth'})
            console.log('Router redirects to SignupOauth for createdByOauth user.')
          }
        } else {
          this.$router.replace({name: 'Chat'})
        }

        // TODO: Mike: Do jsconfig ONLY after user logged in && ONLY inside Wechat

        // TODO Future redirect simulating
        // console.info('App user appVersion:', newUser.appVersion)
        // alert('appVersion' + newUser.appVersion)
      }
    }
  },
  mounted () {
    console.info('App invoke authenticate()')
    this.$store.dispatch('auth/authenticate').catch(error => {
      if (!error.message.includes('Could not find stored JWT')) {
        console.error(error)
        if (this.inWechat) {
          // TODO redirect to server /auth/wechat to start OAuth process
        }
      }
    }).then(res => {
      console.log('App auth result:', res)
      // Authenticate from wechat oauth may always be successful, but that doesn't mean
      //  it's a bound user or a new one. Go above to check logined user's bind_status.
    })

    // this.wxStartJsconfig()
  },
  methods: {
    inWechat () {
      return /micromessenger/.test(navigator.userAgent.toLowerCase())
    },
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
