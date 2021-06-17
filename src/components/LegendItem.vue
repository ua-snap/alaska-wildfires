<template>
  <div :class="{ visible: layer.visible }" class="legend--item block">
    <h4 class="title is-5" v-html="layer.title"></h4>
    <div v-html="layer.abstract"></div>
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
        layer => layer.id === this.id
      );
      return this.$store.state.layers[targetLayerIndex];
    }
  }
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
