<template>
  <div>
    <h2 class="title is-3">Turn on a map layer to see fire data.</h2>
    <h3 class="subtitle is-4">Now</h3>

    <ul>
      <li>
        <map-layer id="fires"></map-layer>
      </li>
      <li>
        <map-layer id="viirs"></map-layer>
      </li>
      <li>
        <map-layer id="postgis_lightning"></map-layer>
      </li>
      <li>
        <map-layer id="snow_cover_3338"></map-layer>
      </li>
    </ul>

    <h3 class="subtitle is-4">Past + future</h3>

    <ul>
      <li>
        <map-layer id="alaska_landcover_2015"></map-layer>
      </li>
      <li>
        <map-layer id="gridded_lightning" controls="months"></map-layer>
      </li>
      <li>
        <map-layer id="historical_fire_perimiters"></map-layer>
      </li>
      <li>
        <map-layer id="alaska_wildfires"></map-layer>
      </li>
      <li>
        <map-layer id="alfresco_relative_flammability_NCAR-CCSM4_rcp85_2000_2099"></map-layer>
      </li>
    </ul>
  </div>
</template>

<script>
import MapLayer from "./MapLayer";

export default {
  name: "LayerList",
  components: {
    "map-layer": MapLayer
  }
};
</script>

<style lang="scss" scoped>
h3.is-4 {
  margin: 1rem 0 0.25rem;
}
</style>
