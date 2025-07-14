document.addEventListener('DOMContentLoaded', () => {
  const commandInput = document.getElementById('command');
  const sendButton = document.getElementById('send');

  // Auto-focus on input when popup opens
  commandInput.focus();

  // Listen for the Send button click
  sendButton.addEventListener('click', () => {
    const userCommand = commandInput.value.trim();
    console.log(userCommand);

    // Send the user input to the Python server (Flask backend)
    fetch('http://localhost:5000/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: userCommand })
    })
    .then(response => response.json())
    .then(data => {
      if (data.command) {
        const command = data.command;
        console.log('Processed command:', command);
        chrome.runtime.sendMessage({ action: 'processCommand', command: command });
        document.getElementById('response').innerText = "Processing...";
        commandInput.value = '';
      } else {
        console.error('Backend error:', data.error);
        document.getElementById('response').innerText = "Error: " + (data.error || 'Unknown error');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('response').innerText = "Something went wrong.";
    });
  });

  // Allow pressing Enter to submit the command (no new lines)
  commandInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();  // Prevent adding a new line
      sendButton.click();  // Trigger the Send button click
    }
  });
});
