<script setup>
import {computed, ref} from "vue";
import store from "../store.js";

const comparing = ref(false);
const lastSelectedRegion = computed(() => {
  const stack = store.state.regionStack;
  return stack.length > 0 ? stack[stack.length - 1] : {};
});
const secondToLastSelectedRegion = computed(() => {
  const stack = store.state.regionStack;
  return stack.length > 1 ? stack[stack.length - 2] : {};
});
</script>

<template>
  <el-card>
    <el-switch
        size="large"
        v-model="comparing"
        active-text="Compare Cantons"
        inactive-text="Single Canton"
        @click="store.state.regionStack = []; store.state.comparing = comparing"
    />
    <template v-if="comparing">
      <template v-if="secondToLastSelectedRegion.id">
        <h3>Comparing Regions</h3>
        <h4>Region 1: {{ secondToLastSelectedRegion.name }}</h4>
        <h4>Region 2: {{ lastSelectedRegion.name }}</h4>
      </template>
      <template v-else-if="lastSelectedRegion.id">
        <h3>Comparing Regions</h3>
        <h4>Region 1: {{ lastSelectedRegion.name }}</h4>
        <p>Please select a second region to compare.</p>
      </template>
      <template v-else>
        <h3>Comparing Regions</h3>
        <p>Please select two regions to compare.</p>
      </template>
    </template>
    <template v-else>
      <h3>Region Information</h3>
      <template v-if="lastSelectedRegion.id">
        <h4>Region: {{ lastSelectedRegion.name }}</h4>
      </template>
      <template v-else>
        <p>Details about the selected region will be shown here.</p>
      </template>
    </template>
  </el-card>
</template>

<style scoped>

</style>