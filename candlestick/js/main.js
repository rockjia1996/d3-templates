const margin = { left: 100, top: 10, right: 10, bottom: 100 }
const width = 500;
const height = 400;


const outerCanvas = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
const innerCanvas = outerCanvas.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .attr("width", width)
    .attr("height", height);

const xAxisGroup = innerCanvas.append("g");
const yAxisGroup = innerCanvas.append("g");





d3.csv('data/JNJ.csv').then(rawData => {
    const data = [];

    // Format the raw data
    rawData.slice(0,10).forEach(d => {
        const { Open, High, Low, Close, Volume, Date: date } = d;
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

    const xDate = d3.map(data, d => d.date)
    const yOpen = d3.map(data, d => d.open)
    const yClose = d3.map(data, d => d.close)
    const yHigh = d3.map(data, d => d.high)
    const yLow = d3.map(data, d => d.low)
    const I = d3.range(xDate.length)

    let xDomain = undefined;
    let xRange = [0, width];
    let yDomain = undefined;
    let yRange = [height, 0];
    let xTicks = undefined;

    const weeks =
        (start, stop, stride) =>
            d3.utcMonday.every(stride).range(start, +stop + 1);
    const weekdays =
        (start, stop) =>
            d3.utcDays(start, +stop + 1)
                .filter(d => d.getUTCDay() !== 0 && d.getUTCDay() !== 6);

    if (xDomain === undefined)
        xDomain = weekdays(d3.min(xDate), d3.max(xDate));
    if (yDomain === undefined)
        yDomain = [d3.min(yLow), d3.max(yHigh)];
    //yDomain = [0, d3.max(yHigh)];
    if (xTicks === undefined)
        xTicks = weeks(d3.min(xDomain), d3.max(xDomain), 1);

    const xScale = d3.scaleBand().domain(xDomain).range(xRange).padding(0.2);
    const yScale = d3.scaleLinear().domain(yDomain).range(yRange);

    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.utcFormat("%b %-d"))
        .tickValues(xTicks)

    const yAxis = d3.axisLeft(yScale).ticks(height / 40, "~f")
    .tickFormat(d => `$${d}`)


    xAxisGroup
        .attr("transform", `translate(0, ${height + 20})`)
        .call(xAxis)
        .call(g => g.select(".domain").remove())

    yAxisGroup
        .attr("transform", `translate(-20, 0)`)
        .call(yAxis)
        .call(g => g.select(".domain").remove())

    const g = innerCanvas.append("g")
        .attr("stroke", "currentColor")
        .attr("stroke-linecap", "round")
        .selectAll("g")
        .data(I)
        .join("g")
        .attr("transform", i => `translate(${xScale(xDate[i])},0)`);

    g.append("line")
        .attr("y1", i => yScale(yLow[i]))
        .attr("y2", i => yScale(yHigh[i]));

    colors = ["#4daf4a", "#999999", "#e41a1c"]
    g.append("line")
        .attr("y1", i => yScale(yOpen[i]))
        .attr("y2", i => yScale(yClose[i]))
        .attr("stroke-width", xScale.bandwidth())
        .attr("stroke", i => colors[1 + Math.sign(yOpen[i] - yClose[i])]);


})


