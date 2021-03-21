<template>
  <div id="app">
    <h1>Alaska Wildfires: Past, Present &amp; Future</h1>
    <FireMap></FireMap>
  </div>
</template>

<script>
import FireMap from "@/components/FireMap.vue";

export default {
  name: "App",
  components: {
    FireMap
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
