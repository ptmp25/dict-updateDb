<template>
  <div class="about">
      <h1>About {{ username }}</h1>
      <p>This page is authored by {{ username }}. Welcome to my profile where I demonstrate my coding skills and projects!</p>
   </div>
</template>

<script>
export default {
  name: "UserAboutPage",
  props: ['username'], // Accept username as a prop
}
</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
