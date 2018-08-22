<template>
  <div class="account">
    <div class="page-container">
      <h1 class="title">SHUTTLE WITH YOU, <span class="italic">EVERYWHERE.</span></h1>
      <p class="description">Create a shuttle account to keep<br>your bookmarks <span class="italic">everywhere</span>
        you go.</p>

      <div class="form">
        <h4 class="methode">{{ methodText }} <span class="error">{{ errorText }}</span></h4>
        <input id="email_textbox" class="textbox" type="email" placeholder="E-MAIL">
        <input id="pass_textbox" class="textbox" type="password" placeholder="PASSWORD">
        <input v-if="method === 'signup'" id="conf_pass_textbox" class="textbox" type="password"
               placeholder="CONFIRM PASSWORD">
        <a href="#" class="methodeBtn btn">{{ methodText.toUpperCase() }}</a>
        <p v-if="method === 'login'" class="askOtherMethode">YOU DON'T HAVE ANY ACCOUNT ? <a href="#"
                                                                                             @click="toggleMethod"
                                                                                             class="link">SIGN-UP</a>
          HERE</p>
        <p v-if="method === 'signup'" class="askOtherMethode">YOU HAVE ALREADY AN ACCOUNT ? <a href="#"
                                                                                               @click="toggleMethod"
                                                                                               class="link">LOG-IN</a>
          YOU HERE</p>
      </div>
    </div>
    <p class="termsOfUse">BY LOGGING IN, YOU ALSO ACCEPT <a href="#" @click="showTermsOfUse" class="link gray">GENERAL
      TERMS OF USE</a></p>
    <router-link :to="{ name: 'browser' }" class="close"></router-link>
  </div>
</template>
<script>
export default {
  name: 'auth',
  data () {
    return {
      method: 'login',
      methodText: 'Log-in',
      errorText: 'Bad password',
      confirmPassTextBox: document.querySelector('#conf_pass_textbox')
    }
  },
  methods: {
    setUiToSignup () {
      this.methodText = 'Sign-up'
    },

    setUiToLogin () {
      this.methodText = 'Log-in'
    },

    toggleMethod () {
      console.log(this.method)

      if (this.method === 'login') {
        this.method = 'signup'
        this.setUiToSignup()
      } else {
        this.method = 'login'
        this.setUiToLogin()
      }

      this.$forceUpdate()
    },

    showTermsOfUse () {
      this.$electron.shell.openExternal('https://getshuttle.xyz/legal.txt')
    }
  }
}
</script>

<style src="@/assets/css/auth/auth.css"></style>
