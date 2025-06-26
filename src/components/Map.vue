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
import mask from "@/mask.json";

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
        this.baseLayerOptions,
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
      this.getBaseMapAndLayers(),
    );

    // Add zoom controls
    this.$L.control
      .zoom({
        position: "topright",
      })
      .addTo(this.$options.leaflet.map);

    this.addLayers();

    // Add event listener for layer refresh
    this.$root.$on("refresh-map-layers", () => {
      this.refreshLayers();
    });

    // Add land mask to map to handle shift-click events
    this.$L
      .geoJSON(mask, {
        onEachFeature: (feature, layer) => {
          layer.on("click", this.onMapClick.bind(this));
          layer.on("mouseover", this.addKeyboardListeners.bind(this));
          layer.on("mouseout", this.removeKeyboardListeners.bind(this));
        },
        style: {
          opacity: 0.0,
          fillOpacity: 0.0,
        },
      })
      .addTo(this.$options.leaflet.map);

    setTimeout(() => {
      this.$options.leaflet.map.invalidateSize();
    }, 0);

    // Set visibility of layers based on query params
    let numericIds = this.$route.query.layers
      ? this.$route.query.layers.split(",")
      : [];
    if (numericIds.length > 0) {
      this.$store.commit("hideAllLayers");
      numericIds.forEach((numericId) => {
        this.$store.commit("setLayerVisibility", {
          numericId: numericId,
          visible: true,
        });
      });
    }

    // Adds an event listener to prevent layer text selection when shift-clicking on the map
    this.$options.leaflet.map
      .getContainer()
      .addEventListener("mousedown", this.preventShiftClickTextSelection);
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
      if (this.selected) {
        this.$options.leaflet.map.setView(
          [this.selected.latitude, this.selected.longitude],
          3.5,
        );
      } else if (this.selected == undefined) {
        // Reset the map back to the default view
        this.$options.leaflet.map.setView([65, -152.5], 1);
      }
      this.refreshLayers(this.layers);
    },
  },
  methods: {
    // Prevent shift-click text selection
    preventShiftClickTextSelection(e) {
      if (e.shiftKey) {
        // This prevents the default behavior of text selection when shift-clicking on the map
        e.preventDefault();

        // This prevents the event from propagating to the map click event
        e.stopPropagation();
      }
    },
    // Handle map click event
    onMapClick(e) {
      // Only fetch data if shift key is pressed
      if (e.originalEvent.shiftKey) {
        const lat = e.latlng.lat.toFixed(2);
        const lng = e.latlng.lng.toFixed(2);
        this.fetchLocationData(lat, lng);
      }
    },
    updateCursorStyle(e) {
      // Checks for shift key press to change cursor style
      if (e.key === "Shift") {
        if (e.type === "keydown") {
          this.$options.leaflet.map.getContainer().style.cursor = "pointer";
        } else if (e.type === "keyup") {
          this.$options.leaflet.map
            .getContainer()
            .style.removeProperty("cursor");
        }
      }
    },
    addKeyboardListeners() {
      document.addEventListener("keydown", this.updateCursorStyle);
      document.addEventListener("keyup", this.updateCursorStyle);
    },
    removeKeyboardListeners() {
      document.removeEventListener("keydown", this.updateCursorStyle);
      document.removeEventListener("keyup", this.updateCursorStyle);
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

        // alfresco_relative_flammability_30yr dimensions
        dim_model: layer.dim_model != null ? layer.dim_model : "",
        dim_scenario: layer.dim_scenario != null ? layer.dim_scenario : "",
      });

      // Remove old layers if present
      if (this.$options.leaflet.layers[layer.id]) {
        this.$options.leaflet.map.removeLayer(
          this.$options.leaflet.layers[layer.id],
        );
      }

      let wmsServer = layer.rasdaman
        ? process.env.VUE_APP_RASDAMAN_URL
        : process.env.VUE_APP_GEOSERVER_WMS_URL;

      this.$options.leaflet.layers[layer.id] = this.$L.tileLayer.wms(
        wmsServer,
        layerConfiguration,
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
        if (
          layer.visible &&
          !layer.wasVisible &&
          layer.wmsLayerName &&
          !layer.local
        ) {
          // Generate new cacheBuster to force a reload of the layer
          layer.cacheBuster = Math.random().toString(36).substr(2, 9);
          let layerObj = this.findLayerById(layer.id);
          if (layerObj) {
            let newParams = {
              layers: layer.wms,
              _: layer.cacheBuster,
            };

            layerObj.setParams(newParams);
          }
        } else if (_.isFunction(layer.wmsLayerName)) {
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

        // Track previous visibility for next layer toggle to prevent
        // unnecessary reloads of the layers.
        layer.wasVisible = layer.visible;

        // Explicitly order the list by specified z-index
        this.$options.leaflet.layers[layer.id].setZIndex(layer.zindex);

        // The layer is visible (added to Leaflet map) if the
        // 'visible' flag is set
        let layerVisibility = layer.visible;

        toggleLayerVisibility(
          layerVisibility,
          this.$options.leaflet.map,
          this.$options.leaflet.layers[layer.id],
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
          boxZoom: false,
          zoomControl: false,
          scrollWheelZoom: false,
          attributionControl: false,
          doubleClickZoom: false,
          dragging: !this.$L.Browser.mobile,
        },
        this.mapOptions,
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
}
.leaflet-interactive {
  cursor: inherit !important;
}
</style>
