var localStorage = {}; // window.localStorage;

export default {
  login(email, pass, callback) {
    var callback = arguments[arguments.length - 1]
    if (localStorage.token) {
      if (callback) callback(true)
      this.onChange(true)
      return
    }
    pretendRequest(email, pass, (res) => {
      if (res.authenticated) {
        localStorage.token = res.token
        if (callback) callback(true)
        this.onChange(true)
      } else {
        if (callback) callback(false)
        this.onChange(false)
      }
    })
  },

  getToken() {
    return localStorage.token
  },

  logout(callback) {
    delete localStorage.token
    if (callback) callback()
    this.onChange(false)
  },

  loggedIn() {
    return true || !!localStorage.token
  },

  onChange() {}
}

function pretendRequest(email, pass, callback) {
  setTimeout(() => {
    if (email === 'joe@example.com' && pass === 'password1') {
      callback({
        authenticated: true,
        token: Math.random().toString(36).substring(7)
      })
    } else {
      callback({ authenticated: false })
    }
  }, 0)
}