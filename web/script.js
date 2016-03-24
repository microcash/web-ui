var pages = {
  loading: function () {},
  login: function (page) {
    var login = $('.ui.form', page)
    this.loginWithCredentials = function (credentials) {
      login.form('set values', credentials)
      login.form('submit')
    }
    this.forget = function () {
      login.form('reset')
    }
    login.form({
      fields: {
        username: { identifier: 'username', rules: [
          { type: 'empty', prompt: 'Please enter your username' }
        ]},
        password: { identifier: 'password', rules: [
          { type: 'empty', prompt: 'Please enter your password' },
          { type: 'length[8]', prompt: 'Your password must be at least 8 characters' }
        ]}
      },
      onSuccess: function () {
        var credentials = {
          username: login.form('get value', 'username'),
          password: login.form('get value', 'password')
        }
        app.animate(this, app.user.tryLogin(credentials)
          .done(function () {
            app.credentials.remember(credentials)
            app.components['accounts'].refresh()
            app.switchPage('main')
          })
          .fail(function () {
            app.switchPage('login')
          })
        )
        return false
      }
    })
  },
  setup: function (page) {
    var setup = $('.ui.form', page)
    setup.form({
      fields: {
        username: { identifier: 'username', rules: [
          { type: 'empty', prompt: 'Please enter your username' },
          { type: 'length[4]', prompt: 'Your username must be at least 4 characters' }
        ]},
        password: { identifier: 'pwd', rules: [
          { type: 'empty', prompt: 'Please enter your password' },
          { type: 'length[8]', prompt: 'Your password must be at least 8 characters' }
        ]},
        confirm: { identifier: 'confirm', rules: [
          { type: 'empty', prompt: 'Please confirm your password' },
          { type: 'match[pwd]', prompt: 'Passwords must match' }
        ]}
      },
      onSuccess: function () {
        var credentials = {
          username: setup.form('get value', 'username'),
          password: setup.form('get value', 'pwd')
        }
        app.animate(setup, app.user.setup(credentials)
          .done(function () {
            app.credentials.remember(credentials)
            app.components['accounts'].refresh()
            app.switchPage('main')
          })
          .fail(function () {
            // TODO message
          })
        )
        return false
      }
    })
  },
  main: function (page) {
    $('.ui.sidebar.menu [data-tab]', page).tab()
  }
}

var components = {
  logout: function (com) {
    com.click(function () {
      app.logout()
    })
  },
  accounts: function (com) {
    var self = this
    self.refresh = function () {
      return app.wallet.listAccounts()
        .done(function (accounts) {
          $('table', com).html(
            $.map(accounts, function (account) {
              return '<tr><td>' + account.address + '</td><td>' + account.balance + '</td></tr>'
            }).join('\n')
          )
        })
    }
    $('#add-account', com).click(function () {
      app.animate(this, app.wallet.addAccount()
        .done(function () {
          self.refresh()
        })
        .fail(function () {
          // TODO message
        })
      )
    })
    $('#refresh-accounts', com).click(function () {
      app.animate(this, self.refresh())
    })
  }
}

var app = {
  animate: function (obj, promise) {
    var jq = $(obj)
    jq.addClass('loading')
    promise
      .always(function () {
        jq.removeClass('loading')
      })
    return promise
  },
  api: {
    call: function (resource, dataCallback) {
      var d = $.Deferred()
      $.ajax({
        url: '/' + resource,
        dataType: 'json'
      })
        .done(function (data) {
          if (data.error !== 0) {
            d.reject()
            return
          }
          if (typeof dataCallback !== 'undefined') {
            d.resolve(dataCallback(data))
          } else {
            d.resolve()
          }
        })
        .fail(function () {
          d.reject()
        })
      return d.promise()
    },
    callWithCredentials: function (resource, dataCallback, credentials) {
      if (typeof dataCallback !== 'function') {
        credentials = dataCallback
        dataCallback = undefined
      }
      if (typeof credentials === 'undefined') {
        credentials = app.credentials.recall()
      }
      return this.call(credentials.username + '/' + credentials.password + '/' + resource, dataCallback)
    }
  },
  credentials: {
    remember: function (credentials) {
      sessionStorage.username = credentials.username
      sessionStorage.password = credentials.password
    },
    recall: function () {
      return {
        username: sessionStorage.username,
        password: sessionStorage.password
      }
    },
    forget: function () {
      sessionStorage.username = ''
      sessionStorage.password = ''
    }
  },
  user: {
    tryLogin: function (credentials) {
      return app.api.callWithCredentials('login', credentials)
    },
    setup: function (credentials) {
      return app.api.callWithCredentials('createfirstaccount', credentials)
    }
  },
  wallet: {
    addAccount: function () {
      return app.api.callWithCredentials('add_mc_account')
    },
    detectUsers: function () {
      return app.api.call('u/p/anyaccounts')
    },
    listAccounts: function () {
      return app.api.callWithCredentials('get_mc_accounts', function (data) {
        return data.accounts
      })
    }
  },
  pages: pages,
  components: components,
  init: function () {
    var app = this
    // init pages
    for (var page in app.pages) {
      var jq = app.pages[page].jq = $('#page-' + page)
      app.pages[page].call(app.pages[page], jq)
    }
    // init components
    for (var component in app.components) {
      var jq = app.components[component].jq = $('#component-' + component)
      app.components[component].call(app.components[component], jq)
    }
  },
  logout: function () {
    this.credentials.forget()
    this.pages['login'].forget()
    this.switchPage('login')
  },
  switchPage: function (name) {
    if (typeof this.pages[name] === 'undefined') {
      return
    }
    for (var page in this.pages) {
      if (typeof this.pages[page].jq === 'undefined') {
        continue
      }
      if (page === name) {
        this.pages[page].jq.show()
      } else {
        this.pages[page].jq.hide()
      }
    }
    document.body.className = 'page-' + name
  }
}

$(document).ready(function () {
  app.init()

  app.wallet.detectUsers()
    .done(function () {
      app.credentials.forget()
      app.switchPage('setup')
    })
    .fail(function () {
      var credentials = app.credentials.recall()
      app.switchPage('login')
      if (credentials.username && credentials.password) {
        app.pages['login'].loginWithCredentials(credentials)
      }
    })
})
