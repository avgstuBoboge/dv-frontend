<script setup>
import {useRoute} from 'vue-router'
import {reactive, ref} from 'vue'
import store from '../store.js'
import {Plus} from '@element-plus/icons-vue'
import {Chart} from "@antv/g2";

const formatKeyword = (keyword) => {
  return keyword
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
}

const route = useRoute();
const regionId = route.params.id;
const region = store.state.id2Region[regionId];
const regionData = store.state.regionData[regionId] || {};
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

const generateLineChart = () => {
  const data = [];
  const sortedYears = Object.keys(regionData).sort();
  for (const year of sortedYears) {
    for (const tag of tagSet) {
      const kw = tag[0];
      const subKw = tag[1];
      const value = regionData[year]?.[kw]?.[subKw];
      if (!value) {
        continue; // Skip if no data for this year and keyword
      }
      data.push({
        year: year,
        keyword: `${formatKeyword(kw)}/${formatKeyword(subKw)}`,
        value: value === '–' ? 0 : parseFloat(value.replace(',', '')),
      });
    }

    const containerEl = document.getElementById('line-chart');

    const chart = new Chart({
      container: containerEl,
      autoFit: true,
    });

    chart
        .data(data)
        .encode('x', 'year')
        .encode('y', 'value')
        .encode('color', 'keyword')
        .scale('x', {
          range: [0, 1],
        });

    chart.line().encode('shape', 'smooth');
    chart.point().encode('shape', 'point').tooltip(false);

    chart.render();
  }
}
</script>

<template>
  <el-card class="region-detail">
    <h2 class="text-center">Region: {{ region.name }}</h2>
    <h2 class="text-center">Explore Trends Over Time</h2>
    <div style="font-size: 18px; margin-bottom: 20px">
      Indicator:
      <el-tag
          v-for="tag in formattedTagSet"
          :key="tag"
          closable
          @close="deleteTag(tag)"
          style="margin-left: 2px; margin-right: 2px"
      >
        {{ tag }}
      </el-tag>
    </div>
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
    <div>
      <el-button type="primary" size="large" @click="generateLineChart">Generate the line chart</el-button>
    </div>
    <div id="line-chart" class="center" style="margin-top: 20px; height: 400px">
      <!-- The line chart will be rendered here -->
    </div>
  </el-card>
</template>

<style scoped>
.region-detail {
  padding: 16px;
  width: 800px;
  margin: 0 auto;
  margin-top: 20px;
}

.text-center {
  text-align: center;
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>