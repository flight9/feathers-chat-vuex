<template>
  <main class="home container">
    <div class="row">
      <h3>Deal with token</h3>
    </div>
  </main>
</template>

<script>
  import URL from 'url-parse'
  export default {
    name: 'Token',
    mounted () {
      // get token from query string
      let url = new URL(window.location.href, '', true)
      let token = url.query.token || this.$route.query.token
      console.log(`token`, token)

      // set token to local and redirect to root
      if (token) {
        window.localStorage.setItem('feathers-jwt', token)
        window.location = '/#/'
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

</style>
