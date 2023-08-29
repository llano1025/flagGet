// content.js

// Get the list of radio buttons on the current webpage
const radioButtons = document.querySelectorAll('input[type="radio"]');

// Message passing to background.js to save the radio button states
chrome.runtime.sendMessage({ action: 'saveRadioStates', radioStates: Array.from(radioButtons).map(radio => radio.checked) });
