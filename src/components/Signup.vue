<template>
<main class="login container">
  <div class="row">
    <div class="col-12 col-6-tablet push-3-tablet text-center">
      <h1 class="font-100">Create an Account</h1>
    </div>
  </div>
  <div class="row">
    <div class="col-12 col-6-tablet push-3-tablet col-4-desktop push-4-desktop">

      <div class="error" v-if="error">
        {{error.message}}
        <a class="close" href="javascript://" @click.prevent="dismissError">dismiss</a>
      </div>

      <form class="form" method="post" @submit.prevent="onSubmit(email, password, mobile, captcha)">
        <fieldset>
          <input class="block"
            v-model="email"
            type="email"
            name="email"
            placeholder="email"
            required>
        </fieldset>

        <fieldset>
          <input class="block"
            v-model="password"
            type="password"
            name="password"
            placeholder="password"
            required>
        </fieldset>

        <fieldset>
          <input class="block"
             v-model="mobile"
             type="text"
             name="mobile"
             placeholder="mobile"
             required>
        </fieldset>

        <fieldset>
          <input class="block"
             v-model="captcha"
             type="text"
             name="captcha"
             placeholder="captcha"
             required>
          <button type="button" class="button button-primary" :disabled="disableCaptcha" @click="sendCaptcha">
            {{btnCaptcha}}
          </button>
        </fieldset>

        <button type="submit" class="button button-primary block signup">
          Signup {{openid? ' via wechat':''}}
        </button>

        <router-link as="button" :to="{name: 'Login', params: {openid}}" class="button button-secondary block">
          {{openid? 'Bind':'Login'}}
        </router-link>
      </form>
    </div>
  </div>
</main>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'

const WAIT_SECS = 60
const SEND_CAPTCHA = 'Send Captcha'

export default {
  data () {
    return {
      email: undefined,
      password: undefined,
      mobile: undefined,
      captcha: undefined,
      seconds: 0,
      timer: 0,
      btnCaptcha: SEND_CAPTCHA,
      disableCaptcha: false,
      error: undefined
    }
  },
  props: {
    openid: {
      default: undefined
    }
  },
  mounted () {
    console.log('Signup openid:', this.openid)
  },
  methods: {
    ...mapActions('smscode', {
      sendSmsCode: 'create'
    }),
    dismissError () {
      this.error = undefined
      this.clearCreateError()
    },
    validMobile (number) {
      if (!number) return false
      return (/(^(13\d|15[^4,\D]|17[13678]|18\d)\d{8}|170[^346,\D]\d{7})$/.test(number))
    },
    sendCaptcha () {
      var mobile = this.mobile
      if (!this.validMobile(mobile)) {
        alert('Error: wrong format of mobile!')
        return
      }
      this.disableCaptcha = true
      this.timer = setInterval(this.updateButton, 1000)
      this.sendSmsCode({mobile}).then(r => {
        console.log('SendSmsCode ok:', r)
      }).catch(e => {
        if (e.MyErr) {
          alert(e.MyErr.msg)
        } else {
          console.log('SendSmsCode Err:', e)
        }
      })
    },
    updateButton () {
      if (++this.seconds < WAIT_SECS) {
        this.btnCaptcha = 'Wait (' + (WAIT_SECS - this.seconds) + ')s'
      } else {
        this.seconds = 0; clearInterval(this.timer)
        this.btnCaptcha = SEND_CAPTCHA
        this.disableCaptcha = false
      }
    },
    onSubmit (email, password, mobile, captcha) {
      this.dismissError()

      if (this.captcha.length < 4) {
        alert('Error: wrong format of captcha')
        return
      }

      let user = {email, password, mobile, code: captcha, active: false}
      if (this.openid) {
        user.openid = this.openid
      }

      // Automatically log the user in after successful signup.
      this.createUser(user)
        .then(response => this.authenticate({strategy: 'local', email, password}))
        // Just use the returned error instead of mapping it from the store.
        .catch(error => {
          error = Object.assign({}, error)
          console.error('CreateUser err:', error)
          if (error.MyErr) {
            error.message = error.MyErr.msg
          } else {
            // Convert the error to a plain object and add a message.
            let type = error.errorType
            error = Object.assign({}, error)
            error.message = (type === 'uniqueViolated')
              ? 'That email or mobile is unavailable.'
              : 'An error prevented signup.'
          }
          this.error = error
        })
    },
    ...mapActions('users', {
      createUser: 'create'
    }),
    ...mapMutations('users', {
      clearCreateError: 'clearCreateError'
    }),
    ...mapActions('auth', [
      'authenticate'
    ])
  }
}
</script>
