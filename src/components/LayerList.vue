<template>
  <div>
    <div class="boundary-selector">
      <div class="boundary-label">Choose a boundary</div>
      <div class="dropdown" :class="{ 'is-active': isDropdownActive }">
        <div class="dropdown-trigger">
          <button
            class="button is-fullwidth has-text-left"
            aria-haspopup="true"
            aria-controls="dropdown-menu"
            @click="toggleDropdown"
          >
            <span class="dropdown-text">{{ selectedBoundary || "Off" }}</span>
            <span class="icon is-small">
              <i class="fas fa-angle-down" aria-hidden="true"></i>
            </span>
          </button>
        </div>
        <div class="dropdown-menu" id="dropdown-menu" role="menu">
          <div class="dropdown-content">
            <a
              class="dropdown-item"
              :class="{
                'is-disabled':
                  selectedBoundary === 'Off' || selectedBoundary === null,
              }"
              @click="selectBoundary('Off')"
              >Off</a
            >
            <a
              class="dropdown-item"
              :class="{ 'is-disabled': selectedBoundary === 'GMUs' }"
              @click="selectBoundary('GMUs')"
              >GMUs</a
            >
          </div>
        </div>
      </div>
    </div>
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
      <li>
        <map-layer id="spruceadj_3338"></map-layer>
      </li>
      <hr />
      <h3 class="title is-4 top">Air Quality Index (AQI)</h3>
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
          id="alfresco_relative_flammability_cru_ts40_historical_1950_2008_iem"
        ></map-layer>
      </li>
      <li>
        <map-layer
          id="alfresco_relative_flammability_NCAR-CCSM4_rcp85_2070_2099"
        ></map-layer>
      </li>
    </ul>
  </div>
</template>

<script>
import MapLayer from "./MapLayer";
import { mapGetters } from "vuex";
import "@fortawesome/fontawesome-free/css/all.css";

export default {
  name: "LayerList",
  components: {
    "map-layer": MapLayer,
  },
  data() {
    return {
      isDropdownActive: false,
      selectedBoundary: null,
    };
  },
  created() {
    const layers = this.$route.query.layers
      ? this.$route.query.layers.split(",")
      : [];
    if (layers.includes("16")) {
      this.selectedBoundary = "GMUs";
    }
  },
  methods: {
    toggleDropdown() {
      this.isDropdownActive = !this.isDropdownActive;
    },
    selectBoundary(boundary) {
      // Prevents the dropdown from causing an error when selecting the same option
      // since we are attempting to remove a layer's numericId that is not currently visible
      if (
        boundary === this.selectedBoundary ||
        (boundary === "Off" && this.selectedBoundary === null)
      ) {
        this.isDropdownActive = false;
        return;
      }

      this.selectedBoundary = boundary;
      this.isDropdownActive = false;

      // We can add more boundaries here as desired
      if (boundary === "GMUs") {
        this.$store.commit("setLayerVisibility", {
          id: "gmu",
          visible: true,
          router: this.$router,
        });
        // Refresh map layers when GMUs are selected
        this.$root.$emit("refresh-map-layers");
      } else if (boundary === "Off") {
        this.$store.commit("setLayerVisibility", {
          id: "gmu",
          visible: false,
          router: this.$router,
        });

        this.$root.$emit("refresh-map-layers");
      }
    },
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
.boundary-selector {
  margin-bottom: 1.5rem;
}

.boundary-label {
  font-size: 1.25rem;
  color: #363636;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.dropdown {
  margin-bottom: 0;

  .button {
    background-color: #fff;
    border: 1px solid #dbdbdb;
    color: #363636;
    padding: 0.5rem 1rem;
    height: auto;
    font-size: 1.25rem;
    transition: border-color 0.15s ease-in-out;

    &:hover {
      border-color: #b5b5b5;
    }

    &:focus {
      border-color: #485fc7;
      box-shadow: 0 0 0 0.125em rgba(72, 95, 199, 0.25);
    }
  }

  .dropdown-text {
    margin-right: 0.5rem;
  }

  .icon {
    color: #7a7a7a;
  }

  .dropdown-menu {
    background-color: #fff;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1);
    padding: 0.5rem 0;
  }

  .dropdown-item {
    color: #363636;
    padding: 0.5rem 1rem;
    font-size: 1.25rem;
    cursor: pointer;

    &:hover:not(.is-disabled) {
      background-color: #f5f5f5;
      color: #363636;
    }

    &.is-disabled {
      color: #b5b5b5;
      cursor: not-allowed;
      pointer-events: none;
    }
  }
}
</style>
