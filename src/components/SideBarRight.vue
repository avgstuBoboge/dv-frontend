<script setup>
import {computed, ref, watch} from 'vue'
import store from "../store.js"
import {Chart} from '@antv/g2'

const comparing = ref(false);
const lastSelectedRegion = computed(() => {
  const stack = store.state.regionStack;
  return stack.length > 0 ? stack[stack.length - 1] : {};
});
const lastSelectedRegionUrl = computed(() => {
  const region = lastSelectedRegion.value;
  return region.id ? `/com-480-project-Ficciones/region/${region.id}` : '';
});

const secondToLastSelectedRegion = computed(() => {
  const stack = store.state.regionStack
  return stack.length > 1 ? stack[stack.length - 2] : {}
});
const secondToLastSelectedRegionUrl = computed(() => {
  const region = secondToLastSelectedRegion.value;
  return region.id ? `/com-480-project-Ficciones/region/${region.id}` : '';
});
const regionInfo = computed(() => {
  const kw = store.state.activeKeyword
  const yr = store.state.activeYear
  const id = lastSelectedRegion.value.id
  return (store.state.data[kw]?.[yr]?.[id]) || {}
})
const regionInfo2 = computed(() => {
  const kw = store.state.activeKeyword
  const yr = store.state.activeYear
  const id = secondToLastSelectedRegion.value.id
  return (store.state.data[kw]?.[yr]?.[id]) || {}
})

watch(
    [comparing, regionInfo, regionInfo2],
    async ([cmp]) => {
      if (!cmp || !secondToLastSelectedRegion.value.id) return;
      Object.entries(regionInfo.value).forEach(([key, val], idx) => {
        const id = `hist-${idx}`;
        const containerEl = document.getElementById(id);
        if (!containerEl) return;
        containerEl.innerHTML = '';
        let value2 = regionInfo2.value[key];
        if (value2 === '–') {
          value2 = 0;
        } else {
          value2 = parseFloat(value2.replace(',', ''));
        }
        let value1 = val;
        if (value1 === '–') {
          value1 = 0;
        } else {
          value1 = parseFloat(value1.replace(',', ''));
        }
        const data = [
          {
            region: secondToLastSelectedRegion.value.name,
            value: value2
          },
          {
            region: lastSelectedRegion.value.name,
            value: value1
          }
        ];
        const chart = new Chart({
          container: containerEl,
          autoFit: true,
          height: 400
        });
        chart.interval()
            .data(data)
            .encode('x', 'region')
            .encode('y', 'value')
            .encode('color', 'region')
        chart.render();
      });
    },
    {immediate: true, flush: 'post'}
);
</script>

<template>
  <el-card class="sidebar-right">
    <el-switch
        size="large"
        v-model="comparing"
        active-text="Compare Cantons"
        inactive-text="Single Canton"
        @click="store.state.regionStack = []; store.state.comparing = comparing"
    />

    <template v-if="comparing">
      <h3 v-if="secondToLastSelectedRegion.id">Comparing Regions</h3>
      <div v-if="secondToLastSelectedRegion.id">
        <h4>Region 1: {{ secondToLastSelectedRegion.name }}</h4>
        <div v-for="([key, value], idx) in Object.entries(regionInfo2)" :key="idx">
          <p><strong>{{ key }}:</strong> {{ value }}</p>
        </div>
        <el-link
            type="primary"
            underline="always"
            :href="secondToLastSelectedRegionUrl"
        >
          Click here to see the details...
        </el-link>
        <h4>Region 2: {{ lastSelectedRegion.name }}</h4>
        <div v-for="([key, value], idx) in Object.entries(regionInfo)" :key="idx">
          <p><strong>{{ key }}:</strong> {{ value }}</p>
        </div>
        <el-link
            type="primary"
            underline="always"
            :href="lastSelectedRegionUrl"
        >
          Click here to see the details...
        </el-link>
        <div
            v-for="([key], idx) in Object.entries(regionInfo)"
            :key="key"
            class="chart-item"
        >
          <h4>{{ key }}</h4>
          <div :id="`hist-${idx}`" class="histogram"></div>
        </div>
      </div>
      <p v-else-if="lastSelectedRegion.id">Please select another region to compare.</p>
      <p v-else>Please select two regions to compare.</p>
    </template>

    <template v-else>
      <h3>Region Information</h3>
      <template v-if="lastSelectedRegion.id">
        <h4>Region: {{ lastSelectedRegion.name }}</h4>
        <div v-for="([key, value], idx) in Object.entries(regionInfo)" :key="idx">
          <p><strong>{{ key }}:</strong> {{ value }}</p>
        </div>
        <el-link
            type="primary"
            underline="always"
            :href="lastSelectedRegionUrl"
        >
          Click here to see the details...
        </el-link>
      </template>
      <template v-else>
        <p>Details about the selected region will be shown here.</p>
      </template>
    </template>
  </el-card>
</template>

<style scoped>
.sidebar-right {
  height: calc(100vh - 100px);
  overflow-y: auto;
}

.histogram {
  width: 100%;
  height: 400px;
  margin-bottom: 16px;
}
</style>