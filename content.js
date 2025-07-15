// Create floating button
const widgetButton = document.createElement('div');
widgetButton.id = 'chat-widget-button';
widgetButton.innerText = '💬';
Object.assign(widgetButton.style, {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  width: '60px',
  height: '60px',
  background: '#007bff',
  color: '#fff',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  zIndex: '9999',
  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  fontSize: '30px'
});
document.body.appendChild(widgetButton);

// Create chat box (hidden by default)
const chatBox = document.createElement('div');
chatBox.id = 'chat-widget-box';
chatBox.innerHTML = `
  <div style="background:#fff; padding:10px; width:250px; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.3);">
    <div style="margin-bottom:5px; font-weight:bold;">AI Chatbot</div>
    <input type="text" id="chat-widget-input" placeholder="Type a command" style="width:100%; padding:5px; margin-bottom:5px;"/>
    <button id="chat-widget-send" style="width:100%; padding:5px;">Send</button>
    <div id="chat-widget-response" style="margin-top:5px; font-size:0.85em;"></div>
  </div>
`;
Object.assign(chatBox.style, {
  position: 'fixed',
  bottom: '90px',
  right: '20px',
  display: 'none',
  zIndex: '9999'
});
document.body.appendChild(chatBox);

// Toggle chat box on button click
widgetButton.addEventListener('click', () => {
  chatBox.style.display = chatBox.style.display === 'none' ? 'block' : 'none';
});

// Handle send button
document.getElementById('chat-widget-send').addEventListener('click', () => {
  const input = document.getElementById('chat-widget-input');
  const responseDiv = document.getElementById('chat-widget-response');
  const userCommand = input.value.trim();

  if (!userCommand) return;

  fetch('http://localhost:5005/model/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: userCommand })
  })
  .then(response => response.json())
  .then(data => {
    const intent = data.intent ? data.intent.name : null;
    const confidence = data.intent ? data.intent.confidence : 0;
    const queryEntity = data.entities.find(e => e.entity === 'search_query');
    const query = queryEntity ? queryEntity.value : null;

    if (intent === 'search_youtube' && confidence > 0.7 && query) {
      const command = `search ${query} on youtube`;
      chrome.runtime.sendMessage({ action: 'processCommand', command });
      responseDiv.innerText = `Processing: ${query}`;
    } else if (intent === 'search_youtube' && confidence > 0.7) {
      const command = `search ${data.text} on youtube`;
      chrome.runtime.sendMessage({ action: 'processCommand', command });
      responseDiv.innerText = `Processing: ${data.text}`;
    } else {
      responseDiv.innerText = "Sorry, I didn't understand that.";
    }

    input.value = '';
  })
  .catch(error => {
    console.error('Error:', error);
    responseDiv.innerText = "Something went wrong.";
  });
});

// Allow Enter key to submit
document.getElementById('chat-widget-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    document.getElementById('chat-widget-send').click();
  }
});
