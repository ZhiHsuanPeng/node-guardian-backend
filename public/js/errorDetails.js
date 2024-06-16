const timeStamp = [];
document.querySelectorAll('.timeStampStat').forEach((element) => {
  timeStamp.push(element.dataset.time);
});

const past1d = () => {
  const now = new Date();
  const currentHourGMT = now.getUTCHours();
  const currentHourGMT8 = (currentHourGMT + 8) % 24;
  const occurrences = Array(24).fill(0);

  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = (currentHourGMT8 - 23 + i + 24) % 24;
    return hour.toString().padStart(2, '0') + ':00';
  });

  timeStamp[0].split(',').forEach((timestamp) => {
    if (timestamp.trim() !== '') {
      const ts = Number(timestamp);
      if (!isNaN(ts)) {
        const gmtTimestamp = new Date(ts);
        const gmtPlus8Timestamp = new Date(gmtTimestamp.getTime() + 8 * 60 * 60 * 1000);
        const hour = gmtPlus8Timestamp.getUTCHours();

        const index = hours.findIndex((h) => h.startsWith(hour.toString().padStart(2, '0')));
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
    hovertemplate: '%{y}<extra></extra>',
    marker: {
      color: 'rgba(26, 118, 186, 0.8)',
      line: {
        color: 'rgba(31, 119, 180, 1)',
        width: 1,
      },
    },
  };

  const maxOccurrences = Math.max(...occurrences);
  const yaxisRange = maxOccurrences <= 5 ? [0, 5] : [0, maxOccurrences];

  const layout = {
    xaxis: {
      tickvals: [0, Math.floor(hours.length / 2), hours.length - 1],
      ticktext: [hours[0], hours[Math.floor(hours.length / 2)], hours[hours.length - 1]],
      hoverformat: '%H:00',
      showgrid: false,
      tickangle: 0,
    },
    yaxis: {
      range: yaxisRange,
      showline: true,
      linecolor: 'black',
      linewidth: 1,
    },
    hovermode: 'x',
    autosize: true,
    width: 400,
    height: 250,
    margin: {
      l: 30,
      r: 30,
      b: 30,
      t: 30,
    },
  };

  const config = {
    displayModeBar: false,
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
    const hourAdjusted = (currentHourGMT + 8 + Math.floor(totalMinutes / 60)) % 24;

    return hourAdjusted.toString().padStart(2, '0') + ':' + minuteAdjusted.toString().padStart(2, '0');
  });
  console.log(minutes);

  timeStamp[0].split(',').forEach((timestamp) => {
    if (timestamp.trim() !== '') {
      const ts = Number(timestamp);
      if (!isNaN(ts)) {
        if (new Date() - ts <= 60 * 60 * 1000) {
          const gmtTimestamp = new Date(ts);
          const gmtPlus8Timestamp = new Date(gmtTimestamp.getTime() + 8 * 60 * 60 * 1000);
          const minute = gmtPlus8Timestamp.getUTCMinutes();
          const index = minutes.findIndex((m) => m.endsWith(minute.toString().padStart(2, '0')));
          if (index !== -1) {
            occurrences[index]++;
          }
        }
      }
    }
  });

  const trace = {
    x: minutes,
    y: occurrences,
    type: 'bar',
    hovertemplate: '%{y}<extra></extra>',
    marker: {
      color: 'rgba(26, 118, 186, 0.8)',
      line: {
        color: 'rgba(31, 119, 180, 1)',
        width: 1,
      },
    },
  };

  const maxOccurrences = Math.max(...occurrences);
  const yaxisRange = maxOccurrences <= 5 ? [0, 5] : [0, maxOccurrences];

  const layout = {
    xaxis: {
      tickvals: [0, Math.floor(minutes.length / 2), minutes.length - 1],
      ticktext: [minutes[0], minutes[Math.floor(minutes.length / 2)], minutes[minutes.length - 1]],
      hoverformat: '%M:00',
      showgrid: false,
      tickangle: 0,
    },
    yaxis: {
      range: yaxisRange,
      showline: true,
      linecolor: 'black',
      linewidth: 1,
    },
    hovermode: 'x',
    autosize: true,
    width: 400,
    height: 250,
    margin: {
      l: 30,
      r: 30,
      b: 30,
      t: 30,
    },
  };

  const config = {
    displayModeBar: false,
  };

  Plotly.newPlot('past1hour', [trace], layout, config);
};

const past1w = () => {
  const now = new Date();
  const occurrences = Array(7).fill(0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    return date.toISOString().slice(0, 10);
  });

  timeStamp[0].split(',').forEach((timestamp) => {
    if (timestamp.trim() !== '') {
      const ts = Number(timestamp);
      if (!isNaN(ts)) {
        const gmtTimestamp = new Date(ts);
        const gmtPlus8Timestamp = new Date(gmtTimestamp.getTime() + 8 * 60 * 60 * 1000);
        const dayDiff = Math.floor((now - gmtPlus8Timestamp) / (24 * 60 * 60 * 1000));
        if (dayDiff >= 0 && dayDiff < 7) {
          occurrences[6 - dayDiff]++;
        }
      }
    }
  });

  const trace = {
    x: days,
    y: occurrences,
    type: 'bar',
    hovertemplate: '%{y}<extra></extra>',
    marker: {
      color: 'rgba(26, 118, 186, 0.8)',
      line: {
        color: 'rgba(31, 119, 180, 1)',
        width: 1,
      },
    },
  };
  console.log(days);

  const maxOccurrences = Math.max(...occurrences);
  const yaxisRange = maxOccurrences <= 5 ? [0, 5] : [0, maxOccurrences];
  const layout = {
    xaxis: {
      tickvals: [days[0], days[3], days[6]],
      ticktext: [days[0], days[3], days[6]],
      hoverformat: '%m/%d',
      showgrid: false,
      tickangle: 0,
    },
    yaxis: {
      range: yaxisRange,
      showline: true,
      linecolor: 'black',
      linewidth: 1,
    },
    hovermode: 'x',
    autosize: true,
    width: 400,
    height: 250,
    margin: {
      l: 30,
      r: 30,
      b: 30,
      t: 30,
    },
  };

  const config = {
    displayModeBar: false,
  };

  Plotly.newPlot('past1week', [trace], layout, config);
};

past1d();
past1h();
past1w();
