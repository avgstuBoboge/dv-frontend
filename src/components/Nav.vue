<script setup>
import {computed} from "vue";
import {useRoute} from "vue-router";
import store from "../store.js"

const route = useRoute()
const activeIndex = computed(() => {
  if (route.path.endsWith('/overview')) return '1'
  if (route.path.endsWith('/ranking')) return '2'
  return ''
})

function handlePush(route) {
  store.state.router.push(route);
}

const logoUrl = import.meta.env.BASE_URL + 'swiss-flag.png';

</script>

<template>
  <div class="nav-container">
    <div class="head-container">
      <div class="logo-container">
        <el-image
            style="height: 100px;"
            :src="logoUrl"
            fit="contain"/>
      </div>
      <h1>Happiness Index Across Swiss Cantons</h1>
    </div>
    <el-menu mode="horizontal" :active="activeIndex" :default-active="activeIndex">
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