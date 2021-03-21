<template>
  <div class="layer-menu">
    <label @click="toggleLayerMenu()">
      <a v-show="layerMenuVisibility">Hide menu</a>
      <a v-show="!layerMenuVisibility">Show menu</a>
    </label>
    <div v-show="layerMenuVisibility" class="menu-wrapper">
      <layer-list></layer-list>
      <div class="map-tools form-inline">
        <div class="custom-buttons">
          <layer-menu-button-item
            :class="{ enabled: dualMaps }"
            classes="mobile-hidden"
            :callback="toggleDualMaps"
            text="Show two maps"
          ></layer-menu-button-item>
          <layer-menu-button-item
            v-for="(button, index) in buttons"
            :key="index"
            :id="button.id"
            :classes="button.classes"
            :callback="button.callback"
            :text="button.text"
          ></layer-menu-button-item>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LayerList from "./LayerList";
import LayerMenuButtonItem from "./LayerMenuButtonItem";

export default {
  name: "LayerMenu",
  props: ["map", "buttons"],
  components: {
    "layer-list": LayerList,
    "layer-menu-button-item": LayerMenuButtonItem
  },
  computed: {
    dualMaps() {
      return this.$store.state.dualMaps;
    },
    layerMenuVisibility() {
      return this.$store.state.layerMenuVisibility;
    }
  },
  methods: {
    toggleLayerMenu() {
      this.$store.commit("toggleLayerMenu");
    },
    toggleDualMaps() {
      this.$store.commit("toggleDualMaps");
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

  .custom-buttons {
    margin: 1em 0;
  }

  .map-tools {
    margin: 1em 0;

    ::v-deep {
      .dual-maps {
        margin-left: 2em;
      }
      .mobile-hidden {
        @media screen and (max-width: 768px) {
          display: none;
        }
      }
      &.enabled button {
        color: #23527c;
        font-weight: 700;
        text-shadow: #fc0 1px 0 10px;
      }
    }
  }

  .menu-wrapper {
    margin-top: 1em;
  }
}
</style>
