
console.log('Main application window loaded');
// This listener is waiting the credential from main window //
window.electronAPI.sendCredentials((event, data) => {
    const {username, password} = data;
    console.log("Main window:")
    console.log("Credentials: ",username, password);
  });


  //############################################################################################// 
 //                                   Display information                                      //  
//############################################################################################// 

// This is the click event for the button to capture display information //
document.getElementById('detect_displays_button').addEventListener('click', detectDisplays);
// Function which execute when the display button is pressed //
function detectDisplays(){
  // IPC render to main for display information //
  window.electronAPI.detectDisplays({});
};
// Listener in the render waiting for display information //
window.electronAPI.sendDisplayInfo((event, displaysObject) => {
  // let displaysObject = data;
  console.log("Displsys information:")
  console.log("Number of displays: ",displaysObject.length);
  console.log("Displays information: ",displaysObject);

  document.getElementById('show_displays').textContent = `Number of available displays: ${displaysObject.length}`;

});


  //############################################################################################// 
 //                                    System information                                      //  
//############################################################################################// 

// Click event to capture system information //
document.getElementById('detect_system_button').addEventListener('click', detectSystem);
// Function executed when the system button is pressed //
function detectSystem(){
  // IPC render to main for system information //
  window.electronAPI.detectSystem({});
};
// Listener waiting for system information //
window.electronAPI.sendSystemInfo((event, systemMessage) => {
  showMessage = systemMessage.replace(/\n/g, '<br>');
  console.log(systemMessage)

  // document.getElementById('show_system').textContent = systemMessage;
  const outputDiv = document.getElementById('show_system');
  outputDiv.innerHTML = showMessage;

});


  //############################################################################################// 
 //                                 Applications information                                   //  
//############################################################################################// 

// Click event to capture apps information //
document.getElementById('detect_apps_button').addEventListener('click', detectApps);
// Function executed when the app button is pressed //
function detectApps(){
  // IPC render to main for apps information //
  const message = "Detect aps"
  window.electronAPI.detectApps(message);
};
// Listener waiting for apps information //
window.electronAPI.sendAppsInfo((event, data) => {
  console.log("[Render]:")
  console.log(data)
});

  //############################################################################################// 
 //                                         Warnings                                           //  
//############################################################################################// 

// Click event to capture apps information //
document.getElementById('warning_button').addEventListener('click', checkWarnings);
// Function executed when the app button is pressed //
function checkWarnings(){
  // IPC render to main for apps information //
  const message = "Detect warnings"
  window.electronAPI.checkWarnings(message);
  
};

