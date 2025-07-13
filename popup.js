document.getElementById('send').addEventListener('click', () => {
  const command = document.getElementById('command').value;
  chrome.runtime.sendMessage({ action: 'processCommand', command: command });
  document.getElementById('response').innerText = "Processing...";
});
