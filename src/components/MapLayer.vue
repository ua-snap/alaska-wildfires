<template>
  <div
    :id="id"
    :class="{
      sublayer: id.includes('smoke_forecast'),
      layer: !id.includes('smoke_forecast'),
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
  props: ["id", "controls"],
  computed: {
    layer() {
      // Helper to return a layer from the ordered array of layers.
      let targetLayerIndex = _.findIndex(
        this.$store.state.layers,
        (layer) => layer.id === this.id
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
  },
  methods: {
    toggleLayer() {
      this.$store.commit("toggleLayerVisibility", {
        id: this.id,
      });
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
  cursor: hand;
  span.drag {
    cursor: grab;
    color: #888;
  }
}

.sublayer {
  margin: 5px 15px;
  cursor: pointer;
  cursor: hand;
  span.drag {
    cursor: grab;
    color: #888;
  }
}

.visible {
  font-weight: 900;
  text-shadow: #fc0 1px 0 10px;
}

.layer-title {
  display: inline-block;
  padding-left: 1ex;

  & span {
    color: #666;
    padding: 0;
    margin: 0;
  }
}
</style>
