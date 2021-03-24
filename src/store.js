import Vue from "vue";
import Vuex from "vuex";
import _ from "lodash";

Vue.use(Vuex);

// Helper function to set WMS properties for a layer.
var setWmsProperties = (state, layer, properties) => {
  if (_.isFunction(layer.wmsLayerName)) {
    Vue.set(layer, "wms", layer.wmsLayerName(properties).name);
    Vue.set(layer, "time", layer.wmsLayerName(properties).time);
    Vue.set(layer, "title", layer.wmsLayerName(properties).title);
  } else {
    // Don't need to ensure deep watchers see this change -- static layer name
    layer.wms = layer.wmsLayerName;
  }
};

// Helper function to toggle visiblity properties on the
// store for either left or right map pane
var swapVisibility = (
  state,
  targetLayer,
  targetLayerIndex,
  propName,
  value
) => {
  // If we're explicitly setting the value, do so.
  if (value === true || value === false) {
    targetLayer[propName] = value;
  } else {
    // Or, switch.
    targetLayer[propName] = !targetLayer[propName];
  }

  Vue.set(state.layers, targetLayerIndex, targetLayer);
};

// Helper to return a layer from the ordered array of layers.
var getLayerIndexById = (state, id) => {
  let targetLayerIndex = _.findIndex(state.layers, layer => layer.id === id);
  return targetLayerIndex;
};

export default new Vuex.Store({
  state: {
    // Layers is an array of objects which
    // define the layers and visibility for each layer
    layers: [],

    // Should the layer menu be shown?
    layerMenuVisibility: true,

    // True if the app knows that there are still outstanding
    // data requests (used on map splash screen)
    pendingHttpRequests: 0
  },
  mutations: {
    // This function is used to initialize the layers in the store.
    setLayers(state, layers) {
      var restructuredlayers = [];

      // Set some defaults for state/instance-based properties
      _.each(layers, layer => {
        // Default visibility on left/right maps to off
        layer.visible = layer.visible || false;
        setWmsProperties(state, layer, layer.defaults);
        restructuredlayers.push(layer);
      });
      state.layers = restructuredlayers;
    },
    /* Payload is an object with these properties:
    {
      // id: Layer id
      id: '',

      // If `undefined`, toggles current state.
      // If `true` or `false`, sets the layer's visibility
      // to that value.
      setTo: undefined
    } */
    toggleLayerVisibility(state, payload) {
      // Identify the layer in the array
      let targetLayerIndex = getLayerIndexById(state, payload.id);
      swapVisibility(
        state,
        state.layers[targetLayerIndex],
        targetLayerIndex,
        "visible",
        payload.setTo
      );
    },
    /*

    Triggered when a parameterized layer's configuration changes.

    payload.layer is the layer name
    payload.properties is whatever the configuration GUI presents.

    */
    updateLayer(state, payload) {
      let layer = state.layers[getLayerIndexById(state, payload.layer)];
      setWmsProperties(state, layer, payload.properties);
    },
    reorderLayers(state, layers) {
      state.layers = layers;
    },
    toggleLayerMenu(state) {
      state.layerMenuVisibility = !state.layerMenuVisibility;
    },
    showLayerMenu(state) {
      state.layerMenuVisibility = true;
    },
    hideLayerMenu(state) {
      state.layerMenuVisibility = false;
    },
    incrementPendingHttpRequest(state) {
      state.pendingHttpRequests++;
    },
    decrementPendingHttpRequest(state) {
      state.pendingHttpRequests--;
    }
  },
  getters: {
    // Returns true if there are pending HTTP requests
    loadingData(state) {
      return state.pendingHttpRequests > 0;
    }
  }
});
