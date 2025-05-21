<script setup>
import { onMounted, ref, watch } from "vue";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import store from "../store.js";

const svgContainer = ref(null);

onMounted(async () => {
  const width = 800;
  const height = 600;

  const topoData = await d3.json(import.meta.env.BASE_URL + "/geo/switzerland_cantons.geojson");
  const objectKey = Object.keys(topoData.objects)[0];
  const geoData = topojson.feature(topoData, topoData.objects[objectKey]);

  const svg = d3
      .select(svgContainer.value)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

  svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .lower()
      .on("click", () => {
        store.state.regionStack = [];
      });

  const g = svg.append("g");

  const projection = d3
      .geoMercator()
      .center([8.2275, 46.8182])
      .scale(10000)
      .translate([width / 2, height / 2]);
  const path = d3.geoPath().projection(projection);

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("padding", "5px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0);

  const regions = g.selectAll("path")
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
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0.9);
        tooltip
            .html(`<strong>${d.properties.name}</strong><br/>GDP: $<em>(placeholder)</em>`)
            .style("color", "red")
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
      })
      .on("mousemove", function (event) {
        tooltip
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        let currentStack = store.state.regionStack;
        let highlightIds = [];
        if (store.state.comparing) {
          const len = currentStack.length;
          if (len > 0) highlightIds.push(currentStack[len - 1].id);
          if (len > 1) highlightIds.push(currentStack[len - 2].id);
        } else {
          if (currentStack.length) highlightIds.push(currentStack[currentStack.length - 1].id);
        }
        if (!highlightIds.includes(this.__data__.id)) {
          d3.select(this)
              .transition()
              .duration(200)
              .attr("fill-opacity", 0.5)
              .attr("stroke", "#666")
              .attr("stroke-width", 1);
        }
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0);
      })
      .on("click", function (event, d) {
        event.stopPropagation();
        if (
            store.state.regionStack.length === 0 ||
            store.state.regionStack[store.state.regionStack.length - 1].id !== d.id
        ) {
          store.commit("pushRegion", {
            name: d.properties.name,
            id: d.id,
          });
        }
      });

  const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
  svg.call(zoom);

  watch(
      () => store.state.regionStack,
      (newStack) => {
        let highlightIds = [];
        if (store.state.comparing) {
          const len = newStack.length;
          if (len > 0) highlightIds.push(newStack[len - 1].id);
          if (len > 1) highlightIds.push(newStack[len - 2].id);
        } else {
          if (newStack.length) highlightIds.push(newStack[newStack.length - 1].id);
        }
        regions.each(function (d) {
          if (highlightIds.includes(d.id)) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("fill-opacity", 1)
                .attr("stroke", "black")
                .attr("stroke-width", 2);
          } else {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("fill-opacity", 0.5)
                .attr("stroke", "#666")
                .attr("stroke-width", 1);
          }
        });
      },
      { immediate: true, deep: true }
  );
});
</script>

<template>
  <el-card>
    <div ref="svgContainer" class="svg-container"></div>
  </el-card>
</template>

<style scoped>
.svg-container {
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
  margin: auto;
}

.tooltip {
  font-size: 14px;
  font-family: sans-serif;
}
</style>