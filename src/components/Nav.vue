<script setup>
import store from "../store.js"

function handlePush(route) {
  store.state.router.push(route);
}
</script>

<template>
  <div class="nav-container">
    <div class="head-container">
      <div class="logo-container">
        <el-image
            style="height: 100px;"
            src="swiss-flag.png"
            fit="contain"/>
      </div>
      <h1>Happiness Index Across Swiss Cantons</h1>
    </div>
    <el-menu mode="horizontal" default-active="1">
      <el-menu-item index="1" style="font-size: 20px" @click="handlePush('/overview')">Overview</el-menu-item>
      <el-menu-item index="2" style="font-size: 20px" @click="handlePush('/ranking')">Ranking</el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped>
.nav-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.head-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>