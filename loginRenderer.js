
document.getElementById('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    console.log("User:", username)
    console.log("Pass:", password)
        
    
    window.electronAPI.login({ username, password });
  });
  

window.electronAPI.onLoginError((event, message) => {
  document.getElementById('error').textContent = message;
});
  