import { showAlert } from './alerts.js';

const checkbox = document.querySelector('.switch.anomaly');
const anomalyWindow = document.querySelector('.anomaly_rule_window');
if (!checkbox.checked) {
  anomalyWindow.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  const checkbox = document.querySelector('.switch.anomaly');
  const anomalyWindow = document.querySelector('.anomaly_rule_window');
  const windowDropdown = document.getElementById('windowDropdown');
  const timeWindow = document.querySelector('.timeWindow').dataset.timewindow;
  const save = document.querySelector('.rules_save_btn');
  const quotaOption = document.querySelector('.quota');
  const quota = document.querySelector('.quotaVal').dataset.quota;
  const emailNotificationsSwitch = document.querySelector('.switch');

  const toggleNotifications = (enabled) => {
    const ruleContainers = document.querySelectorAll('.rule_set_container');
    const anomalySwitch = document.querySelector('.switch.anomaly');
    const newErrorSwitch = document.querySelector('.switch.new_error');

    if (enabled) {
      ruleContainers.forEach((container) =>
        container.classList.remove('disabled'),
      );
      anomalyWindow.style.display = 'block';
      quotaOption.value = 1;
      anomalySwitch.checked = true;
      newErrorSwitch.checked = true;
    } else {
      ruleContainers.forEach((container) =>
        container.classList.add('disabled'),
      );
      anomalyWindow.style.display = 'none';
      anomalySwitch.checked = false;
      newErrorSwitch.checked = false;
    }
  };

  if (!emailNotificationsSwitch.checked) {
    const ruleContainers = document.querySelectorAll('.rule_set_container');
    ruleContainers.forEach((container) => container.classList.add('disabled'));
  }
  emailNotificationsSwitch.addEventListener('change', function () {
    const enabled = this.checked;
    toggleNotifications(enabled);
  });

  if (timeWindow) {
    for (let option of windowDropdown.options) {
      if (option.value === timeWindow.toString()) {
        option.selected = true;
        break;
      }
    }
  }

  if (quota) {
    quotaOption.value = quota;
  }

  windowDropdown.addEventListener('change', (event) => {
    const selectedValue = event.target.value;
    console.log('Selected value:', selectedValue);
  });

  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      anomalyWindow.style.display = 'block';
      quotaOption.value = 1;
    } else {
      anomalyWindow.style.display = 'none';
    }
  });

  save.addEventListener('click', async () => {
    try {
      const userId = document.querySelector('.project_ownerId').dataset.id;
      const accountName =
        document.querySelector('.project_owner').dataset.owner;
      const projectName =
        document.querySelector('.project_name').dataset.prjname;
      const notificationSwitch = document.querySelector('.switch').checked;
      const newErrorSwitch =
        document.querySelector('.switch.new_error').checked;
      const anomalySwitch = document.querySelector('.switch.anomaly').checked;
      const timeWindowVal = document.querySelector('#windowDropdown').value;
      const quotaVal = document.querySelector('.quota').value;

      const transformBoolean = (item) => {
        if (item === true) {
          return 'on';
        }
        return 'off';
      };

      if (quotaVal > 100) {
        return showAlert('error', 'Error numbers can not exceed a hundred');
      }
      const response = await fetch('/api/v1/projects', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          accountName,
          projectName,
          notification: transformBoolean(notificationSwitch),
          alertFirst: notificationSwitch
            ? transformBoolean(newErrorSwitch)
            : 'off',
          timeWindow: anomalySwitch ? timeWindowVal : 'off',
          quota: anomalySwitch ? quotaVal : 0,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData);
        showAlert('success', 'New Rules Set Successfully!');
        window.setTimeout(() => {
          location.assign(
            `/a/${accountName}/${projectName}/settings/notifications/emails`,
          );
        }, 1000);
      }
    } catch (err) {
      console.log(err);
      showAlert('error', err.message);
    }
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.parentElement.classList.add('active');
    } else if (href.includes('/settings/notifications')) {
      link.parentElement.classList.add('active');
    }
  });
});
