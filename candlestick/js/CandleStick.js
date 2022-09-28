class CandleStick {
    constructor(chartArea, dimConfigs, scaleConfigs, axisConfigs, data) {
        this.width = dimConfigs.width;
        this.height = dimConfigs.height;
        this.marginLeft = dimConfigs.marginLeft;
        this.marginRight = dimConfigs.marginRight;
        this.marginTop = dimConfigs.marginTop;
        this.marginBottom = dimConfigs.marginBottom;

        this.xScale = scaleConfigs.xScale;
        this.yScale = scaleConfigs.yScale;
        this.xAxisCall = axisConfigs.xAxisCall;
        this.yAxisCall = axisConfigs.yAxisCall;

        this.data = this.dataCleaning(data);
        this.presentingData = this.data;
        this.colors = ["#4daf4a", "#999999", "#e41a1c"];

        this.outerCanvas = d3.select(chartArea).append("svg")
            .attr("width", width + marginLeft + marginRight)
            .attr("height", height + marginTop + marginBottom);
        this.innerCanvas = this.outerCanvas.append("g")
            .attr("transform",
                `translate(${this.marginLeft}, ${this.marginTop})`)
            .attr("width", width)
            .attr("height", height);
        this.chart = this.innerCanvas.append("g")
            .attr("stroke", "currentColor")
            .attr("stroke-linecap", "round");

        this.xAxisGroup = this.innerCanvas.append("g");
        this.yAxisGroup = this.innerCanvas.append("g");

    }

    // Doing data join, enter, update, exit
    render() {
        const candles = this.chart.selectAll("g")
            .data(this.presentingData)
        //transform to the correct x positions based on the x scale

        candles.exit().remove();

        candles.enter().append("line")

    }

    dataCleaning(data) {
        // Remove all the data points that have missing values.
        // Maybe sort the data ??
        const cleaned = [];
        data.forEach(d => {
            const { open, high, low, close, volume, date } = d;
            const isCompelte = open && high && low && close && volume && date;

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

    dailySnapshot(start, end, stride=1) {
        return d3.utcDays(start, end+1, stride);
    }

    weekdaysSnapshot(start, end, stride=1) {
        return d3.utcMonday
            .every(stride)
            .range(start, end+1)
            .filter(d => d.getUTCday() !== 0 && d.getUTCDay() !== 6);
    }

    weeklySnapshot(start, end, stride=1) {
        return d3.utcMonday.every(stride).range(start, end+1)
    }


    monthlySnapshot(start, end, stride=1) {
        return d3.utcMonths(start, end+1, stride);
    }

    yearlySnapshot(start, end, stride=1) {
        return d3.utcYear(start, end+1, stride);
    }

}