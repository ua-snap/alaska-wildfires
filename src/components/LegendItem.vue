<template>
  <div :class="{ visible: layer.visible }" class="legend--item block">
    <h4 class="title is-5" v-html="layer.title"></h4>
    <div class="columns content">
      <div
        class="column"
        v-bind:class="
          layer.legendClassOverride ? layer.legendClassOverride : 'is-one-fifth'
        "
      >
        <div v-html="layer.legend"></div>
      </div>
      <div class="column">
        <div v-html="layer.abstract"></div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from "lodash";

export default {
  name: "LegendItem",
  props: ["id"],
  computed: {
    layer() {
      // Helper to return a layer from the ordered array of layers.
      let targetLayerIndex = _.findIndex(
        this.$store.state.layers,
        (layer) => layer.id === this.id
      );
      return this.$store.state.layers[targetLayerIndex];
    },
  },
};
</script>

<style lang="scss" scoped>
.legend--item {
  display: none;
  &.visible {
    display: block;
    padding-top: 1rem;
  }
}
</style>
