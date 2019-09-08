const { BrowserWindow } = require('electron')
const { OAUTH_CLIENT, SAVE_BOOKMARK_KEY } = require('./secrets')
const { OAuth2Client } = require('google-auth-library')
const Store = require('electron-store')
const store = new Store()

const CREDENTIALS_KEY = 'GOOGLE_DRIVE_CREDENTIALS'

class GoogleAuth {
  constructor () {
    this.client = new OAuth2Client({
      clientId: OAUTH_CLIENT.client_id,
      redirectUri: 'urn:ietf:wg:oauth:2.0:oob'
    })

    if (store.has(CREDENTIALS_KEY)) {
      this.credentials = JSON.parse(store.get(CREDENTIALS_KEY))
    }
  }

  getOAuthCodeByInteraction (interactionWindow, authPageURL) {
    interactionWindow.loadURL(authPageURL)
    return new Promise((resolve, reject) => {
      const onclosed = () => {
        reject('Interaction ended intentionally ;(')
      }
      interactionWindow.on('closed', onclosed)
      interactionWindow.on('page-title-updated', (ev) => {
        const url = new URL(ev.sender.getURL())
        if (url.searchParams.get('approvalCode')) {
          interactionWindow.removeListener('closed', onclosed)
          interactionWindow.close()
          return resolve(url.searchParams.get('approvalCode'))
        }
        if ((url.searchParams.get('response') || '').startsWith('error=')) {
          interactionWindow.removeListener('closed', onclosed)
          interactionWindow.close()
          return reject(url.searchParams.get('response'))
        }
      })
    })
  }

  refreshCredentials () {
    if (store.has(CREDENTIALS_KEY)) {
      this.credentials = JSON.parse(store.get(CREDENTIALS_KEY))
      // console.log(client.credentials)

      if (this.credentials.expiry_date !== undefined) {
        this.client.refreshToken(this.credentials.refresh_token)
          .then(function (r) {
            try {
              this.credentials.expiry_date = r.tokens.expiry_date
              this.credentials.access_token = r.tokens.access_token
              this.credentials.token_type = r.tokens.token_type
              this.credentials.refresh_token = getJsonFromUrl(r.res.config.body).refresh_token
              this.credentials.token_type = r.tokens.token_type

              this.client.setCredentials(this.credentials)
              store.set(CREDENTIALS_KEY, JSON.stringify(this.credentials))

              console.log('updated credentials until ' + new Date(this.credentials.expiry_date).toUTCString())
            } catch (error) {}
          })
          .catch(function (err) {
            console.error(err)
          })
      }
    }
  }

  getCredentials () {
    return this.credentials
  }

  startAuth () {
    // 0) Initialize OAuth Client

    const url = this.client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive']
    })

    const that = this;

    return new Promise((resolve, reject) => {
      // 1) Create another window and get code.
      const auth = new BrowserWindow({ width: 400, height: 620, resizable: true })

      this.getOAuthCodeByInteraction(auth, url)
      .then(function (result) {
        that.client.getToken(result)
          .then(function (response) {
            let credentials = response.tokens
            that.client.setCredentials(credentials.tokens)
            that.credentials = response.tokens
            store.set(CREDENTIALS_KEY, JSON.stringify(response.tokens))
            resolve(credentials)
          })
          .catch(function (error) {
            console.error(error)
            reject(error)
          })
      })
      .catch(function (error) {
        console.error(error)
        reject(error)
      })
    })
  }

  logout () {
    store.delete(CREDENTIALS_KEY)
    store.delete(SAVE_BOOKMARK_KEY)
  }
}

function getJsonFromUrl (url) {
  if (!url) return {}
  var query = url
  var result = {}
  query.split('&').forEach(function (part) {
    if (!part) return
    part = part.split('+').join(' ') // replace every + with space, regexp-free version
    var eq = part.indexOf('=')
    var key = eq > -1 ? part.substr(0, eq) : part
    var val = eq > -1 ? decodeURIComponent(part.substr(eq + 1)) : ''
    var from = key.indexOf('[')
    if (from === -1) result[decodeURIComponent(key)] = val
    else {
      var to = key.indexOf(']', from)
      var index = decodeURIComponent(key.substring(from + 1, to))
      key = decodeURIComponent(key.substring(0, from))
      if (!result[key]) result[key] = []
      if (!index) result[key].push(val)
      else result[key][index] = val
    }
  })
  return result
}

module.exports = GoogleAuth
