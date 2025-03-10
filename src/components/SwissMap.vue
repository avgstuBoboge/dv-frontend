<script setup>
import {onMounted, ref} from "vue";
import * as d3 from "d3";
import * as topojson from "topojson-client";

const svgContainer = ref(null);

onMounted(async () => {
  const width = 800;
  const height = 600;

  const topoData = await d3.json("/geo/switzerland_cantons.geojson");

  const objectKey = Object.keys(topoData.objects)[0];
  const geoData = topojson.feature(topoData, topoData.objects[objectKey]);

  const svg = d3
      .select(svgContainer.value)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

  const projection = d3.geoMercator()
      .center([8.2275, 46.8182])
      .scale(10000)
      .translate([width / 2, height / 2]);
  const path = d3.geoPath().projection(projection);

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("padding", "5px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0);

  svg.selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", (d, i) => colorScale(i))
      .attr("fill-opacity", 0.5)
      .attr("stroke", "#666")
      .attr("stroke-width", 1)
      .on("mouseover", function (event, d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("fill-opacity", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 2);
        tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);
        tooltip.html(`<strong>${d.properties.name}</strong><br/>GDP: $<em>(placeholder)</em>`)
            .style("color", "red")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
      })
      .on("mousemove", function (event) {
        tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function () {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("fill-opacity", 0.5)
            .attr("stroke", "#666")
            .attr("stroke-width", 1);
        tooltip.transition()
            .duration(200)
            .style("opacity", 0);
      });
});
</script>

<template>
  <div ref="svgContainer"></div>
</template>

<style scoped>
div {
  width: 100%;
  max-width: 800px;
  margin: auto;
}

.tooltip {
  font-size: 14px;
  font-family: sans-serif;
}
</style>
