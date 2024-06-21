// preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
login: (credentials) => ipcRenderer.send('login', credentials),
onLoginError: (callback) => ipcRenderer.on('login-error', callback),
sendCredentials: (callback) => ipcRenderer.on('send-credentials', callback),
});



