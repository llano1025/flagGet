document.addEventListener('DOMContentLoaded', function() {
  const profileList = document.getElementById('profileList');
  const profileNameInput = document.getElementById('profileName');
  const saveBtn = document.getElementById('saveBtn');
  const loadBtn = document.getElementById('loadBtn');
  const deleteBtn = document.getElementById('deleteBtn');

  // Send a message to background.js to retrieve the existing profiles
  chrome.runtime.sendMessage({ action: 'getProfiles' }, (response) => {
    const profiles = response.profiles || {};
    for (const profileName in profiles) {
      const option = document.createElement('option');
      option.value = profileName;
      option.text = profileName;
      profileList.add(option);
    }
  });

  saveBtn.addEventListener('click', function() {
    const profileName = profileNameInput.value.trim();
    if (profileName) {
      // Send a message to content script to collect radio button states
      chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
        const tabId = tabs[0].id;
        try {
          const radioStates = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: collectRadioStates,
          });
          // Send the collected radio button states to background script
          const response = await chrome.runtime.sendMessage({
            action: 'saveProfile',
            profileName: profileName,
            radioStates: radioStates[0],
          });
          console.log(response)
          if (response.success) {
            // Update the profile list
            const option = document.createElement('option');
            option.value = profileName;
            option.text = profileName;
            profileList.add(option);
            // Clear the profile name input
            profileNameInput.value = '';
          } else {
            console.error('Failed to save profile.');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      });
    }
  });

  loadBtn.addEventListener('click', function() {
    const selectedProfile = profileList.value;
    if (selectedProfile) {
      chrome.runtime.sendMessage({
        action: 'loadProfile',
        profileName: selectedProfile,
      }, (response) => {
        const loadedRadioStates = response.radioStates;
        console.log(loadedRadioStates)
        // Send the loaded radio button states to content.js
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          const tabId = tabs[0].id;
          console.log(tabId)
          try {
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              function: applyRadioStates,
              args: [loadedRadioStates],
            });
          } catch (error) {
            console.error('Error:', error);
          }
        });
      });
    }
  });

  deleteBtn.addEventListener('click', function() {
    const selectedProfile = profileList.value;
    if (selectedProfile) {
      // Send a message to background.js to delete the profile
      chrome.runtime.sendMessage({
        action: 'deleteProfile',
        profileName: selectedProfile,
      });

      // Remove the profile from the dropdown list
      const selectedIndex = profileList.selectedIndex;
      if (selectedIndex !== -1) {
        profileList.remove(selectedIndex);
      }
    }
  });
});

function collectRadioStates() {
  const radioButtons = document.querySelectorAll('input[type="radio"]');
  const radioStates = Array.from(radioButtons).map(radio => radio.checked);
  return radioStates;
}

function applyRadioStates(loadedRadioStates) {
  const radioButtons = document.querySelectorAll('input[type="radio"]');
  radioButtons.forEach(function(radio, index) {
    radio.checked = loadedRadioStates.result[index];
  });
}
