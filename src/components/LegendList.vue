<template>
  <div>
    <h3 class="title is-2">Layer information</h3>
    <legend-item id="fires"></legend-item>
    <legend-item id="viirs"></legend-item>
    <legend-item id="postgis_lightning"></legend-item>
    <legend-item id="spruceadj_3338"></legend-item>
    <legend-item id="snow_cover_3338"></legend-item>
    <legend-item id="alaska_landcover_2015"></legend-item>
    <legend-item id="gridded_lightning"></legend-item>
    <legend-item id="historical_fire_perimiters"></legend-item>
    <legend-item
      id="alfresco_relative_flammability_NCAR-CCSM4_rcp85_2000_2099"
    ></legend-item>
  </div>
</template>

<script>
import LegendItem from "./LegendItem";
export default {
  name: "LegendList",
  components: {
    "legend-item": LegendItem,
  },
};
</script>

<style lang="scss" scoped>
h3 {
  margin-top: 2rem;
}
</style>
