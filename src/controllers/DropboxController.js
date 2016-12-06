import Dropbox from 'dropbox';
import queryString from 'query-string';
const CLIENT_ID = 'i5n1fpuxsfzg39o';

function loginClicked() {
  let dbx = new Dropbox({clientId: CLIENT_ID});
  let authUrl = dbx.getAuthenticationUrl(window.location);
  // Redirect to authUrl:
  window.location = authUrl;
}

function getAccessToken() {
  if (!localStorage['accessToken']) {
    return getAccessTokenFromUrl();
  }
  else {
    return localStorage['accessToken'];
  }
}

function getAccessTokenFromUrl() {
  if (!window.location.hash) {
    return null;
  }
  else {
    let token = queryString.parse(window.location.hash).access_token;
    localStorage.setItem('accessToken', token);
    return token;
  }
}

function isAuthenticated() {
  return !!getAccessToken();
}

function getFileList() {
  const dbx = new Dropbox({accessToken: getAccessToken()});
  return dbx.filesListFolder({path: ''})
    .then(response => response.entries)
    .catch(error => ({ 'error': error }));
}

function fileExists(fileName) {
  return (
    getFileList()
      .then(files => !!files.find(file => file.name === fileName))
      .catch(err => ({error: err}))
  );
}

function getFileContents(fileName) {
  const dbx = new Dropbox({accessToken: getAccessToken()});
  return new Promise((resolve, reject) => {
    fileExists(fileName)
      .then(exists => { if (!exists) throw Error('file does not exist') })
      .then(() => dbx.filesDownload({path: '/' + fileName}))
      .then(response =>  readFileBlob(response.fileBlob))
      .then(resolve)
      .catch(reject);
  });
}

function readFileBlob(fileBlob) {
  console.log('reading file blob');
  let blobReader = new FileReader();
  return new Promise((resolve, reject) => {
    blobReader.addEventListener('loadend', () => {
      console.log('finished reading');
      if (blobReader.result) {
        resolve(blobReader.result);
      }
      else {
        reject(Error('could not read file'));
      }
    });
    blobReader.readAsText(fileBlob);
  });
}

function writeFile(fileName, contents) {
  let dbx = new Dropbox({accessToken: getAccessToken()});
  return dbx.filesUpload({
    path: '/' + fileName,
    mode: {'.tag': 'overwrite'},
    contents: contents,
    mute: true,
  }).catch(e => ({error: e}));
}

function logout() {
  window.location.hash = '';
  localStorage.removeItem('accessToken');
}

module.exports = {
  loginClicked,
  isAuthenticated,
  getFileList,
  getFileContents,
  logout,
  writeFile,
};
