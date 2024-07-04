const timeStamp = [];
document.querySelectorAll('.timeStampStat').forEach((element) => {
  timeStamp.push(element.dataset.time);
});
console.log(timeStamp);

const ipTimeStamp = [];
document.querySelectorAll('.iPtimeStamp').forEach((element) => {
  ipTimeStamp.push([element.dataset.iptime]);
});

const past1d = () => {
  const now = new Date();
  const currentHourGMT = now.getUTCHours();
  const currentHourGMT8 = (currentHourGMT + 8) % 24;
  const occurrences = Array(24).fill(0);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = (currentHourGMT8 - 23 + i + 24) % 24;
    return hour.toString().padStart(2, '0') + ':00';
  });

  timeStamp[0].split(',').forEach((timestamp) => {
    if (timestamp.trim() !== '') {
      const ts = Number(timestamp);
      if (!isNaN(ts)) {
        if (ts >= yesterday.getTime()) {
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
    }
  });

  const sum = occurrences.reduce((acc, val) => acc + val, 0);
  const sumInPug = document.querySelector('.past1dSum');
  if (sumInPug) {
    sumInPug.textContent = `Total: ${sum}`;
  }

  const trace = {
    x: hours,
    y: occurrences,
    type: 'bar',
    hovertemplate: '%{y}<extra></extra>',
    marker: {
      color: '#8f9fbf',
      line: {
        color: '#8f9fbf',
        width: 1,
      },
    },
  };

  const maxOccurrences = Math.max(...occurrences);
  const yaxisRange = maxOccurrences <= 5 ? [0, 5] : [0, maxOccurrences];

  const layout = {
    xaxis: {
      tickvals: [2, Math.floor(hours.length / 2), hours.length - 1],
      ticktext: [
        hours[2],
        hours[Math.floor(hours.length / 2)],
        hours[hours.length - 1],
      ],
      hoverformat: '%H:00',
      linecolor: '#848484',
      showgrid: false,
      tickangle: 0,
      ticklen: 3,
      tickcolor: '#848484',
    },
    yaxis: {
      range: yaxisRange,
      showline: true,
      linecolor: '#848484',
      ticklen: 3,
      tickcolor: '#848484',
      linewidth: 2,
    },
    hovermode: 'x',
    // width: 270,
    // height: 150,
    margin: {
      l: 30,
      r: 30,
      b: 30,
      t: 30,
    },
  };

  const config = {
    displayModeBar: false,
    responsive: true,
  };

  Plotly.newPlot('past1day', [trace], layout, config);
};

const past1h = () => {
  const now = new Date();
  const currentMinuteGMT = now.getUTCMinutes();
  const currentHourGMT = now.getUTCHours();
  const occurrences = Array(60).fill(0);

  const minutes = Array.from({ length: 60 }, (_, i) => {
    const totalMinutes = currentMinuteGMT - 59 + i;
    const minuteAdjusted = (totalMinutes + 60) % 60;
    const hourAdjusted =
      (currentHourGMT + 8 + Math.floor(totalMinutes / 60)) % 24;

    return (
      hourAdjusted.toString().padStart(2, '0') +
      ':' +
      minuteAdjusted.toString().padStart(2, '0')
    );
  });

  timeStamp[0].split(',').forEach((timestamp) => {
    if (timestamp.trim() !== '') {
      const ts = Number(timestamp);
      if (!isNaN(ts)) {
        if (new Date() - ts <= 60 * 60 * 1000) {
          const gmtTimestamp = new Date(ts);
          const gmtPlus8Timestamp = new Date(
            gmtTimestamp.getTime() + 8 * 60 * 60 * 1000,
          );
          const minute = gmtPlus8Timestamp.getUTCMinutes();

          const index = minutes.findIndex((m) =>
            m.endsWith(minute.toString().padStart(2, '0')),
          );
          if (index !== -1) {
            occurrences[index]++;
          }
        }
      }
    }
  });
  // console.log(occurrences);

  const sum = occurrences.reduce((acc, val) => acc + val, 0);
  const sumInPug = document.querySelector('.past1hSum');
  if (sumInPug) {
    sumInPug.textContent = `Total: ${sum}`;
  }

  const trace = {
    x: minutes,
    y: occurrences,
    type: 'bar',
    hovertemplate: '%{y}<extra></extra>',
    marker: {
      color: '#8f9fbf',
      line: {
        color: '#8f9fbf',
        width: 1,
      },
    },
  };

  const maxOccurrences = Math.max(...occurrences);
  const yaxisRange = maxOccurrences <= 5 ? [0, 5] : [0, maxOccurrences];

  const layout = {
    xaxis: {
      tickvals: [2, Math.floor(minutes.length / 2), minutes.length - 1],
      ticktext: [
        minutes[2],
        minutes[Math.floor(minutes.length / 2)],
        minutes[minutes.length - 1],
      ],
      hoverformat: '%M:00',
      showgrid: false,
      tickangle: 0,
      linecolor: '#848484',
      showgrid: false,
      tickangle: 0,
      ticklen: 3,
      tickcolor: '#848484',
    },
    yaxis: {
      range: yaxisRange,
      showline: true,
      linecolor: '#848484',
      tickcolor: '#848484',
      linewidth: 2,
    },
    hovermode: 'x',
    // autosize: true,
    // width: 270,
    // height: 150,
    margin: {
      l: 30,
      r: 30,
      b: 30,
      t: 30,
    },
  };

  const config = {
    displayModeBar: false,
    responsive: true,
  };

  Plotly.newPlot('past1hour', [trace], layout, config);
};

const past1w = () => {
  const now = new Date();
  const occurrences = Array(7).fill(0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const ts = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    const newDate = new Date(ts);
    const month = newDate.getMonth() + 1;
    const day = newDate.getDate();
    return `${month}/${day}`;
  });

  timeStamp[0].split(',').forEach((timestamp) => {
    const ts = Number(timestamp);
    const dayDiff = Math.floor((now - ts) / (24 * 60 * 60 * 1000));
    if (dayDiff >= 0 && dayDiff < 7) {
      occurrences[6 - dayDiff]++;
    }
  });

  const trace = {
    x: days,
    y: occurrences,
    type: 'bar',
    width: 0.3,
    hovertemplate: '%{y}<extra></extra>',
    marker: {
      color: '#8f9fbf',
      line: {
        color: '#8f9fbf',
        width: 1,
      },
    },
  };

  const sum = occurrences.reduce((acc, val) => acc + val, 0);
  const sumInPug = document.querySelector('.past1wSum');
  if (sumInPug) {
    sumInPug.textContent = `Total: ${sum}`;
  }

  const maxOccurrences = Math.max(...occurrences);
  const yaxisRange = maxOccurrences <= 5 ? [0, 5] : [0, maxOccurrences];
  const layout = {
    xaxis: {
      tickvals: [days[0], days[3], days[6]],
      ticktext: [days[0], days[3], days[6]],
      hoverformat: '%m/%d',
      showgrid: false,
      tickangle: 0,
      linecolor: '#848484',
      showgrid: false,
      tickangle: 0,
      ticklen: 3,
      tickcolor: '#848484',
    },
    yaxis: {
      range: yaxisRange,
      showline: true,
      linecolor: '#848484',
      tickcolor: '#848484',
      linewidth: 2,
    },
    hovermode: 'x',
    // width: 270,
    // height: 150,
    margin: {
      l: 30,
      r: 30,
      b: 30,
      t: 30,
    },
  };

  const config = {
    displayModeBar: false,
    responsive: true,
  };

  Plotly.newPlot('past1week', [trace], layout, config);
};

const past1hIpCount = () => {
  const now = new Date();
  const currentMinuteGMT = now.getUTCMinutes();
  const currentHourGMT = now.getUTCHours();
  const occurrences = Array(60).fill(0);

  const minutes = Array.from({ length: 60 }, (_, i) => {
    const totalMinutes = currentMinuteGMT - 59 + i;
    const minuteAdjusted = (totalMinutes + 60) % 60;
    const hourAdjusted =
      (currentHourGMT + 8 + Math.floor(totalMinutes / 60)) % 24;

    return (
      hourAdjusted.toString().padStart(2, '0') +
      ':' +
      minuteAdjusted.toString().padStart(2, '0')
    );
  });
  ipTimeStamp.forEach((timestamps) => {
    const uniqueMinutes = new Set();
    timestamps[0].split(',').forEach((timestamp) => {
      const ts = Number(timestamp);
      const gmtTimestamp = new Date(timestamp * 1);
      const gmtPlus8Timestamp = new Date(
        gmtTimestamp.getTime() + 8 * 60 * 60 * 1000,
      );
      const minute = gmtPlus8Timestamp.getUTCMinutes();

      if (!uniqueMinutes.has(minute)) {
        uniqueMinutes.add(minute);

        if (new Date() - ts <= 60 * 60 * 1000) {
          const index = minutes.findIndex((m) =>
            m.endsWith(minute.toString().padStart(2, '0')),
          );
          if (index !== -1) {
            occurrences[index]++;
          }
        }
      }
    });
  });

  const sum = occurrences.reduce((acc, val) => acc + val, 0);
  const sumInPug = document.querySelector('.past1hIpSum');
  if (sumInPug) {
    sumInPug.textContent = `Total: ${sum}`;
  }

  const trace = {
    x: minutes,
    y: occurrences,
    type: 'bar',
    hovertemplate: '%{y}<extra></extra>',
    marker: {
      color: '#8f9fbf',
      line: {
        color: '#8f9fbf',
        width: 1,
      },
    },
  };

  const maxOccurrences = Math.max(...occurrences);
  const yaxisRange = maxOccurrences <= 5 ? [0, 5] : [0, maxOccurrences];

  const layout = {
    xaxis: {
      tickvals: [2, Math.floor(minutes.length / 2), minutes.length - 1],
      ticktext: [
        minutes[2],
        minutes[Math.floor(minutes.length / 2)],
        minutes[minutes.length - 1],
      ],
      hoverformat: '%M:00',
      showgrid: false,
      tickangle: 0,
      linecolor: '#848484',
      showgrid: false,
      tickangle: 0,
      ticklen: 3,
      tickcolor: '#848484',
    },
    yaxis: {
      range: yaxisRange,
      showline: true,
      linecolor: '#848484',
      tickcolor: '#848484',
      linewidth: 2,
    },
    hovermode: 'x',
    // width: 270,
    // height: 150,
    margin: {
      l: 30,
      r: 30,
      b: 30,
      t: 30,
    },
  };

  const config = {
    displayModeBar: false,
    responsive: true,
  };

  Plotly.newPlot('past1hourIpCount', [trace], layout, config);
};

const past1dIpCount = () => {
  const now = new Date();
  const currentHourGMT = now.getUTCHours();
  const currentHourGMT8 = (currentHourGMT + 8) % 24;
  const occurrences = Array(24).fill(0);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = (currentHourGMT8 - 23 + i + 24) % 24;
    return hour.toString().padStart(2, '0') + ':00';
  });

  ipTimeStamp.forEach((timestamps) => {
    const uniqueHours = new Set();
    timestamps[0].split(',').forEach((timestamp) => {
      const ts = Number(timestamp);
      const gmtTimestamp = new Date(timestamp * 1);
      const gmtPlus8Timestamp = new Date(
        gmtTimestamp.getTime() + 8 * 60 * 60 * 1000,
      );
      const hour = gmtPlus8Timestamp.getUTCHours();

      if (!uniqueHours.has(hour)) {
        uniqueHours.add(hour);

        if (new Date() - ts <= 24 * 60 * 60 * 1000) {
          const index = hours.findIndex((m) =>
            m.startsWith(hour.toString().padStart(2, '0')),
          );
          if (index !== -1) {
            occurrences[index]++;
          }
        }
      }
    });
  });

  const sum = occurrences.reduce((acc, val) => acc + val, 0);
  const sumInPug = document.querySelector('.past1dIpSum');
  if (sumInPug) {
    sumInPug.textContent = `Total: ${sum}`;
  }

  const trace = {
    x: hours,
    y: occurrences,
    type: 'bar',
    hovertemplate: '%{y}<extra></extra>',
    marker: {
      color: '#8f9fbf',
      line: {
        color: '#8f9fbf',
        width: 1,
      },
    },
  };

  const maxOccurrences = Math.max(...occurrences);
  const yaxisRange = maxOccurrences <= 5 ? [0, 5] : [0, maxOccurrences];

  const layout = {
    xaxis: {
      tickvals: [2, Math.floor(hours.length / 2), hours.length - 1],
      ticktext: [
        hours[2],
        hours[Math.floor(hours.length / 2)],
        hours[hours.length - 1],
      ],
      hoverformat: '%H:00',
      showgrid: false,
      tickangle: 0,
      linecolor: '#848484',
      showgrid: false,
      tickangle: 0,
      ticklen: 3,
      tickcolor: '#848484',
    },
    yaxis: {
      range: yaxisRange,
      showline: true,
      linecolor: '#848484',
      tickcolor: '#848484',
      linewidth: 2,
    },
    hovermode: 'x',
    // width: 270,
    // height: 150,
    margin: {
      l: 30,
      r: 30,
      b: 30,
      t: 30,
    },
  };

  const config = {
    displayModeBar: false,
    responsive: true,
  };

  Plotly.newPlot('past1dIpCount', [trace], layout, config);
};

const past1wIpCount = () => {
  const now = new Date();
  const occurrences = Array(7).fill(0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const ts = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    const newDate = new Date(ts);
    const month = newDate.getMonth() + 1;
    const day = newDate.getDate();
    return `${month}/${day}`;
  });

  ipTimeStamp.forEach((timestamps) => {
    const uniqueDays = [];
    timestamps[0].split(',').forEach((timestamp) => {
      const ts = Number(timestamp);
      const nowTs = now.getTime();
      const dayDiff = Math.floor((nowTs - ts) / (24 * 60 * 60 * 1000));
      if (!uniqueDays.includes(dayDiff)) {
        uniqueDays.push(dayDiff);
        occurrences[6 - dayDiff]++;
      }
    });
  });

  const trace = {
    x: days,
    y: occurrences,
    type: 'bar',
    width: 0.3,
    hovertemplate: '%{y}<extra></extra>',
    marker: {
      color: '#8f9fbf',
      line: {
        color: '#8f9fbf',
        width: 1,
      },
    },
  };

  const sum = occurrences.reduce((acc, val) => acc + val, 0);
  const sumInPug = document.querySelector('.past1wIpSum');
  if (sumInPug) {
    sumInPug.textContent = `Total: ${sum}`;
  }

  const maxOccurrences = Math.max(...occurrences);
  const yaxisRange = maxOccurrences <= 5 ? [0, 5] : [0, maxOccurrences];
  const layout = {
    xaxis: {
      tickvals: [days[0], days[3], days[6]],
      ticktext: [days[0], days[3], days[6]],
      hoverformat: '%m/%d',
      showgrid: false,
      tickangle: 0,
      linecolor: '#848484',
      showgrid: false,
      tickangle: 0,
      ticklen: 3,
      tickcolor: '#848484',
    },
    yaxis: {
      range: yaxisRange,
      showline: true,
      linecolor: '#848484',
      tickcolor: '#848484',
      linewidth: 2,
    },
    hovermode: 'x',
    // width: 270,
    // height: 150,
    margin: {
      l: 30,
      r: 30,
      b: 30,
      t: 30,
    },
  };

  const config = {
    displayModeBar: false,
    responsive: true,
  };

  Plotly.newPlot('past1wIpCount', [trace], layout, config);
};

past1d();
past1h();
past1w();
past1hIpCount();
past1dIpCount();
past1wIpCount();
