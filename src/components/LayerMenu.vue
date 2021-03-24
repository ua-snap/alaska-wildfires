<template>
  <div class="layer-menu">
    <label @click="toggleLayerMenu()">
      <a v-show="layerMenuVisibility">Hide menu</a>
      <a v-show="!layerMenuVisibility">Show menu</a>
    </label>
    <div v-show="layerMenuVisibility" class="menu-wrapper">
      <layer-list></layer-list>
    </div>
  </div>
</template>

<script>
import LayerList from "./LayerList";

export default {
  name: "LayerMenu",
  props: ["map"],
  components: {
    "layer-list": LayerList
  },
  computed: {
    layerMenuVisibility() {
      return this.$store.state.layerMenuVisibility;
    }
  },
  methods: {
    toggleLayerMenu() {
      this.$store.commit("toggleLayerMenu");
    }
  }
};
</script>

<style lang="scss" scoped>
.layer-menu {
  z-index: 500;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: inset 0 5px 5px -5px rgba(0, 0, 0, 0.5);
  position: absolute;
  top: 0;
  left: 0;

  .menu-wrapper {
    margin-top: 1em;
  }
}
</style>
