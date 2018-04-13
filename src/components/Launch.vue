<template>
  <main class="home container">
    <div class="row">
      <div class="col-12 col-8-tablet push-2-tablet text-center">
        <img class="logo center-item"
          src="http://feathersjs.com/img/feathers-logo-wide.png"
          alt="Feathers Logo">
        <h1 class="title">Launch</h1>
        <h3>code: {{code}}</h3>
      </div>
    </div>

    <div class="row">

    </div>

  </main>
</template>

<script>
  import {mapGetters, mapActions} from 'vuex'
  import URL from 'url-parse'

  export default {
    name: 'launch',
    data () {
      return {
        code: `nothing`
      }
    },
    mounted () {
      // NOTE: When use URL, '?code=xxxx' must before '#/Launch'
      let url = new URL(window.location.href, '', true)
      this.code = url.query.code || this.$route.query.code
      // console.log(`url`, url)

      if (this.code === 'start') {
        // Authenticate only for wechat to avoid login twice.
        // (Skip Authenticate in App.vue)
        console.info('Launch invoke authenticate()')
        this.authenticate().catch(err => {
          // TODO: Is token expired an error and show here?
          console.log('Launch auth err:', err)
        }).then(res => {
          console.log('Launch auth res:', res)
          if (!res) {
            console.log('Launch start')
            this.wxGetUrl()
          }
        })
      } else {
        console.log('Launch callback')
        this.wxGetToken()
      }
    },
    computed: {
      ...mapGetters('wxauth', {
        wxauth: 'list'
      })
    },
    methods: {
      ...mapActions('wxauth', {
        findWxauth: 'find'
      }),
      ...mapActions('auth', ['authenticate']),
      wxGetUrl () {
        this.findWxauth({
          query: {
            type: 'url',
            $limit: 9999
          }
        }).then((page) => {
          console.log(`Response page:`, page)
          if (page.length > 0 && page[0].status === 200) {
            let authUrl = page[0].result.url
            console.log('wxGetUrl callback')
            window.location.href = authUrl
            // console.info('Auth url:', authUrl)
          } else {
            console.error('Err in wxGetUrl response')
          }
        })
      },
      wxGetToken () {
        this.findWxauth({
          query: {
            type: 'token',
            code: this.code,
            $limit: 9999
          }
        }).then((page) => {
          console.log(`Response page:`, page)
          if (page.length > 0 && page[0].status === 200) {
            var result = page[0].result
            if (result.found) {
              // Re-authenticate with jwt
              this.authenticate({strategy: 'jwt', accessToken: result.access_token})
                .catch(error => {
                  // Convert the error to a plain object and add a message.
                  let type = error.className
                  error = Object.assign({}, error)
                  error.message = (type === 'not-authenticated')
                    ? 'Incorrect email or password.'
                    : 'An error prevented login.'
                  console.log('Launch err:', error)
                })
            } else {
              // (Not found) Redirect to Signup page with openid
              this.$router.replace({name: 'Signup', params: {openid: result.openid}})
            }
          } else {
            console.error('Err in wxGetToken response')
          }
        })
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
