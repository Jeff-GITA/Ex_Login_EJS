


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



const capture = async () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const video = document.createElement("video");
  
    try {
      const captureStream = await navigator.mediaDevices.getDisplayMedia();
      video.srcObject = captureStream;
      context.drawImage(video, 0, 0, window.width, window.height);
      const frame = canvas.toDataURL("image/png");
      captureStream.getTracks().forEach(track => track.stop());
    //   window.electronAPI.closeWarning(frame);
    //   window.location.href = frame;
    } catch (err) {
      console.error("Error: ", err);
    }
  };
  
  

