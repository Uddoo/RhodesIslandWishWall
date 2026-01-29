<template>
  <div id="app">
    <WishWall />
  </div>
</template>

<script setup lang="ts">
import WishWall from './components/WishWall.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style>
