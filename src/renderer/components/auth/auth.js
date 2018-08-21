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

    showTemsOfUse () {
      this.$electron.shell.openExternal('https://getshuttle.xyz/legal.txt')
    }

  }
}
