// preload.js

const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('electronAPI', {

// Render to Main //
login: (credentials) => ipcRenderer.send('login', credentials),
detectDisplays: (data) => ipcRenderer.send('detect_displays', data),
detectSystem: (data) => ipcRenderer.send('detect_system', data),


// Main to Render //
onLoginError: (callback) => ipcRenderer.on('login-error', callback),
sendCredentials: (callback) => ipcRenderer.on('send-credentials', callback),
sendDisplayInfo: (callback) => ipcRenderer.on('send_displays_info', callback),
sendSystemInfo: (callback) => ipcRenderer.on('send_system_info', callback),

});







