
window.electronAPI.sendWarningInfo((event, data) => {


    if(data.displays >= 2){
        
        displayMessage = `Number displays used: ${data.displays}. Please use just ONE. `;
        document.getElementById('warning_display_message').textContent = displayMessage;
    }

    if(data.apps.length >= 1){
        
        appMessage = `Restricted apps used: ${data.apps}. Please close them.`;
        document.getElementById('warning_app_message').textContent = appMessage;
    };

  
});


let counter = 6;
const timerElement = document.getElementById('timer_message');

function updateTimer() {
  counter--;
  timerMessage = `This window will be close in ${counter} seconds`
  timerElement.textContent = timerMessage;

  if (counter == 0) {
    clearInterval(timerInterval);
    window.electronAPI.closeWarning("close");    
  }
};
const timerInterval = setInterval(updateTimer, 1000); // Update every second



