<template>
  <div
    :id="id"
    :class="{
      sublayer: id.includes('aqi_forecast'),
      layer: !id.includes('aqi_forecast'),
      small: small,
    }"
  >
    <!-- Below, we need @click.prevent because of this: https://github.com/vuejs/vue/issues/3699 -->

    <!-- Layer title! -->
    <span class="layer-title">
      <a @click.prevent="toggleLayer(id)">
        <span v-if="layer.visible">&#10003;&nbsp;</span>
        <span
          v-html="layer.title"
          :class="{
            visible: layer.visible,
          }"
        >
        </span>
      </a>
    </span>

    <!-- Blurb for extra info if activated -->
    <span
      class="layer-blurb"
      v-if="layer.visible && layer.blurb"
      v-html="layer.blurb"
    ></span>

    <!-- If there is a custom layer configuration renderer, show here. -->
    <span v-if="controls && layer.visible">
      <keep-alive>
        <component
          v-bind:is="customConfigurationRenderer"
          @change="handleLayerConfigChange"
          :defaults="rendererDefaults"
        ></component>
      </keep-alive>
    </span>
  </div>
</template>

<script>
// Import custom widgets that may be used.
import MonthSelector from "@/components/MonthSelector";
import _ from "lodash";

export default {
  name: "MapLayer",
  props: ["id", "controls", "small"],
  computed: {
    layer() {
      // Helper to return a layer from the ordered array of layers.
      let targetLayerIndex = _.findIndex(
        this.$store.state.layers,
        (layer) => layer.id === this.id,
      );
      return this.$store.state.layers[targetLayerIndex];
    },
    customConfigurationRenderer() {
      // Right now, there's just the one custom renderer for
      // selecting time slices.  If needed, refactor
      // this to be more general later!
      return MonthSelector;
    },
    rendererDefaults() {
      return this.layer.defaults;
    },
    sublayers() {
      // Helper to return all sublayers
      return this.$store.state.layers.filter((layer) =>
        layer.id.includes("aqi_forecast"),
      );
    },
  },
  methods: {
    toggleLayer() {
      if (this.id.includes("aqi_forecast")) {
        this.sublayers.forEach((layer) => {
          // When an AQI forecast layer is toggled, turn off all other AQI forecast layers.
          if (layer.id !== this.id) {
            this.$store.commit("setLayerVisibility", {
              id: layer.id,
              visible: false,
            });
          }
        });
      }
      this.$store.commit("toggleLayerVisibility", { id: this.id });
    },
    handleLayerConfigChange(data) {
      // Update defaults so when
      // the controls configuration changes,
      // state is preserved when the
      // control is rerendered (toggle layer)
      this.layer.defaults = data;
      this.$store.commit("updateLayer", {
        layer: this.id,
        properties: data,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.layer {
  margin: 5px 0;
  cursor: pointer;
}

.sublayer {
  margin: 5px 15px;
  cursor: pointer;
  &.small {
    margin: 0 15px;
    font-size: 1.25rem;
  }
}

.visible {
  font-weight: 900;
  text-shadow: #f4d609 1px 1px 7px, #f4d609 -1px -1px 7px;
}

.layer-title {
  display: inline-block;
  padding-left: 1ex;

  & span {
    color: #33a;
    padding: 0;
    margin: 0;
  }
}

.layer-blurb {
  display: block;
  font-weight: 300;
  font-size: 1.10rem;
  margin-left: 2rem;
  line-height: 1.1;
}
</style>
