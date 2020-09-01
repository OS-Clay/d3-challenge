var svgWidth = 500;
var svgHeight = 500;

var margin = {
  top: 40,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;


var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);



// MAKE SURE TO FIND CORRECT domain
var chosenYAxis = "obesity";


function yScale(govData, chosenYAxis) {

  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(govData, d => d[chosenYAxis]) * 0.3,
      d3.max(govData, d => d[chosenYAxis]) * 0.8
    ])
    .range([0, height]);

  return yLinearScale;

}

// MIGHT NOT NEED THIS AS IT OS FOR TRANSITION



function renderAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}


function renderCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}


d3.csv("static/data.csv").then(function(govData, err) {
  if (err) throw err;

  console.log(govData);


  govData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.obesity = +data.obesity;
    data.healthcare = +data.healthcare;
  });


  var yLinearScale = yScale(govData, chosenYAxis);


  var xLinearScale = d3.scaleLinear()
    .domain([0, d3.max(govData, d => d.poverty)])
    .range([height, 0]);


  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);


// end of fix 1

  var yAxis = chartGroup.append("g")
    .call(leftAxis);


  chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);


  var circlesGroup = chartGroup.selectAll("circle")
    .data(govData)
    .enter()
    .append("circle")
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("r", 10)
    .attr("fill", "blue")
    .attr("opacity", ".5");




  var labelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - margin.left)
    .attr("y", 0 - (height / 2))
    .attr("dy", "1em");


  var obesityLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "obesity")
    .classed("active", true)
    .text("Obesity %");

  var healthcareLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "healthcare")
    .classed("inactive", true)
    .text("healthcare %");

  // append x axis
  chartGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + 40})`)
    .classed("axis-text", true)
    .text("% Poverty");




  labelsGroup.selectAll("text")
    .on("click", function() {

      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {


        chosenYAxis = value;


        yLinearScale = yScale(govData, chosenYAxis);


        yAxis = renderAxes(yLinearScale, yAxis);


        circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);


        if (chosenYAxis === "") {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});
