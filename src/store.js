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

    // Fires nearby object containing fires from ~70 miles around the selected location
    nearbyFires: undefined,
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
    setNearbyFires(state, nearbyFires) {
      state.nearbyFires = nearbyFires;
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
      let queryUrl = apiUrl + "/places/communities";
      let returnedData = await axios.get(queryUrl);
      context.commit("setPlaces", returnedData);
    },
    async fetchFireAPI(context, payload) {
      // Get API data
      let queryUrl =
        apiUrl + "/fire/point/" + payload.latitude + "/" + payload.longitude;
      let returnedData = await axios.get(queryUrl);
      context.commit("setApiOutput", returnedData.data);

      // Get Nearby Fires
      const wfsUrl = "https://gs.mapventure.org/geoserver/wfs";

      // Define parameters for the WFS requests
      // For filtering against points
      var pointParams = {
        service: "WFS",
        version: "1.1.0",
        request: "GetFeature",
        typeName: "alaska_wildfires:fire_points",
        cql_filter: `Dwithin(the_geom, Point(${payload.longitude} ${payload.latitude}), 1, statute miles)`,
        outputFormat: "json",
      };

      // For filtering against polygons
      var polygonParams = {
        service: "WFS",
        version: "1.1.0",
        request: "GetFeature",
        typeName: "alaska_wildfires:fire_polygons",
        // GeoServer only supports degrees, so this is a query
        // for ~70 mile radius.
        // https://gis.stackexchange.com/questions/132251/dwithin-wfs-filter-is-not-working
        cql_filter: `Dwithin(the_geom, Point(${payload.longitude} ${payload.latitude}), 1, statute miles)`,
        outputFormat: "json",
      };

      let nearbyFires = []; // will be both results, merged
      let nearbyPointFires = await axios.get(wfsUrl, {
        params: pointParams,
      });
      let nearbyPolygonFires = await axios.get(wfsUrl, {
        params: polygonParams,
      });
      if (nearbyPointFires.data.features) {
        nearbyFires = nearbyPointFires.data.features;
      }
      if (nearbyPolygonFires.data.features) {
        nearbyFires = [...nearbyFires, ...nearbyPolygonFires.data.features];
      }
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
    },
  },
});
