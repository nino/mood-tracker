let localStorageMock = {
  setItem: function(key, item) {
    this[key] = item
  },

  getItem: function(key) {
    return this[key]
  },

  removeItem: function(key) {
    this[key] = undefined
  }
}

let DropboxControllerMock = {
}

global.localStorage = localStorageMock
global.DropboxController = DropboxControllerMock
