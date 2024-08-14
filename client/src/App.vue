<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Header from './components/Header.vue'
</script>

<template>
  <header>
    <Header />
  </header>
  <RouterView />
  <!-- <footer class="footer bg-neutral text-neutral-content items-center p-4">
    <aside class="grid-flow-col items-center">
      <p>Copyright © 2024 - All right reserved</p>
    </aside>
    <nav class="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
      <router-link to="/">Home</router-link>
      <a>
        <router-link to="/about">About</router-link>
      </a>
    </nav>
  </footer> -->
</template>
