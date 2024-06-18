import Vue from "vue";
import Vuex from "vuex";
import _ from "lodash";
import axios from "axios";

Vue.use(Vuex);

const apiUrl = process.env.VUE_APP_SNAP_API_URL || "https://earthmaps.io";

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
  value,
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
  let targetLayerIndex = _.findIndex(state.layers, (layer) => layer.id === id);
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
    pendingHttpRequests: 0,

    // List of all places defined in the application.
    places: undefined,

    // The current place selected by the user.
    selected: undefined,

    // Output from Fire API endpoint
    apiOutput: undefined,

    // Fire count for the season
    fireCount: 0,

    // Total acres burned for the season
    acresBurned: 0,

    // Fires burning within ~50mi
    firesNearby: undefined,
  },
  mutations: {
    // This function is used to initialize the layers in the store.
    setLayers(state, layers) {
      var restructuredlayers = [];

      // Set some defaults for state/instance-based properties
      _.each(layers, (layer) => {
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
        payload.setTo,
      );
    },
    setLayerVisibility(state, { id, visible }) {
      const layer = state.layers.find((layer) => layer.id === id);
      layer.visible = visible;
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
    },
    setPlaces(state, places) {
      state.places = places;
    },
    setSelected(state, selected) {
      state.selected = selected;
    },
    setApiOutput(state, apiOutput) {
      state.apiOutput = apiOutput;
    },
    setLoading(state, loading) {
      state.loading = loading;
    },
    setFireCount(state, fireCount) {
      state.fireCount = fireCount;
    },
    setAcresBurned(state, acresBurned) {
      state.acresBurned = acresBurned;
    },
    setFiresNearby(state, firesNearby) {
      state.firesNearby = firesNearby;
    },
    clearSelected(state) {
      state.selected = undefined;
    },
  },
  getters: {
    // Returns true if there are pending HTTP requests
    loadingData(state) {
      return state.pendingHttpRequests > 0;
    },
    places(state) {
      return state.places;
    },

    selected(state) {
      return state.selected;
    },

    apiOutput(state) {
      return state.apiOutput;
    },
    name: (state, getters) => {
      let place = _.find(state.places, {
        id: getters.place.id,
      });
      if (place) {
        let name = place.name;
        if (place.alt_name) {
          name += " (" + place.alt_name + ")";
        }
        return name;
      }
    },
    fireCount(state) {
      return state.fireCount;
    },
    acresBurned(state) {
      // Format number with commas.
      // https://stackoverflow.com/questions/2901102/how-to-format-a-number-with-commas-as-thousands-separators
      return state.acresBurned.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    firesNearbyCount(state) {
      return (
        parseInt(state.firesNearby[0].data.totalFeatures) +
        parseInt(state.firesNearby[1].data.totalFeatures)
      );
    },
    firesNearbyNames(state) {
      // Initialize an empty array to store the names
      let names = [];

      state.firesNearby.forEach((fireData) => {
        fireData.data.features.forEach((feature) => {
          console.log(feature.property.name);
          // Push the name property of each feature to the names array
          names.push(feature.property.name);
        });
      });

      // Return the array of names
      return names;
    },
  },
  actions: {
    async fetchCommunities(context) {
      let queryUrl = apiUrl + "/places/communities";
      let returnedData = await axios.get(queryUrl);
      context.commit("setPlaces", returnedData);
    },
    async fetchFireAPI(context, payload) {
      let queryUrl =
        apiUrl + "/fire/point/" + payload.latitude + "/" + payload.longitude;
      let returnedData = await axios.get(queryUrl);
      context.commit("setApiOutput", returnedData.data);
    },
  },
});
