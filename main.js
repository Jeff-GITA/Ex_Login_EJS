const { app, BrowserWindow, ipcMain, net } = require('electron');
const path = require('path');
const axios = require('axios');

const API_URL = "https://jsonplaceholder.typicode.com/users"

let mainWindow;
let loginWindow;

function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // contextIsolation: true,
      // enableRemoteModule: false,
      // nodeIntegration: false,
    },
  });

  loginWindow.loadFile('login.html');
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('mainWindow.html');
}

app.whenReady().then(() => {
  createLoginWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createLoginWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('login', (event, credentials) => {
  const { username, password } = credentials;
  console.log("Credentials: ",username, password)

  axios.get(API_URL).then(function (response) {
    
    const users = response.data;
    console.log("Users typeof:", typeof users)
    // Mock check: find the user by username
    const user = users.find(user => user.username === username);
    if(user === undefined){
        console.log("Wrong Username")
        event.reply('login-error', 'Invalid Username');

    } else if(user.id === parseInt(password)){
        console.log("Correct credentials")
        createMainWindow();
        // loginWindow.webContents.send("send-credentials", { username, password })
        loginWindow.close();
    } else{
        console.log("Wrong Password")
        event.reply('login-error', 'Invalid Password');
    }

  })
  .catch(function (error) {
    console.log(error);
  })
  .finally(function () {
    // always executed
  });  

});
