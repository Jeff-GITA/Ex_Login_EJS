const { app, BrowserWindow, ipcMain, net, ipcRenderer } = require('electron');
const path = require('path');
const axios = require('axios');

// const API_URL = "https://jsonplaceholder.typicode.com/users"
const API_URL = "https://5b9d91df-5241-4ae0-ab7d-6256341b374e.mock.pstmn.io"

let mainWindow;
let loginWindow;
let username, password;



async function getUser(event, a, b) {
  try {
    // const response = await axios.get(`${API_URL}/users?username=jeff&password=0821`);
    const response = await axios.get(`${API_URL}/users`, {
      params: {
        username: a,
        password: b,
      }
    });
    console.log(response.data);
    createMainWindow();
    loginWindow.close();

  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('Invalid credentials');
    } else {
      console.log('An error occurred during login');
    }
    console.log("Wrong Password")
    event.reply('login-error', error.response.data.message);
  }
}

function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      // nodeIntegration: true,
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

 
  console.log("send credential...")
  mainWindow.webContents.send("send-credentials", {username, password});
  
  mainWindow.webContents.openDevTools();
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
  ({username, password} = credentials);
  console.log("Credentials:")
  console.log(username)
  console.log(password)
  // console.log("Credentials: ",username, password)

  getUser(event, username, password)
    
});



