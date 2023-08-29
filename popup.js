const profileList = document.getElementById('profileList');
const newProfileForm = document.getElementById('newProfileForm');
const newProfileNameInput = document.getElementById('newProfileName');

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

console.log("Checking newProfileForm:", newProfileForm);
newProfileForm.addEventListener('submit', (event) => {
event.preventDefault();
const newProfileName = newProfileNameInput.value.trim();
if (newProfileName) {
    const option = document.createElement('option');
    option.value = newProfileName;
    option.text = newProfileName;
    profileList.add(option);
    const profileRadios = document.querySelectorAll('input[type="radio"]');
    // Check if the NodeList object is empty
    if (profileRadios.length === 0) {
      console.log('There are no radio buttons on the page.');
    }
    const profileData = Array.from(profileRadios).map(radio => radio.checked);
    console.log(profileRadios)
    chrome.runtime.sendMessage({ action: 'createProfile', profileName: newProfileName, profileData: profileData });
  }
});

document.getElementById('deleteBtn').addEventListener('click', () => {
const selectedProfile = profileList.value;
if (selectedProfile) {
    const option = profileList.querySelector(`option[value="${selectedProfile}"]`);
    option.remove();
    chrome.runtime.sendMessage({ action: 'deleteProfile', profileName: selectedProfile });
}
});

document.getElementById('loadBtn').addEventListener('click', () => {
  const selectedProfile = profileList.value;
  if (selectedProfile) {
    chrome.runtime.sendMessage({ action: 'loadProfile', profileName: selectedProfile }, (response) => {
      const loadedProfileData = response.profileData;
      if (loadedProfileData) {
        console.log("Checking loadedProfileData", loadedProfileData);
        loadedProfileData.forEach((isChecked, index) => {
          profileRadios[index].checked = isChecked;
        });
      }
    });
  }
});
