<script setup>
import {ref} from "vue";
import store from "../store.js";

const comparing = ref(false);
</script>

<template>
  <el-card>
    <el-switch
        size="large"
        v-model="comparing"
        active-text="Compare Cantons"
        inactive-text="Single Canton"
    />
    <template v-if="comparing">

    </template>
    <template v-else>
      <h3>Region Information</h3>
      <template v-if="store.state.selectedRegion.id">
        <h4>Region: {{ store.state.selectedRegion.name }}</h4>
      </template>
      <template v-else>
        <p>Details about the selected region will be shown here.</p>
      </template>
    </template>
  </el-card>
</template>

<style scoped>

</style>