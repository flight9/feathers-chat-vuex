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

      <form class="form" method="post" @submit.prevent="onSubmit(email, password, displayName)">
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
             v-model="displayName"
             type="text"
             name="displayName"
             placeholder="Display Name"
             required>
        </fieldset>

        <button type="submit" class="button button-primary block signup">
          Signup
        </button>

        <router-link as="button" :to="{name: 'BindOauth'}" class="button button-secondary block">
          Bind
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
      displayName: undefined,
      error: undefined
    }
  },
  props: {
    openid: {
      default: undefined
    }
  },
  computed: {
    user () {
      return this.$store.state.auth.user
    }
  },
  mounted () {
  },
  methods: {
    dismissError () {
      this.error = undefined
      this.clearPatchError()
    },
    async onSubmit (email, password, displayName) {
      this.dismissError()

      console.log('Signup auth.user before', this.user)
      if (!this.user) {
        alert('No auth user!')
        return
      }

      // collect data
      let data = {
        email,
        password,
        display_name: displayName,
        bind_status: 'bound'
      }

      // update user
      let updatedUser = await this.patchUser([this.user._id, data, {}])
        .catch(error => {
          // copy error
          error = Object.assign({}, error)
          console.error('PatchUser err:', error)
          // set error message
          if (error.MyErr) {
            error.message = error.MyErr.msg
          } else {
            let type = error.errorType
            error = Object.assign({}, error)
            error.message = (type === 'uniqueViolated')
              ? 'That email or mobile is unavailable.'
              : 'An error prevented signup.'
          }
          this.error = error
        })
      console.log('auth.user after', this.user, updatedUser)
      // TODO auth.user properties may not get updated

      // redirect
      this.$router.replace({name: 'Chat'})
    },
    ...mapActions('users', {
      patchUser: 'patch'
    }),
    ...mapMutations('users', {
      clearPatchError: 'clearPatchError'
    }),
    ...mapActions('auth', [
      'authenticate'
    ])
  }
}
</script>
