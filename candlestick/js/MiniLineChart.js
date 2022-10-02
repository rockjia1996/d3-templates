class MiniLineChart {
    constructor(chartArea, dimComfigs, brushConfigs, data) {
        this.dimComfigs = dimComfigs;
        this.brushConfigs = brushConfigs;

        const { width, height } = this.dimComfigs;
        const { marginLeft, marginRight, marginTop, marginBottom } = dimComfigs;
        this.data = this.dataCleaning(data);

        this.outerCanvas = d3.select(chartArea).append("svg")
            .attr("width", width + marginLeft + marginRight)
            .attr("height", height + marginTop + marginBottom)
            .attr("viewBox",
                [
                    0, 0,
                    width + marginRight + marginRight,
                    height + marginTop + marginBottom
                ])
            .attr("style",`max-width:100%; height: auto; height: intrinsic;`)

        this.innerCanvas = this.outerCanvas.append("g")
            .attr("width", width)
            .attr("height", height)
            .attr("transform",
                `translate(${marginLeft}, ${marginTop})`)

        this.chart = this.innerCanvas.append("g")
            .attr("width", width)
            .attr("height", height)

        this.brushGroup = this.innerCanvas.append("g")
        this.xAxisGroup = this.innerCanvas.append("g")
        this.yAxisGroup = this.innerCanvas.append("g")

        const xDomain = [
            d3.min(this.data, d => d.date), d3.max(this.data, d => d.date)];
        const yDomain = [
            d3.min(this.data, d => d.close), d3.max(this.data, d => d.close)];

        this.xScale = d3.scaleTime()
            .domain(xDomain).range([0, width]);
        this.yScale = d3.scaleLinear()
            .domain(yDomain).range([height, 0]);


        this.xAxisCall = d3.axisBottom(this.xScale).ticks(5)
            .tickFormat(d => d.toDateString());
        this.xAxisGroup.call(this.xAxisCall)
            .attr("transform", `translate(0, ${height})`);


        this.brushCall = d3.brushX()
            .extent([[0, 0], [width, height]])

        this.brushCall
            .on("brush", d => {
                const dates = 
                    this.enforceBrushLimit(d.selection[0], d.selection[1]) 
                this.brushConfigs.onBrush(dates[0], dates[1])
            })
            .on("end", (d) => {
                const dates = 
                    this.enforceBrushLimit(d.selection[0], d.selection[1]) 
                this.brushConfigs.onBrush(dates[0], dates[1])
            })


        this.brushGroup
            .call(this.brushCall)
            .call(this.brushCall.move,
                [
                    this.data.length <= 365
                        ? this.xScale(this.data[0].date)
                        : this.xScale(this.data.at(-365).date),
                    width
                ])

        this.render();
    }

    enforceBrushLimit(xLeft, xRight, maxDataPoints=600) {
        const bisect = d3.bisector(dat => dat.date);
        const { width, height } = this.dimComfigs;

        let start = this.xScale.invert(xLeft);
        let end = this.xScale.invert(xRight);
        const startIndex = bisect.left(this.data, start);
        const endIndex = bisect.left(this.data, end);

        if (endIndex - startIndex > maxDataPoints) {
            const brushCenter = xLeft + 0.5 * (xRight - xLeft)

            const brushWidth = width -
                (this.data.length <= maxDataPoints
                    ? this.xScale(this.data[0].date)
                    : this.xScale(this.data.at(-600).date))


            const moveTo = [
                brushCenter - 0.49 * brushWidth,
                brushCenter + 0.49 * brushWidth
            ]

            this.brushGroup
                .call(this.brushCall)
                .call(this.brushCall.move, moveTo)
            let start = this.xScale.invert(moveTo[0]);
            let end = this.xScale.invert(moveTo[1]);

            return [start, end] 
        }
        else 
            return [start, end]
    }

    render() {
        const line = this.chart.selectAll(".line").data([this.data])
        const lineMapper = d3.line()
            .x(d => this.xScale(d.date))
            .y(d => this.yScale(d.close))

        line.exit().remove()

        line
            .attr("d", d => lineMapper(d))
            .attr("fill", "none")
            .attr("stroke", "#36394D")
            .attr("stroke-width", "1.3px")

        line.enter().append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d => lineMapper(d))
    }

    dataCleaning(data) {
        // Remove all the data points that have missing values.
        // And sort the given data based on date
        const cleaned = [];
        data.forEach(d => {
            const { close, date } = d;
            const isCompelte = close !== undefined && date !== undefined;
            if (!isCompelte) return;
            cleaned.push({ close: Number(close), date: new Date(date) });
        })
        return cleaned.sort((d1, d2) => d1.date.getTime() - d2.date.getTime());
    }
}