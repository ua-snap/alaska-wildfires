<template>
  <div>
    <h3 class="title is-4 top">Now{{ fireUpdateText }}</h3>
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
      <hr />
      <li>
        <map-layer id="purple_air"></map-layer>
      </li>
      <li>
        <div class="layer-title">
          Air quality forecast<br /><span class="when">{{
            aqiUpdateText
          }}</span>
        </div>
        <ul class="aqi-forecast-list">
          <li><map-layer small="small" id="aqi_forecast_6_hrs"></map-layer></li>
          <li>
            <map-layer small="small" id="aqi_forecast_12_hrs"></map-layer>
          </li>
          <li>
            <map-layer small="small" id="aqi_forecast_24_hrs"></map-layer>
          </li>
          <li>
            <map-layer small="small" id="aqi_forecast_48_hrs"></map-layer>
          </li>
        </ul>
      </li>
      <hr />
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
        <map-layer id="historical_fire_perimeters"></map-layer>
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
import { mapGetters } from "vuex";

export default {
  name: "LayerList",
  components: {
    "map-layer": MapLayer,
  },
  computed: {
    fireUpdateText() {
      return this.lastDataUpdate
        ? " (updated " + this.lastDataUpdate + ")"
        : "";
    },
    aqiUpdateText() {
      return this.aqiUpdate ? "starting at " + this.aqiUpdate : "";
    },
    ...mapGetters({ lastDataUpdate: "lastDataUpdate", aqiUpdate: "aqiUpdate" }),
  },
};
</script>

<style lang="scss" scoped>
ul {
  font-size: 1.25rem;
}
h3.is-4 {
  margin: 2rem 0 0.5rem;
  &.top {
    margin-top: 0;
  }
}
.layer-title {
  padding-left: 1ex;
  font-weight: 500;
  line-height: 1;
  color: #000;
  span.when {
    display: inline-block;
    font-size: 1.15rem;
    font-weight: 400;
    margin-bottom: 0.25rem;
  }
}
hr {
  margin: 0.75rem 0 0.5rem;
}
</style>
