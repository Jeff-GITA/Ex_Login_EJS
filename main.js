const { app, BrowserWindow, ipcMain, net, ipcRenderer, screen } = require('electron');
const path = require('path');
const axios = require('axios');
const os = require("os");
let psList = require('ps-list');
// let ps = require('ps-node');
// import psList from 'ps-list';


// const API_URL = "https://jsonplaceholder.typicode.com/users"
const API_URL = "https://5b9d91df-5241-4ae0-ab7d-6256341b374e.mock.pstmn.io"

let mainWindow;
// let loginWindow;
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
    showMainWindow();
    // loginWindow.close();

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

function createLogin() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });
  mainWindow.webContents.openDevTools();
  mainWindow.loadFile('login.html');
  // displayInformation();
  // systemInformation();
  softwareInformation();
}

function showMainWindow() {
  // mainWindow = new BrowserWindow({
  //   width: 800,
  //   height: 600,
  //   webPreferences: {
  //     preload: path.join(__dirname, 'preload.js'),
  //     contextIsolation: true,
  //     enableRemoteModule: false,
  //     nodeIntegration: false,
  //   },
  // });

  mainWindow.loadFile('mainWindow.html');

  console.log("send credential...")
  mainWindow.webContents.send("send-credentials", {username, password});
  mainWindow.webContents.openDevTools();



};

app.whenReady().then(() => {
  createLogin();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createLogin();
      
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



function displayInformation(){
  // Retrieve information about all monitors.
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize
  console.log("Display information:")
  console.log(displays);
  console.log(`width:${width}, height:${height}`)
  console.log("Number of displays: ",displays.length);
  return displays
};

ipcMain.on('detect_displays', (event, data) => {
  
  let displaysObject = displayInformation();
  console.log("Number of displays: ",displaysObject.length);
  console.log("Displays information: ",displaysObject);
  mainWindow.webContents.send("send_displays_info", displaysObject);
    
});


function systemInformation(){
  // Retrieve information about system.
  // console.log("\nnetworkInterfaces:")
  var networkInterfaces = Object.keys(os.networkInterfaces());
  // console.log(networkInterfaces);
  
  // console.log("\nCPU Info:")
  var cpuObject = os.cpus()[0]; 
  var cpuModel = cpuObject.model;
  var cpuSpeed = cpuObject.speed;

  // console.log("Model: ",cpuModel);
  // console.log("Speed: ",cpuSpeed);

  // console.log("\nArchitecture Info:")
  var osArch = os.arch();
  // console.log(osArch);

  var bytesAvailable = os.totalmem(); // returns number in bytes
  var bytesFree = os.freemem();
  // 1 mb = 1048576 bytes
  MB = 1048576;
  GB = 1073741824;
  // console.log("\nTotal memory [MB] :" + (bytesAvailable/MB) );
  // console.log("Total memory [GB] :" + (bytesAvailable/GB) );
  // console.log("\nTotal memory available MB :" + (bytesFree/MB) );
  // console.log("Total memory available GB :" + (bytesFree/GB) );
  var gbAvailable = (bytesAvailable/GB).toFixed(2);
  var gbFree = (bytesFree/GB).toFixed(2);
  var usagePercentage = ((gbAvailable-gbFree)/gbAvailable*100).toFixed(2)


  var osType = os.type(); // Linux, Darwin or Window_NT
  var osPlatform = os.platform(); // 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'

  // console.log(`\nYour OS type is ${osType}, using the platform ${osPlatform}\n\n`);

  message = `
  Operative system and hardware information:\n
  Operative system: 
  OS: ${osType}, Architecture: ${osArch}, Platform: ${osPlatform}\n
  CPU:
  Model: ${cpuModel}, Speed: ${cpuSpeed}\n
  RAM Memory:
  Total memory: ${gbAvailable} GB, Free memory: ${gbFree} GB, Usage: ${usagePercentage} %\n 
  Network interfaces: 
  ${networkInterfaces}
  `;

  console.log("\n\n\n");
  console.log(message);
  console.log("\n\n\n");

  return message;

};

ipcMain.on('detect_system', (event, data) => {
  
  var systemMessage = systemInformation();
  mainWindow.webContents.send("send_system_info", systemMessage);
    
});


function filterBlockedNames(objectList, blockedNames) {
  // List to store objects with blocked names
  const blockedObjects = [];
  const nameBlockedList = [];
  
  // Loop through each object in the object list
  objectList.forEach(obj => {
    // Loop through each blocked name
    blockedNames.forEach(blockedName => {
      // Check if the blocked name is a substring of the object's name
      if (obj.name.toLowerCase().includes(blockedName.toLowerCase())) {
        // Save objects //
        blockedObjects.push(obj);
        
        if (!nameBlockedList.includes(blockedName.toLowerCase())){
          nameBlockedList.push(blockedName.toLowerCase());
        };
        
      };
    });
  });


  return blockedObjects, nameBlockedList;
};


async function softwareInformation(){
  

    let processes = await psList();
    const browserNames = ['chrome', 'opera', 'firefox', 'edge'];
    let blockedNamesObj, blockedNamesList = filterBlockedNames(processes, browserNames);

    console.log("\n\n\n");
    console.log("Browser Apps:");
    console.log(blockedNamesList);
    console.log("\n\n\n");

};

