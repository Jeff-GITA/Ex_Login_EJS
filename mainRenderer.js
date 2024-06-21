// This file can contain the logic for the main application window
console.log('Main application window loaded');

window.electronAPI.sendCredentials((event, data) => {
    const {username, password} = data;
    console.log("Credentials: ",username, password);
  });