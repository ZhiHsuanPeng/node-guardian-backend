const timeStamp = [];
document.querySelectorAll('.timeStampStat').forEach((element) => {
  timeStamp.push(element.dataset.time);
});
console.log(timeStamp);
const errorTitle = document.querySelector('.errTitle').dataset.error;

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
      tickvals: hours.map((_, i) => i),
      ticktext: hours,
      hoverformat: '%H:00',
      showticklabels: false,
      showgrid: false,
    },
    yaxis: {
      showticklabels: false,
      range: yaxisRange,
      showgrid: false,
    },
    hovermode: 'x',
    autosize: false,
    width: 300,
    height: 200,
  };

  const config = {
    displayModeBar: false,
  };

  Plotly.newPlot(`${title}`, [trace], layout, config);
});
