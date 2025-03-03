<script setup lang="ts">
import TetrisGame from './components/TetrisGame.vue'
</script>

<template>
  <div class="app">
    <h1>Vue 俄罗斯方块</h1>
    <TetrisGame />
  </div>
</template>

<style>
body {
  margin: 0;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
}

.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

h1 {
  margin-bottom: 30px;
  font-family: Arial, sans-serif;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}
</style>
