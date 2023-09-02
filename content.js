// content.js

// Listen for messages from popup.js and background.js
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'collectRadioStates') {
      // Implement logic to capture radio button states and send them back
      const radioStates = captureRadioStates();
      sendResponse(radioStates);
    } else if (message.action === 'applyRadioStates') {
      // Implement logic to apply radio button states received from popup.js
      console.log(message.radioState)
      applyRadioStates(message.radioStates);
    }
  });
  
  // Implement your logic to capture radio button states on the current page
  function captureRadioStates() {
    // Capture radio button states
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    const radioStates = Array.from(radioButtons).map(radio => radio.checked);
    return radioStates;
  }
  
  // Implement your logic to apply radio button states on the current page
  function applyRadioStates(radioStates) {
    // Apply radio button states
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(function(radio, index) {
      radio.checked = radioStates[index];
    });
  }
  