import Dropbox from 'dropbox'
import queryString from 'query-string'
const CLIENT_ID = 'i5n1fpuxsfzg39o'


function loginClicked() {
    let dbx = new Dropbox({clientId: CLIENT_ID})
    let authUrl = dbx.getAuthenticationUrl(window.location)
    // Redirect to authUrl:
    window.location = authUrl
}

function getAccessToken() {
    if (!localStorage['accessToken']) {
        return getAccessTokenFromUrl()
    }
    else {
        return localStorage['accessToken']
    }
}

function getAccessTokenFromUrl() {
    if (!window.location.hash) {
        return null
    }
    else {
        let token = queryString.parse(window.location.hash).access_token
        localStorage.setItem('accessToken', token)
        return token
    }
}

function isAuthenticated() {
    return !!getAccessToken()
}

function getFiles(callback) {
    let dbx = new Dropbox({accessToken: getAccessToken()})
    dbx.filesListFolder({path: ''}).then(function(response) {returnFiles(response, callback)}).catch(err => {console.log('error', err)})
}

function returnFiles(response, callback) {
    console.log('from returnFiles: ', response.entries)
    callback(response.entries)
}

function getFileContents(fileName, callback) {
   let dbx = new Dropbox({accessToken: getAccessToken()})
   dbx.filesDownload({path: '/' + fileName}).then(function handleFileContents(response) {
       let blobReader = new FileReader()
       blobReader.addEventListener('loadend', function() {
           callback(blobReader.result)
       })
       blobReader.readAsText(response.fileBlob)
   })
}

function writeFile(fileName, contents, callback) {
    let dbx = new Dropbox({accessToken: getAccessToken()})
    dbx.filesUpload({
        path: '/' + fileName,
        mode: {'.tag': 'overwrite'},
        contents: contents,
        mute: true
    }).then(function(response) {
        callback(response)
    })
}

function logout() {
    window.location.hash = ''
    localStorage.removeItem('accessToken')
}

module.exports = {
    loginClicked,
    isAuthenticated,
    getFiles,
    getFileContents,
    logout,
    writeFile
}
