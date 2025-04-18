<script setup>
import {ref} from "vue";

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
    <h3>Region Information</h3>
    <p>Details about the selected region will be shown here.</p>
  </el-card>
</template>

<style scoped>

</style>