document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  const checkbox = document.querySelector('.switch.anomaly');
  const anomalyWindow = document.querySelector('.anomaly_rule_window');
  const windowDropdown = document.getElementById('windowDropdown');
  const timeWindow = document.querySelector('.timeWindow').dataset.timewindow;
  const quotaOption = document.querySelector('.quota');
  const quota = document.querySelector('.quotaVal').dataset.quota;

  //   const projectOwner = document.querySelector('.project_owner').dataset.owner;
  //   const projectName = document.querySelector('.project_name').dataset.prjname;
  //   const userId = document.querySelector('.project_ownerId').dataset.id;
  console.log(timeWindow);
  console.log(quota);
  if (timeWindow) {
    for (let option of windowDropdown.options) {
      if (option.value === timeWindow.toString()) {
        option.selected = true;
        break; // Exit the loop once the default option is selected
      }
    }
  }
  if (quota) {
    quotaOption.value = quota;
  }

  windowDropdown.addEventListener('change', (event) => {
    const selectedValue = event.target.value;
    console.log('Selected value:', selectedValue);
    // Perform actions based on the selected value
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.parentElement.classList.add('active');
    } else if (href.includes('/settings/notifications')) {
      // Exclude the Notifications link from styling changes
      link.parentElement.classList.add('active');
    }
  });

  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      anomalyWindow.style.display = 'block';
    } else {
      anomalyWindow.style.display = 'none';
    }
  });
});
