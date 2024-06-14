const timeStamp = [];
document.querySelectorAll('.timeStampStat').forEach((element) => {
  timeStamp.push(element.dataset.time);
});
console.log(timeStamp);

const errorTitle = document.querySelector('.errTitle').dataset.error;
console.log(errorTitle.split(','));

const drawBarGraph = () => {};
