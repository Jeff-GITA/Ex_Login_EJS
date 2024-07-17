
window.electronAPI.sendWarningInfo((event, message) => {

    document.getElementById('warning_message').textContent = message;
  
});

let counter = 10;

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


