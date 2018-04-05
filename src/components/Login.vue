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
          {{openid? 'Bind':'Login'}}
        </button>

        <router-link as="button" :to="{name: 'Signup', params: {openid}}" class="button button-secondary block">
          Signup {{openid? ' via wechat':''}}
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
  props: {
    openid: {
      default: undefined
    }
  },
  mounted () {
    console.log('Login openid:', this.openid)
  },
  methods: {
    dismissError () {
      this.error = undefined
      this.clearAuthenticateError()
    },

    onSubmit (email, password) {
      // TODO: Replace test openid with real one from properties.
      var openid = '22222333333'
      this.authenticate({strategy: 'local', email, password, openid})
        // Just use the returned error instead of mapping it from the store.
        .catch(error => {
          // Convert the error to a plain object and add a message.
          let type = error.className
          error = Object.assign({}, error)
          error.message = (type === 'not-authenticated')
            ? 'Incorrect email or password.'
            : 'An error prevented login.'
          this.error = error
        })
    },
    ...mapMutations('auth', {
      clearAuthenticateError: 'clearAuthenticateError'
    }),
    ...mapActions('auth', ['authenticate'])
  }
}
</script>
