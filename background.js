chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'processCommand') {
    const command = request.command.toLowerCase();
    if (command.includes('youtube')) {
      const queryMatch = command.match(/search (.+) on youtube/);
      const query = queryMatch ? queryMatch[1] : '';

      chrome.tabs.create({ url: 'https://www.youtube.com' }, (tab) => {
        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
          if (tabId === tab.id && info.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener);

            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content.js']
            }, () => {
              if (query) {
                chrome.tabs.sendMessage(tab.id, {
                  action: 'youtubeSearch',
                  query: query
                });
              }
            });
          }
        });
      });
    }
    else if (command.includes('gmail')) {
      chrome.tabs.create({ url: 'https://mail.google.com' });
    } else {
      console.log('Unknown command:', command);
    }
  }
});

    
