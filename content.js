chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'youtubeSearch') {
    const searchInput = document.querySelector('input[name="search_query"]');
    const searchButton = document.querySelector('button[aria-label="Search"]');

    if (searchInput && searchButton) {
      searchInput.focus();
      searchInput.value = request.query;
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchButton.click();
    } else {
      if (!searchInput) console.log('Could not find search input');
      if (!searchButton) console.log('Could not find search button');
    }
  }
});

// Create floating button
const widgetContainer = document.createElement('div');
widgetContainer.id = 'chat-widget-container';
document.body.appendChild(widgetContainer);
const widgetButton = document.createElement('div');
widgetButton.id = 'chat-widget-button';
widgetButton.innerText = '💬';
widgetContainer.appendChild(widgetButton);

// Create chat box (hidden by default)
const chatBox = document.createElement('div');
chatBox.id = 'chat-widget-box';
chatBox.innerHTML = `
  <div>
    <div>AI Chatbot</div>
    <input type="text" id="chat-widget-input" placeholder="Type a command"/>
    <button id="chat-widget-send">Send</button>
    <div id="chat-widget-response"></div>
  </div>
`;
document.body.appendChild(chatBox);

// Initially set the chatbox to 'block'
window.addEventListener('load', () => {
  chatBox.style.display = 'block';
  const input = document.getElementById("chat-widget-input");
});

// Toggle chat box on button click
widgetButton.addEventListener('click', () => {
  if (chatBox.style.display === 'none') {
    // Show the chatbox with slide-in animation
    chatBox.style.display = 'block';
    chatBox.style.animation = 'slideFromButton 0.3s ease-out forwards';
    document.getElementById("chat-widget-input").focus();
  } else {
    // Hide the chatbox with slide-out animation
    chatBox.style.animation = 'slideToButton 0.3s ease-out forwards';
    setTimeout(() => {
      chatBox.style.display = 'none';
    }, 600);  // Match the animation duration
  }
});

// Handle send button
document.getElementById('chat-widget-send').addEventListener('click', () => {
  const input = document.getElementById('chat-widget-input');
  const responseDiv = document.getElementById('chat-widget-response');
  const userCommand = input.value.trim();

  if (!userCommand) return;

  // Send command to background to handle fetch
  chrome.runtime.sendMessage(
    { action: 'parseCommand', text: userCommand },
    (response) => {
      if (!response || !response.success) {
        console.error('Error:', response ? response.error : 'No response');
        responseDiv.innerText = "Something went wrong.";
        return;
      }

      const data = response.data;
      const intent = data.intent ? data.intent.name : null;
      const confidence = data.intent ? data.intent.confidence : 0;
      const queryEntity = data.entities.find(e => e.entity === 'search_query');
      const query = queryEntity ? queryEntity.value : null;

      if (intent === 'search_youtube' && confidence > 0.7 && query) {
        const command = `search ${query} on youtube`;
        chrome.runtime.sendMessage({ action: 'processCommand', command });
        responseDiv.innerText = `Searching YouTube for: ${query}`;
      } else if (intent === 'search_google' && confidence > 0.7 && query) {
        const command = `search ${query} on google`;
        chrome.runtime.sendMessage({ action: 'processCommand', command });
        responseDiv.innerText = `Searching Google for: ${query}`;
      } else if (intent === 'navigate_back') {
        chrome.runtime.sendMessage({ action: 'processCommand', command: 'go back' });
        responseDiv.innerText = `Going back...`;
      } else if (intent === 'navigate_forward') {
        chrome.runtime.sendMessage({ action: 'processCommand', command: 'go forward' });
        responseDiv.innerText = `Going forward...`;
      } else if (intent === 'refresh_page') {
        chrome.runtime.sendMessage({ action: 'processCommand', command: 'refresh page' });
        responseDiv.innerText = `Refreshing page...`;
      } else {
        responseDiv.innerText = "Sorry, I didn't understand that.";
      }

      input.value = '';
    }
  );
});

// Allow Enter key to submit
document.getElementById('chat-widget-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    document.getElementById('chat-widget-send').click();
  }
});