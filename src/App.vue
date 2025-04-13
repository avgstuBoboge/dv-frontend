<script setup>
import SwissMap from "./components/SwissMap.vue";
import Nav from "./components/Nav.vue";
import SideBarLeft from "./components/SideBarLeft.vue";
import SideBarRight from "./components/SideBarRight.vue";
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header style="height: 150px; border-bottom: 5px solid rgb(220,0,24);">
        <Nav/>
      </el-header>
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
    </el-container>
  </div>
</template>

<style scoped>
.el-header {
  height: 60px; /* set a fixed height */
  overflow: hidden; /* prevent overflowing content */
  display: flex; /* align header content */
  align-items: center; /* vertically center the items */
  /* add other styles as needed */
}

.side-bar-left {
  background-color: #f0f0f0;
  padding: 10px;
}
</style>
