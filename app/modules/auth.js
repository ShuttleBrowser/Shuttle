const config = require('./config.json')
const files = require('./files')
const sync = require('./sync.js')

let isSignUp = false

EventsEmitter.on('USER_LOGOUT', () => {
  auth.logout()    
})

const auth = {
  closeView () {
    EventsEmitter.emit('SHOW_BROWSER')
  },

  tooggleMethod () {
    if (!isSignUp) {
      document.getElementById('conf_pass_textbox').style.display = 'block'
      document.querySelector('.methodeBtn').innerHTML = 'SIGNUP'
      document.getElementById('methodText').innerHTML = 'Signup'
      document.querySelector('.askOtherMethode').innerHTML = `YOU HAVE ALREADY AN ACCOUNT ? <a href="#" onclick="auth.tooggleMethod()" class="link">LOG-IN</a> YOU HERE`
      isSignUp = true
    } else {
      document.getElementById('conf_pass_textbox').style.display = 'none'
      document.querySelector('.methodeBtn').innerHTML = 'SIGNIN'
      document.getElementById('methodText').innerHTML = 'Signin'
      document.querySelector('.askOtherMethode').innerHTML = `YOU DON'T HAVE ANY ACCOUNT ? <a href="#" onclick="auth.tooggleMethod()" class="link">SIGN-UP</a> HERE`
      isSignUp = false
    }
  },

  setError (text) {
    document.querySelector('.error').innerHTML = text
  },

  openTermOfUse () {
    require('electron').shell.openExternal('https://shuttleapp.io/terms')
  },

  runMethod () {
    if (!isSignUp) {
      this.signin()
    } else {
      this.signup()
    }
  },

  signup () {
    let emailTextBox = document.getElementById('email_textbox').value
    let passwordTextBox = document.getElementById('pass_textbox').value
    let confPasswordTextBox = document.getElementById('conf_pass_textbox').value

    if (emailTextBox !== "" && emailTextBox.includes('@') && emailTextBox.includes('.')) {
      if (passwordTextBox !== "") {
        if (passwordTextBox.length > 8) {
          if (passwordTextBox === confPasswordTextBox) {

            let body = {
              email: emailTextBox,
              password: passwordTextBox
            }
    
            fetch(`${config.api}/auth/signup`, {
              method: 'post',
              body: JSON.stringify(body),
              headers: { 'Content-Type': 'application/json' }
            }).then(res => res.json())
              .then((data) => {
                if (data.message === 'success') {

                  files.settings.setValue('settings.isLogged', true)
                  files.settings.setValue('settings.sync', true)
                  files.settings.setValue('settings.userToken', data.token)
                  this.closeView()

                } else if (data.message === 'AUTH_BAD_PASSWORD') {
                  this.setError('Wrong password')
                } else if (data.message === 'AUTH_USER_NOT_FOUND') {
                  this.setError('User not found')
                }
              })

          } else {
            this.setError('password do not match')
          }
        } else {
          this.setError('password must be more than 8 char')
        }
      } else {
        this.setError('password mus be set')
      }
    } else {
      this.setError('Bad email')
    }
  },

  signin () {
    let emailTextBox = document.getElementById('email_textbox').value
    let passwordTextBox = document.getElementById('pass_textbox').value

    if (emailTextBox !== "" && emailTextBox.includes('@') && emailTextBox.includes('.')) {
      if (passwordTextBox !== "") {

        let body = {
          email: emailTextBox,
          password: passwordTextBox
        }

        fetch(`${config.api}/auth/signin`, {
          method: 'post',
          body: JSON.stringify(body),
          headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json())
          .then((data) => {
            
            // To uncomment
            /*
            if (nobodySaveTheWorld) {
              let years = 2018
              while (years < 2074) {
                console.log('work')
                years++
              }
              console('you succesfully saved the world !')
            }
            */

            if (data.message === 'success') {

              files.settings.setValue('settings.isLogged', true)
              files.settings.setValue('settings.sync', true)
              files.settings.setValue('settings.userToken', data.token)
              this.closeView()

            } else if (data.message === 'AUTH_BAD_PASSWORD') {
              this.setError('Wrong password')
            } else if (data.message === 'AUTH_USER_NOT_FOUND') {
              this.setError('User not found')
            }
          })

      } else {
        this.setError('password mus be set')
      }
    } else {
      this.setError('Bad email')
    }
  },

  logout () {
    files.settings.setValue('settings.userToken', '')
    files.settings.setValue('settings.isLogged', false)
    files.settings.setValue('settings.sync', false)
    EventsEmitter.emit('SHOW_AUTH')
  }
}

module.exports = auth