import { showAlert } from './alerts.js';

document.addEventListener('DOMContentLoaded', () => {
  const openCreateProjectBtn = document.getElementById('open-create-project');
  const closeButton = document.querySelector('.close_btn');
  const createProjectWindow = document.querySelector('.create-project-window');
  const generateTokenBtn = document.getElementById('generate-token');
  const tokenInput = document.getElementById('token');
  const submitCreateProjectBtn = document.getElementById(
    'submit-create-project',
  );

  openCreateProjectBtn.addEventListener('click', () => {
    createProjectWindow.classList.toggle('hidden');
    createProjectWindow.classList.toggle('visible');
  });

  closeButton.addEventListener('click', function () {
    createProjectWindow.classList.toggle('hidden');
    createProjectWindow.classList.toggle('visible');
  });

  generateTokenBtn.addEventListener('click', () => {
    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    tokenInput.value = token;
  });

  submitCreateProjectBtn.addEventListener('click', async () => {
    const projectName = document.getElementById('projectName').value;
    const accessToken = tokenInput.value;

    if (!projectName || !token) {
      alert('Please fill out both fields.');
      return;
    }

    try {
      const response = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName,
          accessToken,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showAlert('success', 'Create project success!');
      }
      window.setTimeout(() => {
        location.reload();
      }, 1000);
    } catch (error) {
      const errorData = await response.json();
      console.log(error);
      console.log(errorData);
      showAlert('error', errorData.message);
    }
  });
});

const timeStamp = [];

document.querySelectorAll('.timeStampStat').forEach((element) => {
  timeStamp.push(element.dataset.time);
});

const past1d = () => {
  const now = new Date();
  const currentHourGMT = now.getUTCHours();
  const currentHourGMT8 = (currentHourGMT + 8) % 24;
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const occurrencesMap = new Map();
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = (currentHourGMT8 - 23 + i + 24) % 24;
    return hour.toString().padStart(2, '0') + ':00';
  });

  timeStamp.forEach((entry) => {
    entry = entry.split(',');
    const name = entry[0];
    const timestamps = entry.slice(1);

    const occurrences = Array(24).fill(0);

    timestamps.forEach((timestamp) => {
      if (timestamp >= yesterday.getTime()) {
        const gmtTimestamp = new Date(timestamp * 1 + 8 * 60 * 60 * 1000); // Adjust for GMT+8
        const hour = gmtTimestamp.getUTCHours();

        const index = hours.findIndex((h) =>
          h.startsWith(hour.toString().padStart(2, '0')),
        );
        if (index !== -1) {
          occurrences[index]++;
        }
      }
    });

    occurrencesMap.set(name, occurrences);
  });

  const traceColors = [
    'rgba(252, 222, 190, 0.8)',
    'rgba(146, 135, 121, 0.8)',
    'rgba(212, 210, 165, 0.8)',
  ];

  const traces = Array.from(occurrencesMap.entries()).map(
    ([name, occurrences], index) => ({
      x: hours,
      y: occurrences,
      type: 'bar',
      hovertemplate: `%{y}<extra>${name}</extra>`,
      name: name,
      marker: {
        color: traceColors[index % traceColors.length],
        line: {
          color: 'rgba(31, 119, 180, 1)',
          width: 0.1,
        },
      },
    }),
  );
  console.log(traces);

  const layout = {
    xaxis: {
      tickvals: hours.filter((_, index) => index % 2 === 0),
      ticktext: hours.filter((_, index) => index % 2 === 0),
      tickangle: 45,
      hoverformat: '%H:00',
      type: 'category', // Set x-axis type to category
    },
    yaxis: {
      showline: true,
      linecolor: 'black',
      linewidth: 1,
    },
    hovermode: 'x',
    autosize: true,
    width: 1000,
    height: 300,
    margin: {
      l: 40,
      r: 40,
      b: 40,
      t: 10,
    },
  };

  const config = {
    displayModeBar: false,
  };

  Plotly.newPlot('past1day', traces, layout, config);
};

past1d();
