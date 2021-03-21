<template>
  <div id="app">
    <h1>Alaska Wildfires: Past, Present &amp; Future</h1>
    <p>
      This map shows<br>
      where current fires are and how big they are<br>
      recent hotspot and lightning strikes<br>
      historical extent of fires in Alaska<br>

    </p>
    <FireMap></FireMap>
  </div>
</template>

<style type="scss">
/* Pull in a few global things & bulma */
@import "./assets/main.scss";

@import url('https://fonts.googleapis.com/css2?family=Rubik&display=swap');

#app {
  font-family: "Rubik", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>


<script>
import FireMap from "@/components/FireMap.vue";

export default {
  name: "App",
  components: {
    FireMap
  }
};
</script>
