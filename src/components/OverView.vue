<script setup>
import SwissMap from "./SwissMap.vue";
import SideBarRight from "./SideBarRight.vue";
import SideBarLeft from "./SideBarLeft.vue";
</script>

<template>
  <el-container>
    <el-aside width="15%" class="side-bar-left">
      <SideBarLeft/>
    </el-aside>
    <el-container>
      <el-main style="padding-top: 0">
        <SwissMap/>
      </el-main>
    </el-container>
    <el-aside width="20%" class="side-bar-right">
      <SideBarRight/>
    </el-aside>
  </el-container>
</template>

<style scoped>
.side-bar-left {
  background-color: #f0f0f0;
  padding: 10px;
}
</style>