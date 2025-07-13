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
