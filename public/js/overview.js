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
      } else {
        showAlert('error', result.error || 'Unknown error occurred');
      }
      window.setTimeout(() => {
        location.reload();
      }, 1000);
    } catch (error) {
      console.log(error);
      showAlert('error', error.message);
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
  const allZeroes = Array.from(occurrencesMap.values()).every((occurrences) =>
    occurrences.every((value) => value === 0),
  );
  if (occurrencesMap.size === 0 || allZeroes) {
    const defaultData = Array(24)
      .fill(0)
      .map((_, index) => Math.floor(Math.random() * 10));

    const defaultTrace = {
      x: hours,
      y: defaultData,
      type: 'bar',
      marker: {
        color: 'rgba(255, 99, 71, 0.1)',
        opacity: 0.4,
      },

      showlegend: false,
    };

    const layout = {
      annotations: [
        {
          x: 0.5,
          y: 0.5,
          xref: 'paper',
          yref: 'paper',
          text: 'There are no occurrences for the past 24 hours.',
          showarrow: false,
          font: {
            family: 'Arial',
            size: 28,
            color: 'rgba(255, 255, 255, 1)',
          },
        },
      ],
      shapes: [
        {
          type: 'rect',
          xref: 'paper',
          yref: 'paper',
          x0: 0.1,
          y0: 0.3,
          x1: 0.9,
          y1: 0.7,
          fillcolor: 'rgba(128, 128, 128, 1)',
          opacity: 0.8,
          line: {
            width: 0,
            radius: 10,
          },
          layer: 'below',
          hoverinfo: 'none',
          style: {
            pointerEvents: 'none',
          },
        },
      ],
      xaxis: {
        tickvals: hours.filter((_, index) => index % 2 === 0),
        ticktext: hours.filter((_, index) => index % 2 === 0),
        tickangle: 45,
        type: 'category',
        tickmode: 'linear',
        dtick: 1,
        gridcolor: 'rgba(0,0,0,0)',
        tickfont: {
          color: 'rgba(0,0,0,0.1)',
        },
        tickcolor: 'rgba(0,0,0,0.1)',
      },
      yaxis: {
        showline: true,
        linecolor: 'black',
        linewidth: 1,
        tickmode: 'linear',
        dtick: 1,
        tickvals: Array.from({ length: 10 }, (_, i) => i + 1),
        gridcolor: 'rgba(0,0,0,0)',
        tickfont: {
          color: 'rgba(0,0,0,0.1)',
        },
        tickcolor: 'rgba(0,0,0,0.1)',
      },
      hovermode: false,
      autosize: true,
      // width: 1100,
      // height: 300,
      margin: {
        l: 50,
        r: 50,
        b: 50,
        t: 10,
      },
    };

    Plotly.newPlot('past1day', [defaultTrace], layout, {
      displayModeBar: false,
      responsive: true,
    });
  } else {
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

    const layout = {
      xaxis: {
        tickvals: hours.filter((_, index) => index % 2 === 0),
        ticktext: hours.filter((_, index) => index % 2 === 0),
        tickangle: 45,
        hoverformat: '%H:00',
        type: 'category', // Set x-axis type to category
        tickmode: 'linear', // Set tick mode to linear
        dtick: 1, // Set the interval between ticks to 1 (integer)
      },
      yaxis: {
        showline: true,
        linecolor: 'black',
        linewidth: 1,
        tickmode: 'linear', // Set tick mode to linear for the y-axis
        dtick: 1, // Set the interval between ticks to 1 (integer)
      },
      hovermode: 'x',
      autosize: true,
      // width: 1100,
      // height: 300,
      margin: {
        l: 50,
        r: 50,
        b: 40,
        t: 10,
      },
    };

    const config = {
      displayModeBar: false,
      responsive: true,
    };

    Plotly.newPlot('past1day', traces, layout, config);
  }
};

past1d();
