<template>
  <main class="home container">
    <div class="row">
      <div class="col-12 col-8-tablet push-2-tablet text-center">
        <img class="logo center-item"
          src="http://feathersjs.com/img/feathers-logo-wide.png"
          alt="Feathers Logo">
        <h3 class="title">Chat</h3>
      </div>
    </div>

    <div class="row">
      <div class="col-12 push-4-tablet col-4-tablet">
        <div class="row">
          <div class="col-12">
            <router-link as="a" :to="{name: 'Login'}" class="button button-primary block login">Login</router-link>
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <router-link as="a" :to="{name: 'Signup'}" class="button button-primary block signup">Signup</router-link>
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <router-link as="a" :to="{name: 'Launch', query: {code:'start'}}" class="button button-primary block login">Launch</router-link>
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <button @click="takePhoto">Take a photo</button>
            <img v-show="localId" height="40px" width="40px" :src="localId"/>
          </div>
        </div>
      </div>
    </div>

  </main>
</template>

<script>
  import wx from 'weixin-js-sdk'
  export default {
    name: 'home',
    data () {
      return {
        localId: undefined
      }
    },
    methods: {
      takePhoto () {
        var that = this

        wx.chooseImage({
          count: 1, // 默认9
          sizeType: 'compressed', // 'original', 'compressed'
          sourceType: ['camera'], // 'album', 'camera'
          success: function (res) {
            var localId = res.localIds[0] // localId 可以作为 img 标签的 src 属性显示图片
            uploadPhoto(localId)
          },
          fail: function (res) {
            alert(res.message)
          }
        })

        function uploadPhoto (localId) {
          wx.uploadImage({
            localId,
            isShowProgressTips: 1, // 显示进度提示
            success: function (res) {
              // Determin if the client are using ios wkwebview
              if (window.__wxjs_is_wkwebview === true) {
                // new ios and wechat
                wx.getLocalImgData({
                  localId, // 图片的localID
                  success: function (res) {
                    that.localId = res.localData // localData是图片的base64数据，可以用img标签显示
                  }
                })
              } else {
                // android and old ios
                that.localId = localId
              }
              var serverId = res.serverId
              that.$emit('success', {serverId, localId})
            },
            fail: function (res) {
              var message = res.errMsg
              that.$emit('fail', {message})
            }
          })
        }
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
main.home {
  padding-top: 100px;
  padding-bottom: 100px;
}

main.home img.logo {
  width: 100%;
  max-width: 400px;
}

main.home h3.title {
  color: #969696;
  font-weight: 100;
  text-transform: uppercase;
  margin-bottom: 40px;
}

main.home .button.login,
main.home .button.signup {
  padding-top: 1.2em;
  padding-bottom: 1.2em;
}

main.home .button.login {
  background: none;
  border: 2px solid #CFCFCF;
  color: #999;
}

main.home .button.login:hover,
main.home .button.login:focus {
  background: none;
  border: 2px solid #31D8A0;
  color: #31D8A0;
}
</style>
