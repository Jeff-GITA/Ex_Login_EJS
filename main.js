
// #### Import packages #### //
const { app, BrowserWindow, ipcMain, screen, desktopCapturer, Menu } = require('electron');

const path = require('path');
const axios = require('axios');
const os = require("os");
var psList = require('ps-list');
const fs = require('fs');

const { exec } = require('child_process');


// #### URLs #### //
const API_URL = "https://5b9d91df-5241-4ae0-ab7d-6256341b374e.mock.pstmn.io"
const INFO_URL = "https://ba504831-2a9f-4e6d-90e4-42e752be7d95.mock.pstmn.io"

// #### Global variables #### //
var mainWindow;
var warningWindow;
var username, password;
var userToken;

// #### Global variables #### //
var isMoreThan2Displays;
var isRestrictedApps;
var warningInfo;
var processList = [];

// #### Timers #### //
const timerDisplayCheckingMinutes = 60 * 1000;
const timerAppsCheckingMinutes = 2 * 60 * 1000;
const timerCaptureKill = 10 * 1000

// #### Menu configuration #### //
const menuItems = [
  {
    label: "File",
    submenu: [
      {
        type: "separator",
      },
      {
        label: "Exit",
        click: () => app.quit(),
      },
    ]
  },
];
const menu = Menu.buildFromTemplate(menuItems);
Menu.setApplicationMenu(menu);

// #### Login window #### //
function createLogin() {

  const displayBounds = screen.getPrimaryDisplay().bounds;
  console.log("Display bounds:", displayBounds);
  
  const actionTimer = 100;
  var isMoving = false;
  var isResizing = false;
  var x_b, y_b, w_b, h_b;
  var isReadyToControl = false;
  var isMaxInitial = false;
  
  mainWindow = new BrowserWindow({
    // Window properties //

    width: displayBounds.width/2,
    height: displayBounds.height/2,

    x: displayBounds.x,
    y: displayBounds.y,
    //fullscreen: true,

    // kiosk: true,
    show: false,
    // resizable: false,
    // movable: false,
    // minimizable: false,
    // maximizable: true,
    // alwaysOnTop: true,
    // fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // mainWindow.webContents.openDevTools();
  mainWindow.loadFile('login.html');

  
  mainWindow.once('ready-to-show', () => {
    console.log("Ready to show...");
    // mainWindow.setFullScreen(true);
    mainWindow.show();
    // #### Configuring warning checking #### //
    const timerIntervalDisplay = setInterval(checkDisplays, timerDisplayCheckingMinutes);
    // #### Configuring warning checking #### //
    // const timerIntervalApps = setInterval(checkRestrictedApps, timerAppsCheckingMinutes);
  })
  

  mainWindow.on("hide", () => {
    console.log("Hidded...");
  });

  mainWindow.on("focus", () => {
    console.log("Focus...");

  // mainWindow.maximize();
  //mainWindow.setFullScreen(true);
   
  mainWindow.on("maximize", () => {
    
  });
  
  mainWindow.on('enter-full-screen', () => {
    console.log("enter-full-screen."); 
    console.log("full screen Bounds:", mainWindow.getBounds());
  });

  mainWindow.on('leave-full-screen', () => {
    console.log("leave-full-screen."); 
    console.log("leave-full-screen:", mainWindow.getBounds());
  });


  mainWindow.on('enter-html-full-screen', () => {
    console.log("enter-html-full-screen."); 
    console.log("html full screen Bounds:", mainWindow.getBounds());
  });
  


  mainWindow.on('minimize', () => {
    console.log("Minimized."); 
    mainWindow.setFullScreen(true);
  });
  mainWindow.on("move", () => {
   
  });

  mainWindow.on("resize", () => {
  

  });

  mainWindow.on("show", () => {
    console.log("Show...");
  });


  mainWindow.on("restore", () => {
    console.log("Show...");
  });

  

  
  mainWindow.on("blur", () => {
    console.log("Blur...");
 
  });

  // #### Matching credentials #### //
  ipcMain.on('login', (event, credentials) => {
    ({username, password} = credentials);
    console.log("Credentials:")
    console.log(username)
    console.log(password)
    getUser(event, username, password);  
  });  
};


// #### Main window #### //
function showMainWindow() {
  mainWindow.loadFile('mainWindow.html');
  console.log("send credential...")
  mainWindow.webContents.send("send-token", {userToken});
  mainWindow.webContents.openDevTools();

  // Setting timer to check apps //
  sendPCInfo();
  setTimeout(() => {
    checkRestrictedApps();
    const timerIntervalApps = setInterval(checkRestrictedApps, timerAppsCheckingMinutes);
  }, 5000);
  
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


ipcMain.on('detect_system', (event, data) => {
  
  var systemMessage = systemInformation();
  mainWindow.webContents.send("send_system_info", systemMessage);
    
});

function filterBlockedNames(objectList, blockedNames) {
  // List to store objects with blocked names
  var blockedObjects = [];
  var nameBlockedList = [];
  var nameObjects = [];
  
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
  // console.log("\nObjects:");
  // console.log(blockedObjects);
  return blockedObjects, nameBlockedList;
};

async function softwareInformation(){
  
  var processes = await psList();
  const restrictedAppsList = ['chrome', 'opera', 'firefox', 'edge'];
  // const restrictedAppsList = ["edge"];
  var blockedNamesObj, blockedNamesList = filterBlockedNames(processes, restrictedAppsList);

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

function createWarningWindow(message){

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  warningWindow = new BrowserWindow({
    // Window properties //
    // width: width,
    // height: height,
    show: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: true,
    alwaysOnTop: true,
    fullscreen:true,
    
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // contextIsolation: true,
      // // enableRemoteModule: false,
      // nodeIntegration: true,
    },
  });
  warningWindow.loadFile('warning.html');

  
  warningWindow.once('ready-to-show', () => {
    warningWindow.webContents.send("send_warning", message);
    mainWindow.setAlwaysOnTop(false);
    warningWindow.setFullScreen(true);
    warningWindow.setAlwaysOnTop(true);  
    warningWindow.show();
  });
  console.log("\nBegin warning window");
  ipcMain.on('close_warning', (event, data) => {
    // Close warning window //
    warningWindow.close();
    captureScreen(killingProcesses);
    console.log("\nTimer Ends ...");
    // setWindowProperties();
  });
  
};


async function checkWarnings(){

  // Display info //
  var displays = screen.getAllDisplays();
  isMoreThan2Displays = displays.length >= 2;

  // Restricted apps //
  var processes = await psList();
  const restrictedAppsList = ['chrome', 'opera', 'firefox', 'edge'];
  var blockedNamesObj, blockedNamesList = filterBlockedNames(processes, restrictedAppsList);

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
    mainWindow.setAlwaysOnTop(false);
    createWarningWindow();
  };
};

function setWindowProperties(){
  mainWindow.setAlwaysOnTop(true);
  mainWindow.setFullScreen(true);
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
  sendWarnings(userToken);
  console.log(`\n2 - User Token: ${userToken}\n`);
});


function captureScreen(callback){

  const displayBounds = screen.getPrimaryDisplay().bounds;
  W = displayBounds.width;
  H = displayBounds.height;
  console.log("Capturing screen...")

  desktopCapturer.getSources({ 
    types: ['screen'],
    thumbnailSize: {width:W, height:H,} 
  })
  .then((sources) => {
    if (sources.length > 0) {  
      
      const screenSource = sources[0];

      console.log("sending screenshot...")
      const sendImage = screenSource.thumbnail.toDataURL();
      const informationType = "screenshot_warning";
      const informationBody = {
        "screenshot": sendImage,
        
      };
      // Sending information  //
      sendInfo(userToken, informationType, informationBody);

      // new Promise((resolve, reject) => {
      console.log("saving screenshot...")
      const screenshotPath = path.join('screenshots_folder/screenshot.png');
      fs.writeFile(screenshotPath, screenSource.thumbnail.toPNG(), (err) => {
        if (err) {
          console.log(err);
          // reject(err);
        } else {
          // resolve(screenshotPath);
          console.log("\nScreenshot saved...");
          setTimeout(() =>{
            callback();
          }, timerCaptureKill);
          
        }
      })
      // });
    };
  })
  .catch((error) => {
    console.log("Error screenshot...")
    console.error(error); // 'Operation failed!' if success is false
  });
};



async function getUser(event, a, b) {
  try {
    // const response = await axios.get(`${API_URL}/users?username=jeff&password=0821`);
    const response = await axios.get(`${API_URL}/users`, {
      params: {
        username: a,
        password: b,
      }
    });
    // Capturing token //
    userToken = response.data.token;
    console.log(`\nUser Token: ${userToken}\n`);
    showMainWindow();
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('Invalid credentials');
    } else {
      console.log('An error occurred during login');
    }
    console.log("Wrong Password")
    event.reply('login-error', error.response.data.message);
  }
};

function checkDisplays(){
  // Display info //
  var displays = screen.getAllDisplays();
  isMoreThan2Displays = displays.length >= 2;
  console.log("\nChecking warnings:");
  console.log("isMoreThan2Displays:", isMoreThan2Displays);
  if(isMoreThan2Displays){
    console.log("\nSending displays warning");
    const informationType = "displays_warning";
    const informationBody = {
      "nDisplays": displays.length,
      "displayObjects": displays,
    };
    // Sending information  //
    sendInfo(userToken, informationType, informationBody);
  };
};

async function checkRestrictedApps(){
  // Restricted apps //
  // const restrictedAppsList = ["chrome", "opera", "firefox", "msedge"];
  const restrictedAppsList = ["chrome", "firefox", "msedge"];
  // Reading runing processes //
  var processes = await psList();

  // List to store objects with blocked names
  processList = [];
  var appNamesList = [];
  
  // Loop through each object in the object list
  processes.forEach(obj => {
    // Loop through each blocked name
    restrictedAppsList.forEach(appName => {
      // Check if the blocked name is a substring of the object's name
      if (obj.name.toLowerCase().includes(appName.toLowerCase())) {
        // Save objects //
        processList.push(obj);
        
        if (!appNamesList.includes(appName.toLowerCase())){
          appNamesList.push(appName.toLowerCase());
        };
        
      };
    });
  });

  isRestrictedApps = appNamesList.length >= 1;
  console.log("\nChecking warnings:");
  console.log("isRestrictedApps:", isRestrictedApps);
  console.log(appNamesList);
  console.log(processList);

  if(isRestrictedApps){
    console.log("\nSending apps warning");
    const informationType = "apps_warning";
    const informationBody = {
      "nApps": appNamesList.length,
      "restrictedApps": appNamesList,
      // "appObjects": processList,
    };
    // Sending information  //
    sendInfo(userToken, informationType, informationBody);
    const message = `You are using restricted apps: ${appNamesList}.`
    createWarningWindow(message);
  };
};


function sendInfo(sendToken, sendType ,sendBody){
  // sendToken = 123456789;

  console.log("\nSend information to API:");
  console.log("Token:", sendToken);
  console.log("Type of request:", sendType);
  console.log("Body:", sendBody);

  axios.post(`${INFO_URL}/information`, sendBody, {
      headers: {
        'Content-Type' : 'application/json',
      },
      params: {
        "token": sendToken,
        "type": sendType,
      },
    })
  .then(function (response) {
    console.log("\nInformation taken...");
    console.log(response.data);
  })
  .catch(function (error) {
    console.log("\nError sending information...");
    console.log(error);
  });
};

function sendPCInfo(){
  console.log("\nSending PC information");
  // console.log("\nCPU Info:")
  var cpuObject = os.cpus()[0]; 
  var cpuModel = cpuObject.model;
  var osArch = os.arch();
  var osType = os.type(); // Linux, Darwin or Window_NT
  var osPlatform = os.platform(); // 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
  var bytesAvailable = os.totalmem(); // returns number in bytes
  var bytesFree = os.freemem();
  // 1 mb = 1048576 bytes
  MB = 1048576;
  GB = 1073741824;
  var gbAvailable = (bytesAvailable/GB).toFixed(2);
  var gbFree = (bytesFree/GB).toFixed(2);
  var usagePercentage = ((gbAvailable-gbFree)/gbAvailable*100).toFixed(2);
  var networkInterfaces = Object.keys(os.networkInterfaces());

  // Preparing infor to send //
  const informationType = "pc_information";
  const informationBody = {
    "cpu_model": cpuModel,
    "os_architecture": osArch,
    "os_type": osType,
    "os_platform": osPlatform,
    "available_memory_gb": `${gbAvailable} GB`,
    "memory_usage": `${usagePercentage} %`,
    "network_interfaces": networkInterfaces,    
  };
  // Sending info //
  sendInfo(userToken, informationType, informationBody);

};

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


function killingProcesses(){
  console.log("\n\nKilling restricted processes...")
  const platform = process.platform;

  processList.forEach(appObj => {
    console.log("Kill: ", appObj.name, " PID: ", appObj.pid);
    // killP(appObj.pid);
    if (platform === 'win32') {
      exec(`taskkill /PID ${appObj.pid} /F`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error killing process: ${error.message}`);
          return;
        }
        console.log(`Process killed: ${stdout}`);
      });
    } else {
      exec(`kill -9 ${appObj.pid}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error killing process: ${error.message}`);
          return;
        }
        console.log(`Process killed: ${stdout}`);
      });
    };
  });
};

// function killP(pid) {

//   if (platform === 'win32') {
//     exec(`taskkill /PID ${pid} /F`, (error, stdout, stderr) => {
//       if (error) {
//         console.error(`Error killing process: ${error.message}`);
//         return;
//       }
//       console.log(`Process killed: ${stdout}`);
//     });
//   } else {
//     exec(`kill -9 ${pid}`, (error, stdout, stderr) => {
//       if (error) {
//         console.error(`Error killing process: ${error.message}`);
//         return;
//       }
//       console.log(`Process killed: ${stdout}`);
//     });
//   }
// }

