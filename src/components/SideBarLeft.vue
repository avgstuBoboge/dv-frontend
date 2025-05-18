<script setup>

</script>

<template>
  <el-menu class="el-menu-demo">
    <el-sub-menu index="1">
      <template #title>GDP</template>
      <el-menu-item index="1-1">2023</el-menu-item>
      <el-menu-item index="1-2">2022</el-menu-item>
      <el-menu-item index="1-3">2021</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="2">
      <template #title>Population</template>
      <el-menu-item index="2-1">2023</el-menu-item>
      <el-menu-item index="2-2">2022</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="3">
      <template #title>Mobility</template>
      <el-menu-item index="3-1">2023</el-menu-item>
      <el-menu-item index="3-2">2022</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<style scoped>

</style>