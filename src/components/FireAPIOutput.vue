<template>
  <div class="container" v-if="selected && apiOutput">
    <h5 class="title is-5">
      Current conditions for
      <strong
        >{{ selected.name }}
        <span v-if="selected.alt_name">
          ({{ selected.alt_name }})
        </span></strong
      >
      <strong v-if="selected.region">, {{ selected.region }}</strong>
    </h5>
    <div class="content is-size-4">
      <p>
        <a
          href="https://en.wikipedia.org/wiki/National_Fire_Danger_Rating_System"
          >Fire danger</a
        >
        level is
        <span
          class="fire-danger-rating"
          :style="{
            backgroundColor: apiOutput.cfd.color,
          }"
          >{{ apiOutput.cfd.type }}</span
        >&nbsp;&mdash;
        <span class="fire-danger-level" v-html="dangerRating"></span>
      </p>

      <table
        v-if="
          apiOutput.aqi_6 &&
          apiOutput.aqi_12 &&
          apiOutput.aqi_24 &&
          apiOutput.aqi_48
        "
        class="table"
      >
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
    dangerRating() {
      return fireDangerLevels[this.apiOutput.cfd.type];
    },
    ...mapGetters({
      selected: "selected",
      apiOutput: "apiOutput",
    }),
  },
  methods: {
    aqiName(aqi) {
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
      return { name: "Hazardous", bg: "rgb(126, 0, 35)", fg: "#fff" };
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
</style>
