<script setup>
import Nav from "./components/Nav.vue";
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header style="height: 150px; border-bottom: 5px solid rgb(220,0,24);">
        <Nav/>
      </el-header>
      <router-view/>
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
</style>
