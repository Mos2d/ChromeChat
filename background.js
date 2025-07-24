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

const hardcodedTimings = {
    Fajr: "18:03",
    Dhuhr: "18:04",
    Asr: "18:05",
    Maghrib: "18:06",
    Isha: "18:07"
};

const fetchPrayerTimes = () => {
    fetch('http://api.aladhan.com/v1/timingsByCity?city=Montreal&country=Canada&method=2')
    .then(response => response.json())
    .then(data => {
        const timings = data.data.timings;
        scheduleAthanNotifications(hardcodedTimings);
    })
    .catch(err => console.error('Error fetching prayer times:', err));
};

// Fetch prayer times once at the start
fetchPrayerTimes();  // Run immediately on startup

const scheduleAthanNotifications = (timings) => {
    const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    // Get the current time
    const currentTime = new Date();

    // Loop through each prayer time
    prayerNames.forEach((prayer, index) => {
        const prayerTime = timings[prayer];
        const [hours, minutes] = prayerTime.split(':');
        
        const prayerDate = new Date();
        prayerDate.setHours(hours);
        prayerDate.setMinutes(minutes);
        prayerDate.setSeconds(0);

        // If the prayer time has already passed, skip it
        if (prayerDate.getTime() <= currentTime.getTime()) {
            return;
        }

        // Calculate the time difference
        const timeDifference = prayerDate.getTime() - currentTime.getTime();
        
        // chrome.notifications.create({
        //     type: 'basic',
        //     iconUrl: 'icon16.png',  // Make sure your icon path is correct
        //     title: `We are waiting for ${prayer}`,
        //     message: `It'll take ${timeDifference/1000} seconds`,
        //     priority: 2
        // });
        setTimeout(() => {
            // playAthan();
            showPrayerNotification(prayer);
        }, timeDifference);
    });
};

const playAthan = () => {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];  // Get the active tab

        // Execute the script on the active tab to play the audio
        chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: () => {
                const athanAudio = new Audio(chrome.runtime.getURL('athan.mp3')); // Adjust path if needed
                athanAudio.play().catch(err => console.error("Failed to play athan audio:", err));
            }
        });
    });
};

const showPrayerNotification = (prayer) => {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon16.png',  // Make sure your icon path is correct
        title: `It's time for ${prayer}`,
        message: `The time for ${prayer} prayer has arrived.`,
        priority: 2
    });
};