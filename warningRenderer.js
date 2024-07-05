










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