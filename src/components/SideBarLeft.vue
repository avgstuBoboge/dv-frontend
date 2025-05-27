<script setup>
import store from '../store.js'

const formatKeyword = (keyword) => {
  return keyword
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
}

const activeKeywordYear = (kw, year) => {
  store.state.activeKeyword = kw
  store.state.activeYear = year
}
</script>

<template>
  <el-menu class="el-menu-demo">
    <el-sub-menu v-for="kw in store.state.keywords" :index="kw">
      <template #title>{{ formatKeyword(kw) }}</template>
      <el-menu-item
          v-for="year in store.state.keywordYears[kw]"
          :index="kw + '-' + year"
          @click="activeKeywordYear(kw, year)"
      >
        {{ year }}
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<style scoped>

</style>