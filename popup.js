document.addEventListener('DOMContentLoaded', function() {
  const profileList = document.getElementById('profileList');
  const profileNameInput = document.getElementById('profileName');
  const saveBtn = document.getElementById('saveBtn');
  const loadBtn = document.getElementById('loadBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const safetyCheck = document.getElementById('safetyCb');

  // Send a message to background.js to retrieve the existing profiles
  chrome.runtime.sendMessage({ action: 'getProfiles' }, (response) => {
    const profiles = response.profiles || {};
    console.log(profiles)
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
            selectStates: radioAndTextData[0].result.selectedOptions
          });
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
              args: [loadedradioAndText, safetyCheck.checked],
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
  // Select all elements in the document
  const radioButtons = document.querySelectorAll('input[type="radio"]');
  const selectElements = document.querySelectorAll('select');

  // Create an object to store selected options
  const selectedOptions = {};

  // Loop through each <select> element
  selectElements.forEach(function(select) {
  // Get the currently selected <option> element
  const selectedOption = select.options[select.selectedIndex];
  // Store the selected option in the object using the <select>'s id as the key
  selectedOptions[select.id] = selectedOption.value;
  });

  // // Collect radio button states
  // const radioStates = Array.from(radioButtons).map((radio) => radio.checked);

 // Collect radio button states with their corresponding names and values
 const radioStates = {};
 radioButtons.forEach(function(radio) {
   if (radio.checked) {
     radioStates[radio.name] = radio.value;
   }
 });

  // Return both radio button states and text input values
  return { radioStates, selectedOptions };
}

function applyRadioAndTextData(loadedradioAndText, safetyCheck) {
  const radioButtons = document.querySelectorAll('input[type="radio"]');
  
  // // Apply radio button states
  // radioButtons.forEach(function(radio, index) {
  //   radio.checked = loadedradioAndText.radioStates[index];
  // });

   // Apply radio button states
   radioButtons.forEach(function(radio) {
    const radioName = radio.name;
    const radioValue = radio.value;
    if (safetyCheck){
      if (loadedradioAndText.radioStates.hasOwnProperty(radioName) && loadedradioAndText.radioStates[radioName] === radioValue && radioName.includes('Scorecard')) {
        radio.checked = true;
      } else {
        radio.checked = false;
      }
    }else{
      if (loadedradioAndText.radioStates.hasOwnProperty(radioName) && loadedradioAndText.radioStates[radioName] === radioValue) {
        radio.checked = true;
      } else {
        radio.checked = false;
      }
    }
  });  

  // Apply the select values
  const selectedOptions = loadedradioAndText.selectStates;
  for (const selectId in selectedOptions) {
    if (selectedOptions.hasOwnProperty(selectId)) {
      // Get the saved option value from the object
      const savedOptionValue = selectedOptions[selectId];
      const selectElement = document.getElementById(selectId);
      // Loop through the <select> options
      for (let i = 0; i < selectElement.options.length; i++) {
        const option = selectElement.options[i];
        if (option.value === savedOptionValue) {
          option.selected = true;
          break; 
        }
      }
    }
}
}
