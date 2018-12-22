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
      document.querySelector('.methodeBtn').innerHTML = lang('AUTH_SIGNUP').toUpperCase()
      document.getElementById('methodText').innerHTML = lang('AUTH_SIGNUP')
      document.querySelector('.askOtherMethode').innerHTML = lang('AUTH_ASK_FOR_SIGNIN')
      isSignUp = true
    } else {
      document.getElementById('conf_pass_textbox').style.display = 'none'
      document.querySelector('.methodeBtn').innerHTML = lang('AUTH_SIGNIN').toUpperCase()
      document.getElementById('methodText').innerHTML = lang('AUTH_SIGNIN')
      document.querySelector('.askOtherMethode').innerHTML = lang('AUTH_ASK_FOR_SIGNUP')
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
                  this.setError(lang('AUTH_BAD_PASSWORD'))
                } else if (data.message === 'AUTH_USER_NOT_FOUND') {
                  this.setError(lang('AUTH_USER_NOT_FOUND'))
                }
              })

          } else {
            this.setError(lang('AUTH_PASSWORD_DONT_MATCH'))
          }
        } else {
        this.setError(lang('AUTH_INVALID_PASSWORD'))
      }
    } else {
      this.setError(lang('AUTH_INVALID_EMAIL'))
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
              let years = 2019
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
              this.setError(lang('AUTH_BAD_PASSWORD'))
            } else if (data.message === 'AUTH_USER_NOT_FOUND') {
              this.setError(lang('AUTH_USER_NOT_FOUND'))
            }
          })

      } else {
        this.setError(lang('AUTH_INVALID_PASSWORD'))
      }
    } else {
      this.setError(lang('AUTH_INVALID_EMAIL'))
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