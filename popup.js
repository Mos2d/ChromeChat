document.addEventListener('DOMContentLoaded', () => {
  const commandInput = document.getElementById('command');
  const sendButton = document.getElementById('send');
  const responseDiv = document.getElementById('response');

  commandInput.focus();

  sendButton.addEventListener('click', () => {
    const userCommand = commandInput.value.trim();

    fetch('http://localhost:5005/model/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: userCommand })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Rasa response:', data);

      const intent = data.intent ? data.intent.name : null;
      const confidence = data.intent ? data.intent.confidence : 0;

      // Find search_query entity if present
      const queryEntity = data.entities.find(e => e.entity === 'search_query');
      const query = queryEntity ? queryEntity.value : null;

      if (intent === 'search_youtube' && confidence > 0.7 && query) {
        const command = `search ${query} on youtube`;
        chrome.runtime.sendMessage({ action: 'processCommand', command: command });
        responseDiv.innerText = `Processing: ${query}`;
      } else if (intent === 'search_youtube' && confidence > 0.7) {
        // fallback: no entity found, use full text
        const command = `search ${data.text} on youtube`;
        chrome.runtime.sendMessage({ action: 'processCommand', command: command });
        responseDiv.innerText = `Processing: ${data.text}`;
      } else {
        responseDiv.innerText = "Sorry, I didn't understand that.";
      }

      commandInput.value = '';
    })
    .catch(error => {
      console.error('Error:', error);
      responseDiv.innerText = "Something went wrong.";
    });
  });

  // Allow Enter key to submit (no newline)
  commandInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendButton.click();
    }
  });
});
