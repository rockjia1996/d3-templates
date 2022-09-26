const margin = { left: 100, top: 10, right: 10, bottom: 100 }
const width = 400;
const height = 300;


const outerCanvas = d3.select("#candle-chart");
outerCanvas.attr("width", width + margin.left + margin.right)
outerCanvas.attr("height", height + margin.top + margin.bottom)
const innerCanvas = outerCanvas.append("g");

const xAxisGroup = innerCanvas.append("g");
const yAxisGroup = innerCanvas.append("g");

const xScale = d3.scaleBand().padding(0.2)
const yScale = d3.scaleLinear()



d3.csv('data/JNJ.csv').then(rawData => {
    const data = [];

    // Format the raw data
    rawData.forEach(d => {
        const { Open, High, Low, Close, Volume, Date:date } = d;
        data.push({
            open: Number(Open),
            high: Number(High),
            low: Number(Low),
            close: Number(Close),
            volume: Number(Volume),
            date: new Date(date) 
        });
    })
    console.log(data)





})



