const { app, BrowserWindow, ipcMain, screen, desktopCapturer } = require('electron');
const path = require('path');
const axios = require('axios');
const os = require("os");
var psList = require('ps-list');
const fs = require('fs');
;


// const API_URL = "https://jsonplaceholder.typicode.com/users"
const API_URL = "https://5b9d91df-5241-4ae0-ab7d-6256341b374e.mock.pstmn.io"
const INFO_URL = "https://ba504831-2a9f-4e6d-90e4-42e752be7d95.mock.pstmn.io"

var mainWindow;
var warningWindow;
// let loginWindow;
var username, password;
var token;

// Warning variables //
var isMoreThan2Displays;
var isRestrictedApps;
var warningInfo;

async function getUser(event, a, b) {
  try {
    // const response = await axios.get(`${API_URL}/users?username=jeff&password=0821`);
    const response = await axios.get(`${API_URL}/users`, {
      params: {
        username: a,
        password: b,
      }
    });
    token = response.data.token;
    console.log(`\nUser Token: ${token}\n`);
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
  
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const displayBounds = screen.getPrimaryDisplay().bounds;
  const workArea = screen.getPrimaryDisplay().workArea;

  // const { width, height } = screen.getPrimaryDisplay().size;
  console.log(`\nDisplay workAreaSize: W:${width}, H:${height}\n`);
  console.log("Display bounds:", displayBounds);
  console.log("Display workArea:", workArea);

  const actionTimer = 100;
  var isMoving = false;
  var isResizing = false;
  var x_b, y_b, w_b, h_b;
  var isReadyToControl = false;
  var isMaxInitial = false;
  
  mainWindow = new BrowserWindow({
    // Window properties //
    width: displayBounds.width,
    height: displayBounds.height,
    // kiosk: true,
    show: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: true,
    alwaysOnTop: true,
    // fullscreenable: true,
    
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // contextIsolation: true,
      // // enableRemoteModule: false,
      // nodeIntegration: true,
    },
  });
  // mainWindow.webContents.openDevTools();
  mainWindow.loadFile('login.html');

  mainWindow.once('ready-to-show', () => {
    console.log("Ready to show...")
    mainWindow.maximize();
    mainWindow.show()
  })
  

  mainWindow.on("hide", () => {
    console.log("Hidded...");
  });

  mainWindow.on("focus", () => {
    console.log("Focus...");
  });

  mainWindow.on("show", () => {
    console.log("Show...");
  });

  mainWindow.on("restore", () => {
    console.log("Show...");
  });

  mainWindow.on("enter-full-screen", () => {
    console.log("enter-full-screen...");
  });
  
  mainWindow.on("blur", () => {
    console.log("Blur...");
    
    console.log("1 - Win is focused: ", mainWindow.isFocused());
    mainWindow.focus();  
    mainWindow.moveTop();
    console.log("2 - Win is focused: ", mainWindow.isFocused());
  });

};//create


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
    // Envio del log de cierre //
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
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  console.log("Display information:");
  console.log(displays);
  console.log(`width:${width}, height:${height}`);
  console.log("Number of displays: ",displays.length);

  return displays;
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
  var blockedObjects = [];
  var nameBlockedList = [];
  
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
  

  var processes = await psList();
  const browserNames = ['chrome', 'opera', 'firefox', 'edge'];
  var blockedNamesObj, blockedNamesList = filterBlockedNames(processes, browserNames);

  console.log("\n");
  console.log("Browser Apps:");
  console.log(blockedNamesList);
  console.log("\n");
  mainWindow.webContents.send("send_apps_info", blockedNamesList);

};

ipcMain.on('detect_apps', (event, data) => {
  console.log("[Main]:")
  console.log(data);
  softwareInformation();
});

function createWarningWindow(){

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  warningWindow = new BrowserWindow({
    // Window properties //
    width: width,
    height: height,
    show: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: true,
    alwaysOnTop: true,
    
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // contextIsolation: true,
      // // enableRemoteModule: false,
      // nodeIntegration: true,
    },
  });
  warningWindow.loadFile('warning.html');
  warningWindow.webContents.send("send_warning", warningInfo);

  warningWindow.once('ready-to-show', () => {
    warningWindow.maximize();
    warningWindow.show();
  })
  
  // configure time out //
  console.log("\nTimer begin ...");

  ipcMain.on('close_warning', (event, data) => {
    // Close warning window //
    warningWindow.close();
    captureScreen()//.then().catch();
    console.log("\nTimer Ends ...");
    setWindowProperties();
  });

};

async function checkWarnings(){

  // Display info //
  var displays = screen.getAllDisplays();
  isMoreThan2Displays = displays.length >= 2;

  // Restricted apps //
  var processes = await psList();
  const browserNames = ['chrome', 'opera', 'firefox', 'edge'];
  var blockedNamesObj, blockedNamesList = filterBlockedNames(processes, browserNames);

  isRestrictedApps = blockedNamesList.length >= 1;

  console.log("\nChecking warnings:");
  console.log("isMoreThan2Displays:", isMoreThan2Displays);
  console.log("isRestrictedApps:", isRestrictedApps);

  warningInfo = {
    "displays": displays.length,
    "apps": blockedNamesList,
  };

  if(isMoreThan2Displays || isRestrictedApps){
    console.log("\nWarning!!\n");
    mainWindow.setAlwaysOnTop(false)
    createWarningWindow();
  };
};

function setWindowProperties(){
  mainWindow.setAlwaysOnTop(true);
  mainWindow.minimizable = false;
  mainWindow.resizable = false;
  mainWindow.movable = false;
  mainWindow.maximizable = true;
};

function sendWarnings(sendToken){
  console.log("\n Send warning to API:");
  // sendToken = 123456789;
  axios.post(`${INFO_URL}/information`, warningInfo, {
      headers: {
        'Content-Type' : 'application/json',
      },
      params: {
        token: sendToken,
        "type": "waring",
      },
    })
  .then(function (response) {
    console.log("\n Sending warning information using axios:");
    console.log(response.data);
  })
  .catch(function (error) {
    console.log(error);
  });
};

ipcMain.on('check_warnings', (event, data) => {
  console.log("[Main]:")
  console.log(data);
  checkWarnings();
  sendWarnings(token);
  console.log(`\n2 - User Token: ${token}\n`);
});


function captureScreen(){
  const displayBounds = screen.getPrimaryDisplay().bounds;
  W = displayBounds.width;
  H = displayBounds.height;
  console.log("Capturing screen...")
  const sources = desktopCapturer.getSources({ 
    types: ['screen'],
    thumbnailSize: {width:W, height:H,} 
  })
  .then((sources) => {
    if (sources.length > 0) {
      console.log("saving screenshot...")
      const screenSource = sources[0];
      new Promise((resolve, reject) => {
        const screenshotPath = path.join('screenshot.png');
        fs.writeFile(screenshotPath, screenSource.thumbnail.toPNG(), (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(screenshotPath);
          }
        })
      })
    }
  })
  .catch((error) => {
    console.log("Error screenshot...")
    console.error(error); // 'Operation failed!' if success is false
  });
};


// async function captureScreen(){
//   const displayBounds = screen.getPrimaryDisplay().bounds;
//   W = displayBounds.width;
//   H = displayBounds.height;
//   console.log("Capturing screen...")
//   const sources = await desktopCapturer.getSources({ 
//     types: ['screen'],
//     thumbnailSize: {width:W, height:H,} 
//   });
  
//   if (sources.length > 0) {
//     const screenSource = sources[0];
    
//     return new Promise((resolve, reject) => {
//       const screenshotPath = path.join('screenshot.png');
//       fs.writeFile(screenshotPath, screenSource.thumbnail.toPNG(), (err) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(screenshotPath);
//         }
//       });
//     });
//   }
// };