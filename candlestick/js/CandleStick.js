class CandleStick {
    constructor(chartArea, dimConfigs, scaleConfigs, axisConfigs, data) {
        this.width = dimConfigs.width;
        this.height = dimConfigs.height;
        this.marginLeft = dimConfigs.marginLeft;
        this.marginRight = dimConfigs.marginRight;
        this.marginTop = dimConfigs.marginTop;
        this.marginBottom = dimConfigs.marginBottom;

        this.xScale = d3.scaleBand().paddingInner(0.2).paddingOuter(0.3)
        this.yScale = d3.scaleLinear();

        this.data = this.dataCleaning(data);
        this.presentingData = this.data;
        this.colors = ["#4daf4a", "#999999", "#e41a1c"];

        this.outerCanvas = d3.select(chartArea).append("svg")
            .attr("width", this.width + this.marginLeft + this.marginRight)
            .attr("height", this.height + this.marginTop + this.marginBottom)
            .attr("viewBox",
                [
                    0,
                    0,
                    this.width + this.marginRight + this.marginRight,
                    this.height + this.marginTop + this.marginBottom
                ])
            .attr("style", `max-width: 100%; height: auto; height: intrinsic;background-color:#f4f4f4;`)


        this.innerCanvas = this.outerCanvas.append("g")
            .attr("transform",
                `translate(${this.marginLeft}, ${this.marginTop})`)
            .attr("width", this.width)
            .attr("height", this.height);
        this.chart = this.innerCanvas.append("g")
            .attr("stroke", "currentColor")
            .attr("stroke-linecap", "butt");

        this.xAxisGroup = this.innerCanvas.append("g");
        this.yAxisGroup = this.innerCanvas.append("g");

        this.yGridLineGroup = this.innerCanvas.append("g");

        const xRange = [0, this.width];
        const yRange = [this.height, 0];
        this.xScale.range(xRange);
        this.yScale.range(yRange);

        this.xAxisGroup
            .attr("transform",
                `translate(0, ${this.height + this.marginBottom / 4})`)
        this.yAxisGroup
            .attr("transform",
                `translate(${this.width + this.marginRight / 2}, 0)`)
        this.render()

    }

    // Doing data join, enter, update, exit
    render() {

        /*
        this.selectTimePeriod(
            this.presentingData,
            d3.min(this.presentingData, d =>d.date),
            d3.max(this.presentingData, d =>d.date),
            this.presentingData.length <= 180
            ? 1 
            : Math.ceil(this.presentingData.length / 180)
        );
        
        */
        // Configure x and y domain


        const xDomain = this.presentingData.map(d => d.date);
        console.log(this.presentingData)
        const yDomain = [
            this.findMin(this.presentingData),
            this.findMax(this.presentingData)
        ];
        this.xScale.domain(xDomain);
        this.yScale.domain(yDomain);

        // Configure x and y axis
        const xAxisCall = d3.axisBottom(this.xScale)
            .tickFormat(d3.utcFormat("%b %-d"))
            .tickValues(this.xTicksValues(xDomain, 10));
        const yAxisCall = d3.axisRight(this.yScale);

        this.xAxisGroup
            .call(xAxisCall)
            .call(g => g.select(".domain").remove())

        this.yAxisGroup
            .call(yAxisCall)
            .call(g => g.select(".domain").remove())


        console.log(this.yScale.ticks())





        /* Candle sticks: Data join, enter, update, exit */
        const candles = this.chart.selectAll("g")
            .data(this.presentingData, d => d.date)
        //transform to the correct x positions based on the x scale

        candles.exit().remove();

        const newCandles = candles.enter()
            .append("g")
            .attr("transform", d => `translate(${this.xScale(d.date) + this.xScale.bandwidth() / 2}, 0)`)
            .on("mouseover", (event, data) => {
                event.target.setAttribute("fill-opacity", "0.6")
                event.target.setAttribute("fill", "grey")
            })
            .on("mouseout", (event, data) => {
                event.target.setAttribute("fill-opacity", "0.0")
                event.target.setAttribute("fill", "transparent")
            })

        newCandles.append("title")
            .text(d => {
                let tooltip =
                    `Open ----- ${d.open}\n` +
                    `High ------ ${d.high}\n` +
                    `Low  ------ ${d.low}\n` +
                    `Close ----- ${d.close}\n` +
                    `Volume --- ${d.volume}\n` +
                    `Date ------ ${d.date.toDateString()}\n`
                return tooltip;
            })

        // Need to special case like BRK.A
        newCandles
            .append("line")
            .attr("y1", d => {
                if (d.low === d.high)
                    return this.yScale(d.low) - 1.5;
                else
                    return this.yScale(d.low)
            })
            .attr("y2", d => {
                if (d.low === d.high)
                    return this.yScale(d.high) + 1.5
                else
                    return this.yScale(d.high)
            })
        newCandles
            .append("line")
            .attr("y1", d => this.yScale(d.open))
            .attr("y2", d => this.yScale(d.close))
            .attr("stroke-width", this.xScale.bandwidth())
            .attr("stroke", d => this.colors[1 + Math.sign(d.open - d.close)])


        newCandles.append("rect")
            .attr("width", this.xScale.bandwidth())
            .attr("height", this.height)
            .attr("transform", `translate(${-this.xScale.bandwidth() / 2}, 0)`)
            .attr("stroke", "none")
            .attr("fill", "transparent")



        /* Y axis gridline: Data join, enter, update, exit */
        const yGridLine = this.yGridLineGroup.selectAll("line")
            .data(this.yScale.ticks())

        yGridLine.exit().remove()

        yGridLine.enter().append("line")
            .transition()
            .duration(50)
            .attr("x1", 0)
            .attr("y1", d => this.yScale(d))
            .attr("x2", this.width)
            .attr("y2", d => this.yScale(d))
            .attr("fill", "none")
            .attr("shape-rendering", "crispEdges")
            .attr("stroke", "#b6b6b6")
            .attr("stroke-width", "1px")
            .attr("stroke-dasharray", 2)

        yGridLine
            .transition()
            .duration(50)
            .attr("x1", 0)
            .attr("y1", d => this.yScale(d))
            .attr("x2", this.width)
            .attr("y2", d => this.yScale(d))
            .attr("fill", "none")
            .attr("shape-rendering", "crispEdges")
            .attr("stroke", "#b6b6b6")
            .attr("stroke-width", "1px")
            .attr("stroke-dasharray", 2)

    }

    dataCleaning(data) {
        // Remove all the data points that have missing values.
        // Maybe sort the data ??
        const cleaned = [];
        data.forEach(d => {
            const { open, high, low, close, volume, date } = d;
            const isCompelte =
                open !== undefined &&
                high !== undefined &&
                low !== undefined &&
                close !== undefined &&
                volume !== undefined &&
                date !== undefined;

            if (!isCompelte) return;

            cleaned.push(
                {
                    open: Number(open),
                    high: Number(high),
                    low: Number(low),
                    close: Number(close),
                    volume: Number(volume),
                    date: new Date(date)
                }
            )
        })
        return cleaned;
    }

    dataFormatChecker() {
        // To Do: check if data is sorted, contains open, high, low, close,
        // volume, date
    }

    dataSnapShot(data, stride = 1) {
        let target = 0;
        const snapshots = []

        data.forEach((item, index) => {
            if (index === target) {
                snapshots.push(item);
                target += stride;
            }
        })

        return snapshots;
    }

    findMax(data) {
        /*
            Sometimes, stocks continue traded during after market,
            therefore there is a need to find the acutal max value 
            among open, high, low, close
        */
        return d3.max(data, d => d3.max([d.open, d.high, d.low, d.close]))
    }

    findMin(data) {
        /*
            Sometimes, stocks continue traded during after market,
            therefore there is a need to find the acutal low value 
            among open, high, low, close.
            Also some stocks like JNJ (Johnson & Johnson), the open price
            during 1960s was the lowest price rather than the low price 
            during the intraday.
        */
        return d3.min(data, d => d3.min([d.open, d.high, d.low, d.close]))
    }

    xTicksValues(days, num = 10) {
        if (days.length <= num) return days;
        const first = days[0];
        const q1 = days[Math.floor(days.length * 0.25)];
        const median = days[Math.floor(days.length * 0.5)];
        const q3 = days[Math.floor(days.length * 0.75)];
        const last = days[days.length - 1];
        return [first, q1, median, q3, last]
    }


    selectTimePeriod(data, start, end, weekends = false) {
        const startIndex = data.findIndex(
            d => d.date.getTime() === start.getTime());
        const endIndex = data.findIndex(
            d => d.date.getTime() === end.getTime());

        console.log(startIndex)
        if (weekends)
            return data.slice(startIndex, endIndex + 1);
        else
            return data.slice(startIndex, endIndex + 1).filter(
                d => d.date.getUTCDay() !== 0 && d.date.getUTCDay() !== 6);
    }



    dailySnapshot(start, end, stride = 1) {
        return d3.utcDays(start, +end + 1, stride);
    }

    weekdaysSnapshot(start, end, stride = 1) {
        return d3.utcDays(start, +end + 1, stride)
            .filter(d => d.getUTCDay() !== 0 && d.getUTCDay() !== 6);
    }

    weeklySnapshot(start, end, stride = 1) {
        return d3.utcMonday.every(stride).range(start, +end + 1)
    }

    monthlySnapshot(start, end, stride = 1) {
        return d3.utcMonths(start, +end + 1, stride);
    }

    yearlySnapshot(start, end, stride = 1) {
        return d3.utcYear(start, +end + 1, stride);
    }

}



d3.csv('data/AAPL.csv').then(rawData => {
    const data = [];

    // Format the raw data
    rawData.slice(-365).forEach(d => {
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

    const dims = {
        width: 1200,
        height: 300,
        marginLeft: 100,
        marginRight: 100,
        marginTop: 100,
        marginBottom: 100
    }

    const chart = new CandleStick("#chart", dims, {}, {}, data);

})

