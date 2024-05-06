<template>
  <div>
    <h3 class="title is-4 top">Now (updated daily)</h3>

    <ul>
      <li>
        <map-layer id="fires"></map-layer>
      </li>
      <li>
        <map-layer id="viirs"></map-layer>
      </li>
      <li>
        <map-layer id="lightning_strikes"></map-layer>
      </li>
      <li>Smoke Forecasts</li>
      <ul>
        <li><map-layer id="smoke_forecast_6hrs"></map-layer></li>
        <li><map-layer id="smoke_forecast_12hrs"></map-layer></li>
        <li><map-layer id="smoke_forecast_24hrs"></map-layer></li>
        <li><map-layer id="smoke_forecast_48hrs"></map-layer></li>
      </ul>
      <li>
        <map-layer id="spruceadj_3338"></map-layer>
      </li>
      <li>
        <map-layer id="snow_cover_3338"></map-layer>
      </li>
    </ul>

    <h3 class="title is-4">Past &amp; future</h3>

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
        <map-layer
          id="alfresco_relative_flammability_cru_ts40_historical_1900_1999_iem"
        ></map-layer>
      </li>
      <li>
        <map-layer
          id="alfresco_relative_flammability_NCAR-CCSM4_rcp85_2000_2099"
        ></map-layer>
      </li>
    </ul>
  </div>
</template>

<script>
import MapLayer from "./MapLayer";

export default {
  name: "LayerList",
  components: {
    "map-layer": MapLayer,
  },
};
</script>

<style lang="scss" scoped>
ul {
  font-size: 120%;
}
h3.is-4 {
  font-size: 150%;
  margin: 2rem 0 0.5rem;
  &.top {
    margin-top: 0;
  }
}
</style>
