const timeStamp = [];
document.querySelectorAll('.timeStampStat').forEach((element) => {
  timeStamp.push(element.dataset.time);
});
console.log(timeStamp);

const errorTitle = document.querySelector('.errTitle').dataset.error;
console.log(errorTitle.split(','));

errorTitle.split(',').forEach((title, index) => {
  const occurrences = Array(24).fill(0);
  const maxOccurrences = Math.max(...occurrences);
  const yaxisRange = maxOccurrences <= 5 ? [0, 5] : [0, maxOccurrences];

  timeStamp[index]
    .split(',')
    .map(Number)
    .forEach((timestamp) => {
      const gmtTimestamp = new Date(timestamp); // Assuming timestamps are in GMT
      const gmtPlus8Timestamp = new Date(gmtTimestamp.getTime() + 8 * 60 * 60 * 1000); // Convert to GMT+8
      const hour = gmtPlus8Timestamp.getUTCHours();
      occurrences[hour]++;
    });

  const hours = Array.from({ length: 24 }, (_, i) => i.toString());

  const trace = {
    x: hours,
    y: occurrences,
    type: 'bar',
    hovertemplate: 'Occurrences: %{y}',
    marker: {
      color: 'gray',
      line: {
        color: 'blue',
        width: 0,
      },
    },
  };

  const layout = {
    xaxis: {
      tickvals: Array.from({ length: 24 }, (_, i) => i), // Set tick values for each hour
      ticktext: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`),
      hoverformat: '%H:00',
      showticklabels: false,
    },
    yaxis: {
      showticklabels: false,
      range: yaxisRange,
    },
    hovermode: 'x',
    autosize: false,
    width: 300,
    height: 200,
  };

  const config = {
    displayModeBar: false, // Disable the mode bar
  };

  Plotly.newPlot(`${title}`, [trace], layout, config);
});
