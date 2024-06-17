<template>
  <div>
    <!-- Display the spinner when loading fire API output -->
    <div v-if="loadingData" class="spinner">
      <div></div>
    </div>
    <div
      class="container"
      v-if="
        !loadingData && selected && !aqiForecastPresent && !dangerRatingPresent
      "
    >
      <h5 class="title is-5">
        No data available for
        <strong
          >{{ selected.name }}
          <span v-if="selected.alt_name">
            ({{ selected.alt_name }})
          </span></strong
        >
      </h5>
    </div>
    <div class="container" v-if="!loadingData && selected">
      <h5 class="title is-5">
        Current conditions for
        <strong
          >{{ selected.name }}
          <span v-if="selected.alt_name">
            ({{ selected.alt_name }})
          </span></strong
        >
      </h5>
      <div class="content is-size-4">
        <p v-if="dangerRatingPresent">
          <a
            href="https://en.wikipedia.org/wiki/National_Fire_Danger_Rating_System"
            >Fire danger</a
          >
          level is
          <span
            class="fire-danger-rating"
            :style="{
              backgroundColor: apiOutput.cfd.color,
              color:
                apiOutput.cfd.type === 'Low' || apiOutput.cfd.type === 'Extreme'
                  ? '#fff'
                  : '#000',
            }"
          >
            {{ apiOutput.cfd.type }}
          </span>
          &nbsp;&mdash;
          <span class="fire-danger-level" v-html="dangerRating"></span>
        </p>

        <table v-if="aqiForecastPresent" class="table">
          <caption>
            Air Quality Index forecast,
            {{
              selected.name
            }}
            <span v-if="selected.alt_name"> ({{ selected.alt_name }}) </span>
          </caption>
          <thead>
            <tr>
              <th scope="col">6-hour AQI</th>
              <th scope="col">12-hour AQI</th>
              <th scope="col">24-hour AQI</th>
              <th scope="col">48-hour AQI</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                :style="{
                  backgroundColor: aqiName(apiOutput.aqi_6.aqi).bg,
                  color: aqiName(apiOutput.aqi_6.aqi).fg,
                }"
              >
                {{ apiOutput.aqi_6.aqi }} &mdash;
                {{ aqiName(apiOutput.aqi_6.aqi).name }}
              </td>
              <td
                :style="{
                  backgroundColor: aqiName(apiOutput.aqi_12.aqi).bg,
                  color: aqiName(apiOutput.aqi_12.aqi).fg,
                }"
              >
                {{ apiOutput.aqi_12.aqi }}&mdash;
                {{ aqiName(apiOutput.aqi_12.aqi).name }}
              </td>
              <td
                :style="{
                  backgroundColor: aqiName(apiOutput.aqi_24.aqi).bg,
                  color: aqiName(apiOutput.aqi_24.aqi).fg,
                }"
              >
                {{ apiOutput.aqi_24.aqi }}&mdash;
                {{ aqiName(apiOutput.aqi_24.aqi).name }}
              </td>
              <td
                :style="{
                  backgroundColor: aqiName(apiOutput.aqi_48.aqi).bg,
                  color: aqiName(apiOutput.aqi_48.aqi).fg,
                }"
              >
                {{ apiOutput.aqi_48.aqi }}&mdash;
                {{ aqiName(apiOutput.aqi_48.aqi).name }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Display "hist_fire" section -->
        <div v-if="apiOutput.hist_fire">
          <p>Historical fires in this place:</p>
          <ul>
            <li v-for="(year, fire) in apiOutput.hist_fire" :key="fire">
              <strong>{{ fire }},</strong> {{ year }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

const fireDangerLevels = {
  Low: `Fuels do not ignite readily from small firebrands although a more intense heat source, such as lightning, may start fires in duff or light fuels.`,
  Moderate: `Fires can start from most accidental causes, but with the exception of lightning fires in some areas, the number of starts is generally low.`,
  High: `All fine dead fuels ignite readily and fires start easily from most causes.`,
  "Very High": `Fires start easily from all causes and, immediately after ignition, spread rapidly and increase quickly in intensity.`,
  Extreme: `Fires start quickly, spread furiously, and burn intensely. All fires are potentially serious.`,
  "No data at this location.": ``,
};

export default {
  name: "FireAPIOutput",
  computed: {
    aqiForecastPresent() {
      return (
        this.apiOutput &&
        this.apiOutput.aqi_6 &&
        this.apiOutput.aqi_12 &&
        this.apiOutput.aqi_24 &&
        this.apiOutput.aqi_48
      );
    },
    dangerRatingPresent() {
      return this.apiOutput && this.apiOutput.cfd && this.apiOutput.cfd.type;
    },
    dangerRating() {
      return fireDangerLevels[this.apiOutput.cfd.type];
    },
    ...mapGetters({
      selected: "selected",
      apiOutput: "apiOutput",
      loadingData: "loadingData",
    }),
  },
  methods: {
    aqiName(aqi) {
      if (!aqi) {
        throw "Undefined AQI in aqiName";
      }
      if (aqi < 51) {
        return { name: "Good", bg: "rgb(0, 228, 0)", fg: "#000" };
      }
      if (aqi < 101) {
        return { name: "Moderate", bg: "rgb(255, 255, 0)", fg: "#000" };
      }
      if (aqi < 151) {
        return {
          name: "Unhealthy for sensitive groups",
          bg: "rgb(255, 126, 0)",
          fg: "#000",
        };
      }
      if (aqi < 201) {
        return { name: "Unhealthy", bg: "rgb(255, 0, 0)", fg: "#fff" };
      }
      if (aqi < 301) {
        return { name: "Very Unhealthy", bg: "rgb(143, 63, 151)", fg: "#fff" };
      }
      if (aqi >= 301) {
        return { name: "Hazardous", bg: "rgb(126, 0, 35)", fg: "#fff" };
      }
    },
  },
};
</script>

<style scoped lang="scss">
.fire-danger-rating {
  display: inline-block;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
}

.spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 25vh;
}

.spinner div {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
