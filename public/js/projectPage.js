import { showAlert } from './alerts.js';
const timeStamp = [];
document.querySelectorAll('.timeStampStat').forEach((element) => {
  timeStamp.push(element.dataset.time);
});
const errorTitle = document.querySelector('.errTitle').dataset.error;
const dropdowns = document.querySelectorAll('.mutedropdown');
const reactivate = document.querySelectorAll('.reactivate');

reactivate.forEach(function (re) {
  re.addEventListener('change', async function (e) {
    const errorName = this.dataset.error.split('_')[1];
    const token = document.querySelector('.projectToken').dataset.token;

    const response = await fetch('/api/v1/projects/resolve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projecToken: token,
        errMessage: errorName,
        resolve: this.checked,
      }),
    });
    if (response.ok) {
      showAlert('success', 'resolve success');
    }
  });
});

dropdowns.forEach(function (dropdown) {
  const muteTime = dropdown.dataset.error.split('_')[2].trim();
  const dropDown = dropdown;
  dropDown.value = (parseInt(muteTime, 10) * 3600).toString();
  dropdown.addEventListener('change', async function (event) {
    try {
      const selectedTime = this.value;
      const errorName = this.dataset.error.split('_')[1];
      const token = document.querySelector('.projectToken').dataset.token;

      const response = await fetch('/api/v1/projects/mute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projecToken: token,
          errMessage: errorName,
          mute: selectedTime,
        }),
      });
      if (response.ok) {
        showAlert('success', 'mute success');
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Unknown error occurred');
      }
    } catch (err) {
      showAlert('error', err.message);
      setTimeout(() => (this.value = '0'), 250);
    }
  });
});

errorTitle.split(',').forEach((title, index) => {
  const now = new Date();
  const currentHourGMT = now.getUTCHours();
  const currentHourGMT8 = (currentHourGMT + 8) % 24;
  const occurrences = Array(24).fill(0);

  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = (currentHourGMT8 - 23 + i + 24) % 24;
    return hour.toString().padStart(2, '0') + ':00';
  });

  timeStamp[index].split(',').forEach((timestamp) => {
    if (timestamp.trim() !== '') {
      const ts = Number(timestamp);
      if (!isNaN(ts)) {
        const gmtTimestamp = new Date(ts);
        const gmtPlus8Timestamp = new Date(
          gmtTimestamp.getTime() + 8 * 60 * 60 * 1000,
        );
        const hour = gmtPlus8Timestamp.getUTCHours();

        const index = hours.findIndex((h) =>
          h.startsWith(hour.toString().padStart(2, '0')),
        );
        if (index !== -1) {
          occurrences[index]++;
        }
      }
    }
  });

  const trace = {
    x: hours,
    y: occurrences,
    type: 'bar',
    hovertemplate: '%{y} at %{x}<extra></extra>',
    marker: {
      color: 'rgb(137, 164, 209)',
    },
  };

  const maxOccurrences = Math.max(...occurrences);
  const yaxisRange = maxOccurrences <= 5 ? [0, 5] : [0, maxOccurrences];

  const layout = {
    xaxis: {
      tickvals: hours.map((_, i) => i),
      ticktext: hours,
      hoverformat: '%H:00',
      showticklabels: false,
      showgrid: false,
      zerolinecolor: 'rgba(255, 255, 255, 0)',
      linecolor: 'rgba(255, 255, 255, 0)',
      linewidth: 15,
    },
    yaxis: {
      showticklabels: false,
      range: yaxisRange,
      showgrid: false,
      zerolinecolor: 'rgb(211, 221, 238)',
      zerolinewidth: 1,
    },
    hovermode: 'closet',
    autosize: true,
    width: 120,
    height: 45,
    margin: {
      l: 20,
      r: 20,
      b: 10,
      t: 10,
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
  };

  const config = {
    displayModeBar: false,
  };

  Plotly.newPlot(`${title}`, [trace], layout, config);
});
