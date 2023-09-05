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
          // Get the collected radio button states and text input
          const radioAndTextData = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: collectRadioAndTextData,
          });
          console.log(radioAndTextData)
          // Send the collected radio button states to background script
          const response = await chrome.runtime.sendMessage({
            action: 'saveProfile',
            profileName: profileName,
            radioStates: radioAndTextData[0].result.radioStates,
            textStates: radioAndTextData[0].result.textValues
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
        // const loadedRadioStates = response.radioStates;
        const loadedradioAndText = response;
        console.log(loadedradioAndText)
        // Get the tab id to load the radio button and text input states
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          const tabId = tabs[0].id;
          try {
            // Load radio button and text input states
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              function: applyRadioAndTextData,
              args: [loadedradioAndText],
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

function collectRadioAndTextData() {
  const radioButtons = document.querySelectorAll('input[type="radio"]');
  const textInputs = document.querySelectorAll('input[type="text"]');
  // Collect radio button states
  const radioStates = Array.from(radioButtons).map((radio) => radio.checked);
  // Collect text input values
  const textValues = Array.from(textInputs).map((input) => input.value);
  // Return both radio button states and text input values
  return { radioStates, textValues };
}

function applyRadioAndTextData(loadedradioAndText) {
  const radioButtons = document.querySelectorAll('input[type="radio"]');
  const textInputs = document.querySelectorAll('input[type="text"]');
  console.log(loadedradioAndText)
  // Apply radio button states
  radioButtons.forEach(function(radio, index) {
    radio.checked = loadedradioAndText.radioStates[index];
  });
  // Apply text input values
  textInputs.forEach((textInput, index) => {
    if (loadedradioAndText !== undefined) {
      console.log('loadedradioAndTest != undefined')
      textInput.value = loadedradioAndText.textStates[index];
    }
  });
}