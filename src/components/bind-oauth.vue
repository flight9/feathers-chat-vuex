<template>
<main class="login container">
  <div class="row">
    <div class="col-12 col-6-tablet push-3-tablet text-center">
      <h1 class="font-100">Welcome Back</h1>
    </div>
  </div>
  <div class="row">
    <div class="col-12 col-6-tablet push-3-tablet col-4-desktop push-4-desktop">

      <div class="error" v-if="error">
        {{error.message}}
        <a class="close" href="javascript://" @click.prevent="dismissError">dismiss</a>
      </div>

      <form class="form" method="post" @submit.prevent="onSubmit(email, password)">
        <fieldset>
          <input class="block" type="email" name="email" placeholder="email" v-model="email">
        </fieldset>

        <fieldset>
          <input class="block" type="password" name="password" placeholder="password" v-model="password">
        </fieldset>

        <button type="submit" class="button button-primary block login">
          Bind
        </button>

        <router-link as="button" :to="{name: 'SignupOauth'}" class="button button-secondary block">
          Signup
        </router-link>
      </form>
    </div>
  </div>
</main>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'

export default {
  data () {
    return {
      email: undefined,
      password: undefined,
      error: undefined
    }
  },
  computed: {
    user () {
      return this.$store.state.auth.user
    }
  },
  mounted () {
    // enusre logout
    this.logout()
  },
  methods: {
    dismissError () {
      this.error = undefined
      this.clearAuthenticateError()
    },
    async onSubmit (email, password) {
      this.dismissError()

      // get wechatProfile
      const wechatProfile = JSON.parse(window.localStorage.getItem('wechat-profile'))
      console.log('get wechatProfile', wechatProfile)
      if (!wechatProfile || !wechatProfile.openid) {
        alert('No wechat profile!')
        return
      }

      // verify username/password and login
      const cert = { strategy: 'local', email, password }
      let jwtToken = await this.authenticate(cert)
        .catch(error => {
          // Convert the error to a plain object and add a message.
          console.log('Bind err:', error)
          let type = error.className
          error = Object.assign({}, error)
          if (type === 'not-authenticated') {
            error.message = 'Incorrect email or password.'
          }
          this.error = error
        })
      console.log('test creating jwt before bind', jwtToken)
      if (!jwtToken) {
        alert('Incorrect email or password!')
        return
      }

      // check double-bound
      if (this.user.bind_status === 'bound' || this.user.openid) {
        alert('This user has been bound before!')
        this.logout() // TODO BUG will redirect to Chat page, not be back(showing blank)
        return
      }

      // find & update wx.properties to binding account
      let bindUserId = this.user._id
      console.log('bindUserId', bindUserId)
      let data = {
        bind_status: 'bound',
        openid: wechatProfile.openid,
        wechat: wechatProfile
      }
      let patchedUser = await this.patchUser([bindUserId, data])
      console.log('patchedUser after binding', patchedUser)

      // delete oauthUser
      let oauthUserId = window.localStorage.getItem('oauth-user-id')
      let deletedUser = await this.removeUser(oauthUserId)
      console.log('deletedUser after binding', deletedUser)

      // re-login to redirect
      await this.logout()
      await this.authenticate(cert)
    },
    ...mapMutations('auth', {
      clearAuthenticateError: 'clearAuthenticateError'
    }),
    ...mapActions('users', {
      patchUser: 'patch',
      removeUser: 'remove'
    }),
    ...mapActions('auth', ['authenticate', 'logout'])
  }
}
</script>
