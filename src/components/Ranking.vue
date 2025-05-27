<script setup>
import store from '../store.js'
import {Plus} from '@element-plus/icons-vue'
import {reactive, ref, nextTick} from "vue";
import * as d3 from 'd3';

const formatKeyword = (keyword) => {
  return keyword
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
}

const options = [];
const subKeywordsMap = store.state.subKeywords;

for (const index in store.state.keywords) {
  const kw = store.state.keywords[index];
  const subKeywords = subKeywordsMap[kw] || [];
  const option = {}
  option.value = kw
  option.label = formatKeyword(kw)
  option.children = []
  for (const subKeyword of subKeywords) {
    const subOption = {
      value: subKeyword,
      label: formatKeyword(subKeyword),
    }
    option.children.push(subOption)
  }
  options.push(option)
}

const formattedTagSet = reactive(new Set());
const tagSet = new Set();
const cascaderModel = ref(null);
const formattedToOriginal = {};
const tagValueMap = reactive({});
const addTag = () => {
  if (!cascaderModel.value) {
    return;
  }
  const kw = cascaderModel.value[0];
  const subKw = cascaderModel.value[1];
  formattedToOriginal[formatKeyword(kw)] = kw;
  formattedToOriginal[formatKeyword(subKw)] = subKw;
  const word = `${formatKeyword(kw)}/${formatKeyword(subKw)}`;
  if (formattedTagSet.has(word)) {
    return;
  }
  tagValueMap[word] = ref(50); // Initialize the value for the tag
  formattedTagSet.add(word);
  tagSet.add(cascaderModel.value);
}

const deleteTag = (word) => {
  formattedTagSet.delete(word)
  const kw = formattedToOriginal[word.split('/')[0]];
  const subKw = formattedToOriginal[word.split('/')[1]];
  for (const tag of tagSet) {
    if (tag[0] === kw && tag[1] === subKw) {
      tagSet.delete(tag)
      break
    }
  }
}

let historyData = {};

const calculateRating = (regionId, year) => {
  let result = 0;
  for (const tag of tagSet) {
    const kw = tag[0];
    const subKw = tag[1];
    const ratio = tagValueMap[`${formatKeyword(kw)}/${formatKeyword(subKw)}`];
    let str = store.state.regionData?.[regionId]?.[year]?.[kw]?.[subKw] ?? '0';
    if (str === '–') str = '0';
    const value = parseFloat(str.replace(',', ''));
    if (value !== 0) {
      result += value * ratio / store.state.sumOfValues[kw][subKw][year];
      if (!historyData[regionId]) historyData[regionId] = {};
      if (!historyData[regionId][kw]) historyData[regionId][kw] = {};
      if (!historyData[regionId][kw][subKw]) historyData[regionId][kw][subKw] = {};
      historyData[regionId][kw][subKw] = value * ratio / store.state.sumOfValues[kw][subKw][year];
    } else {
      // Use historical data if current value is zero (not existing)
      result += historyData?.[regionId]?.[kw]?.[subKw] ?? 0;
    }
  }
  return result;
}

const generateData = () => {
  const data = [];
  historyData = {}; // Reset history data for each generation
  for (const year of store.state.years) {
    if (year === '2016-2018') {
      continue; // Skip the aggregated year
    }
    let maxRating = 0;
    for (const idx in store.state.regions) {
      const region = store.state.regions[idx];
      const rating = calculateRating(region.id, year);
      if (rating > maxRating) {
        maxRating = rating;
      }
    }
    if (maxRating === 0) {
      continue; // Skip years with no ratings
    }
    for (const idx in store.state.regions) {
      const region = store.state.regions[idx];
      const rating = calculateRating(region.id, year);
      data.push({
        date: new Date(year, 0, 1),
        name: region.name,
        category: region.name,
        value: rating
      });
    }
  }
  return data;
}


const generateRace = () => {
  const data = generateData()
  drawChart(data)
}
const cantonAbbrMap = {
  "Zürich": "ZH",
  "Bern/Berne": "BE",
  "Luzern": "LU",
  "Uri": "UR",
  "Schwyz": "SZ",
  "Obwalden": "OW",
  "Nidwalden": "NW",
  "Glarus": "GL",
  "Zug": "ZG",
  "Fribourg": "FR",
  "Solothurn": "SO",
  "Basel-Stadt": "BS",
  "Basel-Landschaft": "BL",
  "Schaffhausen": "SH",
  "Appenzell Ausserrhoden": "AR",
  "Appenzell Innerrhoden": "AI",
  "St. Gallen": "SG",
  "Graubünden/Grigioni": "GR",
  "Aargau": "AG",
  "Thurgau": "TG",
  "Ticino": "TI",
  "Vaud": "VD",
  "Valais/Wallis": "VS",
  "Neuchâtel": "NE",
  "Genève": "GE",
  "Jura": "JU"
};

function drawChart(data) {

  const categories = Array.from(new Set(data.map(d => d.category)));
  const fadedColors = d3.schemeCategory10.map(c =>
      d3.interpolateRgb(c, "#fff")(0.5)
  );

  const color = d3.scaleOrdinal()
      .domain(categories)
      .range(fadedColors);

  const margin = {top: 50, right: 50, bottom: 50, left: 100};
  const width = 1200 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;
  const topN = 10;

  const dataByDate = d3.group(data, d => +d.date);
  const dates = Array.from(dataByDate.keys()).sort((a, b) => a - b);

  const svg = d3.select('#chart')
      .html('')
      .append('svg')
      .attr('viewBox', [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', '100%')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  const yearText = svg.append('text')
      .attr('class', 'year-text')
      .attr('x', width)
      .attr('y', -10)
      .attr('text-anchor', 'end')
      .style('font-size', '32px')
      .style('fill', '#888');

  const x = d3.scaleLinear().range([0, width]);
  const y = d3.scaleBand().range([0, height]).padding(0.1);
  const xAxis = svg.append('g').attr('transform', `translate(0,${height})`);
  const yAxis = svg.append('g');

  let idx = 0;
  const timer = d3.interval(() => {
    if (idx >= dates.length) {
      timer.stop();
      return;
    }

    const tick = dates[idx];
    const yearData = Array.from(dataByDate.get(tick))
        .sort((a, b) => b.value - a.value)
        .slice(0, topN);

    x.domain([0, d3.max(yearData, d => d.value)]);
    y.domain(yearData.map(d => d.name));
    yAxis.transition().duration(800).call(
    d3.axisLeft(y).tickFormat(d => cantonAbbrMap[d] || d)
  );

    const bars = svg.selectAll('.bar').data(yearData, d => d.name);
    bars.enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('y', d => y(d.name))
        .attr('height', y.bandwidth())
        .attr('width', 0)
        .attr('fill', d => color(d.category))
        .merge(bars)
        .transition().duration(800)
        .attr('y', d => y(d.name))
        .attr('width', d => x(d.value))
        .attr('fill', d => color(d.category));

    bars.exit().remove();

    xAxis.transition().duration(800).call(d3.axisBottom(x));
    // yAxis.transition().duration(800).call(d3.axisLeft(y));
    // Increase font size of X axis labels
    xAxis.selectAll('text').style('font-size', '20px');

    // Increase font size of Y axis labels
    yAxis.selectAll('text').style('font-size', '20px');

    yearText.text(`Year: ${new Date(tick).getFullYear()}`);
    idx++;
  }, 2000);
}

</script>

<template>
  <el-card class="ranking-card">
    <h2> Define your own happiness weights here:</h2>
    <div style="font-size: 18px; margin-bottom: 20px">
      Add a new indicator:
      <el-cascader :options="options"
                   :show-all-levels="false"
                   clearable
                   v-model="cascaderModel"
      />
      <el-button type="primary"
                 :icon="Plus"
                 circle style="margin-left: 5px"
                 @click="addTag"
      />
    </div>
    <div
        v-for="tag in formattedTagSet"
        style="margin-bottom: 10px"
        class="slider-container"
        :key="tag"
    >
      <span class="demonstration">{{ tag }}</span>
      <el-slider v-model="tagValueMap[tag]" show-input></el-slider>
      <el-button type="danger" @click="deleteTag(tag)">Delete</el-button>
    </div>
    <div>
      <el-button type="primary" @click="generateRace">
        Generate the race chart
      </el-button>
    </div>
    <div id="chart" style="width:100%; height:600px; margin-top:20px;"></div>
  </el-card>
</template>

<style scoped>
.ranking-card {
  width: 60%;
  margin: 20px auto auto;
  padding: 16px;
}

.slider-container {
  max-width: 800px;
  display: flex;
  align-items: center;
}

.slider-container .el-slider {
  margin-top: 0;
  margin-left: 12px;
}

.slider-container .el-button {
  margin-top: 0;
  margin-left: 12px;
}

.slider-container .demonstration {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 44px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 0;
}

.slider-container .demonstration + .el-slider {
  flex: 0 0 50%;
}
</style>