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

global.localStorage = localStorageMock
