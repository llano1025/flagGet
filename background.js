// background.js

// Initialize an object to store profiles
// let profiles = {};

// Initialize profiles from Chrome storage when the extension is installed
// chrome.runtime.onInstalled.addListener(function() {
//   chrome.storage.local.get(['profiles'], function(result) {
//     profiles = result.profiles || {};
//     console.log(profiles)
//   });
// });

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

  if (message.action === 'saveProfile') {
    // Get the profile to the profiles object
    chrome.storage.local.get('profiles', (result) => {
      let profiles = result.profiles || {};
    // Save the profile to the profiles object
      profiles[message.profileName] = { radioStates: message.radioStates, selectStates: message.selectStates };
    // Save the updated profiles object to Chrome storage
      chrome.storage.local.set({ profiles: profiles }, function() { 
        if (chrome.storage.local.lastError !== undefined) {
          console.error(chrome.storage.local.lastError);
        } else {
          console.log("Profiles successfully stored");
          sendResponse({ success: true });
        }
        console.log(profiles)
       });
    });
    return true; 
    
  } else if (message.action === 'loadProfile') {
    // Load a profile from the profiles object
    chrome.storage.local.get(['profiles'], function(result) {
      let profiles = result.profiles || {};
      const loadedradioAndText = profiles[message.profileName] || [];
      sendResponse( loadedradioAndText );
    });
    return true; 
    
  } else if (message.action === 'deleteProfile') {
    // Get the profile to the profiles object
    chrome.storage.local.get('profiles', (result) => {
      let profiles = result.profiles || {};
    // Delete a profile from the profiles object
      delete profiles[message.profileName];
    // Save the updated profiles object to Chrome storage
      chrome.storage.local.set({ profiles: profiles }, function() {
        sendResponse({ success: true });
        console.log(profiles)
      });
    });

    // Get the profile from chrome storage
  } else if (message.action === 'getProfiles') {
    chrome.storage.local.get('profiles', (result) => {
      let profiles = result.profiles || {};
      sendResponse({ profiles: profiles });
      console.log(profiles)
    });
    return true; 
  }
});

