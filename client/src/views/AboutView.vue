<template>
  <div class="card bg-base-100 w-10/12 my-2.5 shadow-xl mx-auto">
    <div class="card-body">
      <div class="card-title">{{ username }} page</div>
      <p>This page is authored by {{ username }}. Welcome to my profile where I demonstrate my coding skills and projects!
      </p>
    </div>
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
