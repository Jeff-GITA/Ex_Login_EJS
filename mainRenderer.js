
// import psList from 'ps-list';

// This file can contain the logic for the main application window
console.log('Main application window loaded');
window.electronAPI.sendCredentials((event, data) => {
    const {username, password} = data;
    console.log("Main window:")
    console.log("Credentials: ",username, password);
  });


// Capturing displays information //
function detectDisplays(){
  window.electronAPI.detectDisplays({});
};
document.getElementById('detect_displays_button').addEventListener('click', detectDisplays);

window.electronAPI.sendDisplayInfo((event, displaysObject) => {
  // let displaysObject = data;
  console.log("Displsys information:")
  console.log("Number of displays: ",displaysObject.length);
  console.log("Displays information: ",displaysObject);

  document.getElementById('show_displays').textContent = `Number of available displays: ${displaysObject.length}`;

});

// Capturing System information //
function detectSystem(){
  window.electronAPI.detectSystem({});
};
document.getElementById('detect_system_button').addEventListener('click', detectSystem);

window.electronAPI.sendSystemInfo((event, systemMessage) => {
  showMessage = systemMessage.replace(/\n/g, '<br>');
  console.log(systemMessage)

  // document.getElementById('show_system').textContent = systemMessage;
  const outputDiv = document.getElementById('show_system');
  outputDiv.innerHTML = showMessage;

});


