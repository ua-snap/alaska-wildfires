<template>
  <div class="container">
    <!-- Display "cfd" section -->
    <div v-if="data.cfd" class="section">
      <h3 class="title is-6">{{ data.cfd.title }}</h3>
      <p>Code: {{ data.cfd.code }}</p>
      Color:
      <div
        class="color-box"
        :style="{
          backgroundColor: data.cfd.color,
        }"
      ></div>
      <p>Fire Risk Level: {{ data.cfd.type }}</p>
    </div>

    <!-- Display "hist_fire" section -->
    <div v-if="data.hist_fire" class="section">
      <h3>Historical Fire Data</h3>
      <ul>
        <li v-for="(year, fire) in data.hist_fire" :key="fire">
          <strong>{{ fire }}:</strong> {{ year }}
        </li>
      </ul>
    </div>

    <!-- Display "lc" section -->
    <div v-if="data.lc" class="section">
      <h3 class="title is-6">{{ data.lc.title }}</h3>
      <p>Code: {{ data.lc.code }}</p>
      Color:
      <div
        :style="{
          backgroundColor: data.lc.color,
          width: '50px',
          height: '20px',
          display: 'inline-block',
        }"
      ></div>
      <p>Type: {{ data.lc.type }}</p>
    </div>

    <!-- Display "lc" section -->
    <div
      v-if="data.aqi_6 && data.aqi_12 && data.aqi_24 && data.aqi_48"
      class="section"
    >
      <h3 class="title is-6">AQI Forecast & PM2.5 Concentration</h3>
      <p>6 hour AQI: {{ data.aqi_6.aqi }}</p>
      <p>12 hour AQI: {{ data.aqi_12.aqi }}</p>
      <p>24 hour AQI: {{ data.aqi_24.aqi }}</p>
      <p>48 hour AQI: {{ data.aqi_48.aqi }}</p>
      <p>
        6 hour PM2.5 Concentration: {{ data.aqi_6.pm25_conc }} &micro;g/m&sup3;
      </p>
      <p>
        12 hour PM2.5 Concentration:
        {{ data.aqi_12.pm25_conc }} &micro;g/m&sup3;
      </p>
      <p>
        24 hour PM2.5 Concentration:
        {{ data.aqi_24.pm25_conc }} &micro;g/m&sup3;
      </p>
      <p>
        48 hour PM2.5 Concentration:
        {{ data.aqi_48.pm25_conc }} &micro;g/m&sup3;
      </p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "FireAPIOutput",
  data() {
    return {
      data: {},
    };
  },
  computed: {
    ...mapGetters({
      apiOutput: "apiOutput",
    }),
  },
  watch: {
    apiOutput: function () {
      this.data = this.apiOutput;
    },
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-wrap: wrap;
}

.section {
  flex: 0 0 20%; /* Adjust width as needed */
  margin: 0 10px;
}

.color-box {
  width: 50px;
  height: 20px;
  display: inline-block;
}
</style>
