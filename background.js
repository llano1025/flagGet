// background.js

// Initialize an object to store profiles
let profiles = {};

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

  if (message.action === 'saveProfile') {
    // Save the profile to the profiles object
    profiles[message.profileName] = { radioStates: message.radioStates, textStates: message.textStates };
    // Save the updated profiles object to Chrome storage
    // chrome.storage.sync.set({ profiles: profiles }, function() {
    //   sendResponse({ success: true });
    // });
    chrome.storage.sync.set({ profiles: profiles }, function() {
      if (chrome.storage.sync.lastError !== undefined) {
        console.error(chrome.storage.sync.lastError);
      } else {
        console.log("Profiles successfully stored");
        sendResponse({ success: true });
      }
    });
    return true; 
    
  } else if (message.action === 'loadProfile') {
    // Load a profile from the profiles object
    chrome.storage.sync.get(['profiles'], function(result) {
      profiles = result.profiles || {};
      const loadedradioAndText = profiles[message.profileName] || [];
      sendResponse( loadedradioAndText );
    });
    return true; 
    
  } else if (message.action === 'deleteProfile') {
    // Delete a profile from the profiles object
    delete profiles[message.profileName];

    // Save the updated profiles object to Chrome storage
    chrome.storage.sync.set({ profiles: profiles }, function() {
      sendResponse({ success: true });
    });

    // Get the profile from chrome storage
  } else if (message.action === 'getProfiles') {
    chrome.storage.sync.get('profiles', (result) => {
      const profiles = result.profiles || {};
      sendResponse({ profiles: profiles });
    });
    return true; 
  }
});

// Initialize profiles from Chrome storage when the extension is installed
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.get(['profiles'], function(result) {
    profiles = result.profiles || {};
  });
});
