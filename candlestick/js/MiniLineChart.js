class MiniLineChart {
    constructor(chartArea, dimComfigs, data) {
        const { width, height } = dimComfigs;
        const { marginLeft, marginRight, marginTop, marginBottom } = dimComfigs;

        this.width = width;
        this.height = height;
        this.marginLeft = marginLeft;
        this.marginRight = marginRight;
        this.marginTop = marginTop;
        this.marginBottom = marginBottom;

        this.data = this.dataCleaning(data);

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
            .attr("style",
                `max-width: 100%; 
            height: auto; height: intrinsic;`)
        this.innerCanvas = this.outerCanvas.append("g")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("transform",
                `translate(${this.marginLeft}, ${this.marginTop})`)

        this.chart = this.innerCanvas.append("g")
        //.attr("width", this.width)
        //.attr("height", this.height);

        this.xAxisGroup = this.innerCanvas.append("g")
        this.yAxisGroup = this.innerCanvas.append("g")

        const xDomain = [
            d3.min(this.data, d => d.date), d3.max(this.data, d => d.date)];
        const yDomain = [
            d3.min(this.data, d => d.close), d3.max(this.data, d => d.close)];

        this.xScale = d3.scaleTime()
            .domain(xDomain).range([0, this.width]);
        this.yScale = d3.scaleLinear()
            .domain(yDomain).range([this.height, 0]);

        this.xAxisCall = d3.axisBottom(this.xScale).ticks(5)
            .tickFormat(d => d.toDateString());
        this.xAxisGroup.call(this.xAxisCall)
            .attr("transform", `translate(0, ${this.height})`);

        this.render();
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
            const isCompelte =
                close !== undefined &&
                date !== undefined;

            if (!isCompelte) return;

            cleaned.push(
                {
                    close: Number(close),
                    date: new Date(date)
                }
            )
        })

        return cleaned.sort(
            (dat1, dat2) => dat1.date.getTime() - dat2.date.getTime());
    }
}