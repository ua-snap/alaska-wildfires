import Vue from "vue";
import Vuex from "vuex";
import _ from "lodash";
import axios from "axios";
import moment from "moment";

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

    // Fires nearby object containing fires from ~70 miles around the selected location
    nearbyFires: undefined,

    // JSON of layer update status
    // Loaded async from {publicRoot}/status.json,
    // which is refreshed by an external process that will
    // update the S3 bucket in production.
    updateStatus: undefined,
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
      router: VueRouter instance,

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
      // Add numeric IDs of all visible layers to the URL as GET parameters
      let visibleLayers = state.layers
        .map((layer) => (layer.visible ? layer.numericId : null))
        .filter((index) => index !== null);

      // Update the URL with the visible layers
      if (payload.router) {
        payload.router.replace({
          query: {
            ...payload.router.query,
            layers: visibleLayers.join(","),
          },
        });
      }
    },
    hideAllLayers(state) {
      state.layers.forEach((layer) => {
        layer.visible = false;
      });
    },
    setLayerVisibility(state, { id, numericId, visible, router }) {
      let layer_id;
      if (id) {
        layer_id = id;
      } else if (numericId >= 0) {
        let foundLayer = state.layers.find(
          (layer) => layer.numericId === parseInt(numericId),
        );
        layer_id = foundLayer.id;
      } else {
        console.error("No layer id or index provided to setLayerVisibility");
      }
      const layer = state.layers.find((layer) => layer.id === layer_id);
      layer.visible = visible;
      Vue.set(state.layers);

      if (router) {
        let visibleLayers = state.layers
          .map((layer) => (layer.visible ? layer.numericId : null))
          .filter((index) => index !== null);

        router.replace({
          query: {
            ...router.query,
            layers:
              visibleLayers.length > 0 ? visibleLayers.join(",") : undefined,
          },
        });
      }
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
    setFireCount(state, fireCount) {
      state.fireCount = fireCount;
    },
    setAcresBurned(state, acresBurned) {
      state.acresBurned = acresBurned;
    },
    setNearbyFires(state, nearbyFires) {
      state.nearbyFires = nearbyFires;
    },
    setUpdateStatus(state, updateStatus) {
      state.updateStatus = updateStatus;
    },
    clearSelected(state) {
      state.selected = undefined;
      state.apiOutput = undefined;
      state.nearbyFires = undefined;
    },
  },
  getters: {
    // Returns true if there are pending HTTP requests
    loadingData(state) {
      return state.pendingHttpRequests > 0;
    },
    fireUpdateDate(state) {
      if (state.updateStatus) {
        return moment(state.updateStatus.updated, "YYYYMMDDHH");
      }
    },
    lastDataUpdate(state, getters) {
      if (state.updateStatus) {
        return getters.fireUpdateDate.format("ha, MMMM D");
      }
    },
    aqiUpdate(state) {
      if (state.updateStatus) {
        return moment(
          state.updateStatus.layers.aqi_forecast.updated,
          "YYYYMMDDHH",
        ).format("ha, MMMM D");
      }
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
      if (state.firesNearby && state.firesNearby[0] && state.firesNearby[1]) {
        return (
          parseInt(state.firesNearby[0].data.totalFeatures) +
          parseInt(state.firesNearby[1].data.totalFeatures)
        );
      }
      return undefined;
    },
    firesNearbyNames(state) {
      // Initialize an empty array to store the names
      let names = [];
      state.firesNearby.forEach((fireData) => {
        fireData.data.features.forEach((feature) => {
          // Push the name property of each feature to the names array
          names.push(feature.properties.NAME);
        });
      });

      // Return the array of names
      return names;
    },
    nearbyFires(state) {
      return state.nearbyFires;
    },
  },
  actions: {
    async fetchCommunities(context) {
      let queryUrl = apiUrl + "/places/communities?tags=awe";
      let returnedData = await axios.get(queryUrl);
      context.commit("setPlaces", returnedData);
    },
    async fetchFireAPI(context, payload) {
      let community = payload.community;
      // Get API data
      let queryUrl =
        apiUrl +
        "/fire/point/" +
        community.latitude +
        "/" +
        community.longitude;
      let returnedData = await axios.get(queryUrl).catch(() => {
        // If the API call fails, redirect to the home page
        payload.router.push("/");

        // Reload the front page to clear the app state
        payload.router.go(0);
      });

      if (returnedData) {
        context.commit("setApiOutput", returnedData.data);

        // Get the list of nearby fires (~70 miles around the selected location) from the API
        let nearbyFires = [
          ...returnedData.data.fire_points,
          ...returnedData.data.fire_polygons,
        ];
        // Filter for only active fires
        nearbyFires = _.filter(nearbyFires, (fire) => {
          return fire.properties.active == "1";
        });
        // Sort by size
        nearbyFires = _.sortBy(nearbyFires, [
          (fire) => {
            return fire.properties.acres;
          },
        ]);
        // ...and reverse so biggest are first.
        nearbyFires = _.reverse(nearbyFires);
        context.commit("setNearbyFires", nearbyFires);
      }
    },
    async fetchUpdateStatus(context) {
      let queryUrl = process.env.BASE_URL + "status.json";
      let updateStatus = await axios.get(queryUrl);
      context.commit("setUpdateStatus", updateStatus.data);
    },
  },
});
