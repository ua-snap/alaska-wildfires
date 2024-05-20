<template>
  <div id="map">
    <div v-if="this.$L.Browser.mobile" class="has-text-centered">
      Use two fingers to drag the map.
    </div>
    <div id="map--leaflet-map" class="leaflet-container"></div>
  </div>
</template>

<script>
import _ from "lodash";
import { mapGetters } from "vuex";

export default {
  name: "mv-map",
  props: ["baseLayerOptions", "baseLayer", "crs", "mapOptions", "localLayers"],
  // Static property, access via this.$options.leaflet
  leaflet: {
    // Leaflet object
    map: undefined,
    // Object of Leaflet layer objects, keyed by layer ID.
    layers: {},
  },
  computed: {
    layers() {
      return this.$store.state.layers;
    },
    wmsLayerOptions() {
      return _.extend(
        {
          continuousWorld: true,
          transparent: true,
          tiled: "true",
          format: "image/png",
          version: "1.3.0",
        },
        this.baseLayerOptions
      );
    },
    map() {
      return this.$options.leaflet.map;
    },
    ...mapGetters({
      selected: "selected",
    }),
  },
  mounted() {
    // Instantiate map objects
    this.$options.leaflet.map = this.$L.map(
      "map--leaflet-map",
      this.getBaseMapAndLayers()
    );

    // Add zoom controls
    this.$L.control
      .zoom({
        position: "topright",
      })
      .addTo(this.$options.leaflet.map);

    this.addLayers();

    this.$options.leaflet.map.on("click", this.onMapClick);
  },
  watch: {
    // When layer visibility or order changes, re-render
    layers: {
      deep: true,
      handler(layers) {
        this.refreshLayers(layers);
      },
    },
    selected: function () {
      this.$options.leaflet.map.setView(
        [this.selected.latitude, this.selected.longitude],
        5
      );
    },
  },
  methods: {
    // Handle map click event
    onMapClick(e) {
      const lat = e.latlng.lat.toFixed(2);
      const lng = e.latlng.lng.toFixed(2);
      this.fetchLocationData(lat, lng);
    },
    async fetchLocationData(lat, lng) {
      try {
        const selected = {
          name: lat + ", " + lng,
          latitude: lat,
          longitude: lng,
        };
        this.$store.commit("setSelected", selected);
        this.fetchFireAPI(selected);
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    },
    async fetchFireAPI(selected) {
      await this.$store.dispatch("fetchFireAPI", selected);
    },
    // Returns the Leaflet object corresponding to the
    // requested layer ID, or, undefined if not present
    findLayerById(id) {
      return _.find(this.$options.leaflet.layers, (layerObj) => {
        return layerObj.options.id === id;
      });
    },
    // Instantiate the Leaflet layer objects
    addLayers() {
      // Create or obtain actual Leaflet objects, and add them
      // to the maps.
      _.each(this.layers, (layer) => {
        this.updateLayer(layer);
      });
    },
    // Adds WMS layer, removing a prior layer if present.
    // Some of these properties are assigned in the vue store,
    // like layer.time and layer.wms.
    addWmsLayer(layer) {
      let layerConfiguration = {};
      layerConfiguration = _.extend(this.wmsLayerOptions, {
        layers: layer.wms,
        styles: layer.styles ? layer.styles : "",
        time: layer.time ? layer.time : "",
        id: layer.id,
      });

      // Remove old layers if present
      if (this.$options.leaflet.layers[layer.id]) {
        this.$options.leaflet.map.removeLayer(
          this.$options.leaflet.layers[layer.id]
        );
      }

      this.$options.leaflet.layers[layer.id] = this.$L.tileLayer.wms(
        process.env.VUE_APP_GEOSERVER_WMS_URL,
        layerConfiguration
      );
    },
    // Triggered when a configurable layer has changed, and
    // when setting up the map.  Defines the WMS properties for the layer.
    updateLayer(layer) {
      // If the layer is a normal GeoServer layer, create
      // and add it here.
      if (layer.local !== true) {
        this.addWmsLayer(layer);
      } else {
        // Otherwise, fetch the layer from the list
        // of local layers maintained in this map.
        this.$options.leaflet.layers[layer.id] = this.localLayers[layer.id];
      }
    },
    // Reorder & update layer visibility
    // TODO: issue #134, consider if we can only update what's changed here.
    refreshLayers(layers) {
      layers = layers || this.layers;

      // Helper function to toggle layers
      var toggleLayerVisibility = (visible, map, layer) => {
        if (visible && !map.hasLayer(layer)) {
          map.addLayer(layer);
        } else if (!visible && map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      };

      // Refresh map layer contents and visibility
      // TODO it'd be nice to get rid of all this complexity.
      _.each(layers, (layer) => {
        if (_.isFunction(layer.wmsLayerName)) {
          // Update layer parameters
          let layerObj = this.findLayerById(layer.id);
          if (layerObj) {
            let newParams = {
              layers: layer.wms,
            };

            if (layer.styles) {
              _.extend(newParams, { styles: layer.styles });
            }

            if (layer.time) {
              _.extend(newParams, { time: layer.time });
            }

            // This will re-request tiles in case any of the params
            // are different, i.e. WMS-time series.
            layerObj.setParams(newParams);
          }
        }

        // Explicitly order the list by specified z-index
        this.$options.leaflet.layers[layer.id].setZIndex(layer.zindex);

        // The layer is visible (added to Leaflet map) if the
        // 'visible' flag is set
        let layerVisibility = layer.visible;

        toggleLayerVisibility(
          layerVisibility,
          this.$options.leaflet.map,
          this.$options.leaflet.layers[layer.id]
        );
      });
    },
    getBaseMapAndLayers() {
      // The _.cloneDeep is to ensure we aren't recycling
      // the Leaflet layers (breaks map)
      var baseLayer = _.cloneDeep(this.baseLayer);

      var defaultMapProperties = _.extend(
        {
          crs: this.crs,
          zoomControl: false,
          scrollWheelZoom: false,
          attributionControl: false,
          dragging: !this.$L.Browser.mobile,
        },
        this.mapOptions
      );

      // Mix together some defaults with map-specific configuration.
      return _.extend(defaultMapProperties, { layers: [baseLayer] });
    },
  },
};
</script>

<style type="scss">
#map--leaflet-map {
  display: block;
  height: 85vh;
  cursor: pointer;
}
</style>
