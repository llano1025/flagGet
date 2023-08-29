chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getProfiles') {
      chrome.storage.sync.get('profiles', (result) => {
        const profiles = result.profiles || {};
        sendResponse({ profiles: profiles });
      });
      return true; // Indicates that the response will be sent asynchronously
      
    } else if (message.action === 'createProfile') {
      chrome.storage.sync.get('profiles', (result) => {
        const profiles = result.profiles || {};
        profiles[message.profileName] = message.profileData;
        chrome.storage.sync.set({ profiles: profiles });
      });

    } else if (message.action === 'deleteProfile') {
        chrome.storage.sync.get('profiles', (result) => {
          const profiles = result.profiles || {};
          delete profiles[message.profileName];
          chrome.storage.sync.set({ profiles: profiles });
        });

    } else if (message.action === 'loadProfile') {
      chrome.storage.sync.get('profiles', (result) => {
        const profiles = result.profiles || {};
        const selectedProfile = message.profileName;
        const profileData = profiles[selectedProfile];
        sendResponse({ profileData: profileData });
      });
      return true; // Indicates that the response will be sent asynchronously
    }
});
  
