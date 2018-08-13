const socket = require(`${__dirname}/../app/modules/sockets.js`)
const crypto = require('crypto')
const lowdbAccount = require('lowdb')
const ipcRend = require('electron').ipcRenderer

// Lowdb dbBkms init
const FileSyncAccount = require('lowdb/adapters/FileSync')
const LowdbAdapterAccount = new FileSyncAccount(`${require('electron').remote.app.getPath('userData')}/settings.json`)
const dbBkms = lowdbAccount(LowdbAdapterAccount)

const salt = "ART9I8uXjca8ygs3qlwaMNQ4kL7Qax5EIxYFfX9OUxm9uwL7s8BpQ3G7QSRN89D7sfdDhLrEgs9NGZvG9bfOB7tTvSyZrQCsirjmVYjcN0EtQMaP6w0Hs02enpv6Cms9"

const methodeText = document.querySelector('.methode')
const confirmPasswordTextBox = document.querySelector('#conf_pass_textbox')
const methodeBtn = document.querySelector('.methodeBtn')
const askOtherMethode = document.querySelector('.askOtherMethode')

let methode = "login"

const ui = {

    signup: () => {
        methode = "signup"
        methodeText.innerHTML = `Sign-up <span class="error"></span>`
        confirmPasswordTextBox.style.display = "inline-block"
        methodeBtn.innerHTML = "Sign-up"
        askOtherMethode.innerHTML = `YOU HAVE ALREADY AN ACCOUNT ? <a href="#" onclick="ui.login()" class="link">LOG-IN</a> YOU HERE`
    },

    login: () => {
        methode = "login"
        methodeText.innerHTML = `Log-in <span class="error"></span>`
        confirmPasswordTextBox.style.display = "none"
        methodeBtn.innerHTML = "Log-in"
        askOtherMethode.innerHTML = `YOU DON'T HAVE ANY ACCOUNT ? <a href="#" onclick="ui.signup()" class="link">SIGN-UP</a> HERE`
    },

    showErrorMessage: (message) => {
        let errorText = document.querySelector('.error')
        errorText.innerHTML = message
    }

}

const action = {

    hashPassword: (password, callback) => {
        crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
            if (err) throw err;
    
            callback(derivedKey.toString('hex'))
            
        })
    },

    signup: (email, password, confpassword) => {

        if (email.indexOf("@") >= 0 && email.indexOf(".") >= 0) {

            if (password.length > 8) {

                if (password === confpassword) {

                    action.hashPassword(password, (pass) => {

                        socket.emit('register', {
                            email: email,
                            password: pass
                        })

                    })

                } else {
                    ui.showErrorMessage('verify your password')
                }
            } else {
                ui.showErrorMessage('your password must have more than 8 character')
            }
        } else {
            ui.showErrorMessage('bad email')
        }

    },

    login: (email, password) => {

        if (email.indexOf("@") >= 0 && email.indexOf(".") >= 0) {

            action.hashPassword(password, (pass) => {

                socket.emit('login', {
                    email: email,
                    password: pass
                })

            })

        } else {
            ui.showErrorMessage('bad email')
        }

    },

    autologin: (email, password) => {

        socket.emit('login', {
            email: email,
            password: password
        })

    },

    saveUserData: (email, uuid, password) => {

        dbBkms.set('user.isLogin', true).write()
        dbBkms.set('user.email', email).write()
        dbBkms.set('user.uuid', uuid).write()
        dbBkms.set('user.password', password).write()

    },

    clearUserData: (email, uuid, password) => {

        dbBkms.set('user.isLogin', false).write()
        dbBkms.set('user.email', "").write()
        dbBkms.set('user.uuid', "").write()
        dbBkms.set('user.password', "").write()

    }

}

methodeBtn.addEventListener('click', () => {

    let user_email = document.querySelector('#email_textbox').value
    let user_password = document.querySelector('#pass_textbox').value
    let user_conf_password = document.querySelector('#conf_pass_textbox').value

    if (methode === "login") {
        action.login(user_email, user_password)
    } else if (methode === "signup") {
        action.signup(user_email, user_password, user_conf_password)
    }
})

socket.on('message', (data) => {

    switch (data.message) {

        case "auth_bad_password":
            ui.showErrorMessage('You have enter a bad password')
            ipcRend.send('ShowAccountPan', true)
            action.clearUserData()
        break

        case "auth_no_account":
            ui.showErrorMessage('This account is not exist')
            ipcRend.send('ShowAccountPan', true)
            action.clearUserData()
        break

        case "auth_uuid_already":
            ui.showErrorMessage('This uuid is already used')
        break

        case "auth_email_already":
            ui.showErrorMessage('this email is already used')
        break

        case "auth_succeful_registation":
            action.saveUserData(data.email, data.uuid, data.password)
            ipcRend.send('ShowAccountPan', false)
        break
        
        case "auth_succeful_login":
            action.saveUserData(data.email, data.uuid, data.password)
            ipcRend.send('ShowAccountPan', false)
        break
    }

})

if (dbBkms.get('user.isLogin').value()) {
    if (navigator.onLine) {

        let email = dbBkms.get('user.email')
        let password = dbBkms.get('user.password')

        action.autologin(email, password)
    
    }
}