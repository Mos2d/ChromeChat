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

// Create the chat button and box
const widgetContainer = document.createElement('div');
widgetContainer.id = 'chat-widget-container';
document.body.appendChild(widgetContainer);
const widgetButton = document.createElement('div');
widgetButton.id = 'chat-widget-button';
widgetButton.innerText = '💬';
widgetContainer.appendChild(widgetButton);

// Create the chatbox (hidden by default)
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
  chatBox.style.display = 'none';
  const input = document.getElementById("chat-widget-input");
});

// Toggle chat box on button click (only if it's not dragging)
widgetButton.addEventListener('click', (event) => {
  
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

let clicked = false;
let move = false;
let offsetX = 0;
let offsetY = 0;
let initialX = 0;
let initialY = 0;
const moveThreshold = 10;

// Default padding for button from edges
const padding = 20;

document.addEventListener('mousedown', event => {
  const isClickOnButton = widgetButton.contains(event.target);
    
  // Close chatbox when clicking outside of chatbox or chat button
  if (isClickOnButton) {
    clicked = true; 

    initialX = event.clientX;
    initialY = event.clientY;

    // Get the current position of the button relative to the page
    const rect = widgetButton.getBoundingClientRect();
    offsetX = initialX - rect.left;
    offsetY = initialY - rect.top;

    // Remove transition during drag (no delay while dragging)
    widgetButton.style.transition = 'none';

    event.preventDefault(); // Prevent text selection or other default behaviors during drag
  }
});

document.addEventListener('mousemove', event => { 
  if (clicked) {
    const deltaX = Math.abs(event.clientX - initialX);
    const deltaY = Math.abs(event.clientY - initialY);
    
    // Check if the mouse moved more than the threshold
    if (deltaX > moveThreshold || deltaY > moveThreshold) {
      move = true; // Only set move to true if the movement exceeds the threshold

      let x = event.clientX - offsetX;
      let y = event.clientY - offsetY;

      // Prevent button from going outside the screen borders
      const maxX = window.innerWidth - widgetButton.offsetWidth - padding;
      const maxY = window.innerHeight - widgetButton.offsetHeight - padding;

      x = Math.min(Math.max(x, padding), maxX);  // Limit x to stay within screen bounds
      y = Math.min(Math.max(y, padding), maxY);  // Limit y to stay within screen bounds

      // Update the button's position immediately while dragging
      widgetButton.style.left = `${x}px`;
      widgetButton.style.top = `${y}px`;
    }
  }
});

document.addEventListener('mouseup', event => { 
  // If user was dragging the button
  if (clicked && move) {
    const buttonRect = widgetButton.getBoundingClientRect();
    const screenWidth = window.innerWidth;

    // Snap to the left or right edge based on proximity
    const snapToLeft = buttonRect.left < screenWidth / 2;
    const closestX = snapToLeft ? padding : screenWidth - widgetButton.offsetWidth - padding;

    // Keep the vertical position the same
    const currentY = buttonRect.top;

    // Apply transition for smooth snapping (only during snapping)
    widgetButton.style.transition = 'left 0.3s ease-out, top 0.3s ease-out'; // Smooth transition

    // Set the final position for the button
    widgetButton.style.left = `${closestX}px`;
    widgetButton.style.top = `${Math.min(Math.max(currentY, padding), window.innerHeight - widgetButton.offsetHeight - padding)}px`;

    // Check if the button is on the left or right edge
    if (buttonRect.left <= padding || buttonRect.left + widgetButton.offsetWidth >= window.innerWidth - padding) {
      moveChatboxToNewPosition();
    }

    // Wait for the button to finish its transition
    widgetButton.addEventListener('transitionend', moveChatboxToNewPosition, { once: true });
  } else {
    const isClickInsideChatBox = chatBox.contains(event.target);
    const isClickOnButton = widgetButton.contains(event.target);
    
    // Close chatbox when clicking outside of chatbox or chat button
    if (!isClickInsideChatBox && !isClickOnButton && chatBox.style.display === 'block') {
      chatBox.style.animation = 'slideToButton 0.3s ease-out forwards';
      setTimeout(() => {
        chatBox.style.display = 'none';
      }, 400);
    }
    
    // Handle button click to toggle chatbox visibility
    if (isClickOnButton) {
      if (chatBox.style.display === 'none') {
        // Get the position of the button
        const buttonRect = widgetButton.getBoundingClientRect();
        const buttonHeight = widgetButton.offsetHeight;
        chatBox.style.opacity = '0';
        chatBox.style.display = 'block';
        const chatboxWidth = chatBox.offsetWidth;
        const chatboxHeight = chatBox.offsetHeight;
        chatBox.style.opacity = '1';
        chatBox.style.display = 'none';

        let chatboxLeft, chatboxTop;

        if (buttonRect.left + buttonRect.width / 2 > window.innerWidth / 2) {
          chatboxLeft = buttonRect.left - chatboxWidth - 15; // Position to the left of the button
        } else {
          chatboxLeft = buttonRect.left + buttonRect.width + 15; // Position to the right of the button
        }

        chatboxTop = buttonRect.top + buttonHeight / 2 - chatboxHeight / 2;

        if (chatboxTop + chatboxHeight > window.innerHeight) {
          chatboxTop = buttonRect.top - chatboxHeight / 2 - 10;
        }

        chatBox.style.left = `${Math.min(Math.max(chatboxLeft, 0), window.innerWidth - chatboxWidth)}px`;
        chatBox.style.top = `${Math.min(Math.max(chatboxTop, 30), window.innerHeight - chatboxHeight - 30)}px`;

        chatBox.style.display = 'block';
        chatBox.style.animation = 'slideFromButton 0.3s ease-out forwards';
        document.getElementById("chat-widget-input").focus();
      } else {
        chatBox.style.animation = 'slideToButton 0.3s ease-out forwards';
        setTimeout(() => {
          chatBox.style.display = 'none';
        }, 400);
      }
    }

  }

  // Reset this back to false for next time
  clicked = false; 
  move = false;
});

// Function to move chatbox based on button's position
function moveChatboxToNewPosition() {
  const buttonRect = widgetButton.getBoundingClientRect();
  const buttonHeight = widgetButton.offsetHeight;
  const chatboxWidth = chatBox.offsetWidth;
  const chatboxHeight = chatBox.offsetHeight;

  let chatboxLeft, chatboxTop;

  // Check if the button is on the right or left side
  if (buttonRect.left + buttonRect.width / 2 > window.innerWidth / 2) {
    chatboxLeft = buttonRect.left - chatboxWidth - 15; // Position to the left of the button
  } else {
    chatboxLeft = buttonRect.left + buttonRect.width + 15; // Position to the right of the button
  }

  // Default top position: place chatbox next to the button
  chatboxTop = buttonRect.top + buttonHeight / 2 - chatboxHeight / 2;

  // Ensure the chatbox stays within the vertical bounds
  if (chatboxTop + chatboxHeight > window.innerHeight) {
    chatboxTop = buttonRect.top - chatboxHeight / 2 - 10; // Position above if overflow
  }

  // Apply the calculated position to the chatbox with smooth transition
  chatBox.style.left = `${Math.min(Math.max(chatboxLeft, 0), window.innerWidth - chatboxWidth)}px`;
  chatBox.style.top = `${Math.min(Math.max(chatboxTop, 30), window.innerHeight - chatboxHeight - 30)}px`;
  chatBox.style.transition = 'all 0.3s ease-out'; // Smooth transition while moving
}

