chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'parseCommand') {
    // Handle intent parsing in background (avoid CORS issues)
    fetch('http://localhost:5005/model/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: request.text })
    })
      .then(response => response.json())
      .then(data => {
        sendResponse({ success: true, data });
      })
      .catch(error => {
        console.error('Background fetch error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // IMPORTANT: Keep the message channel open for async sendResponse
  }

  if (request.action === 'processCommand') {
    const command = request.command.toLowerCase();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];

      if (command.includes('youtube')) {
        const queryMatch = command.match(/search (.+) on youtube/);
        const query = queryMatch ? queryMatch[1] : '';
        const youtubeSearchURL = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

        chrome.tabs.update(tab.id, { url: youtubeSearchURL }, () => {
          chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
        });

      } else if (command.includes('google')) {
        const queryMatch = command.match(/search (.+) on google/);
        const query = queryMatch ? queryMatch[1] : '';
        const googleSearchURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

        chrome.tabs.update(tab.id, { url: googleSearchURL }, () => {
          chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
        });

      } else if (command === 'go back') {
        chrome.tabs.goBack(tab.id);
      } else if (command === 'go forward') {
        chrome.tabs.goForward(tab.id);
      } else if (command === 'refresh page') {
        chrome.tabs.reload(tab.id);
      } else {
        console.log('Unknown command:', command);
      }
    });
  }

});
