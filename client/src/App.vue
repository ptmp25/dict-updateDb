<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Header from './components/Header.vue'
import M from 'materialize-css'
import { onMounted } from 'vue'
onMounted(() => {
  M.AutoInit()
})
</script>

<template>
  <header>
    <Header />
  </header>
  <RouterView />
</template>
