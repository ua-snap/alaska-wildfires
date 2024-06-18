<template>
  <div id="mv-ak-fires">
    <div class="columns">
      <div class="column is-one-quarter">
        <layer-list></layer-list>
      </div>
      <div class="column">
        <mv-map
          ref="map"
          :base-layer-options="baseLayerOptions"
          :base-layer="baseLayer"
          :crs="crs"
          :map-options="mapOptions"
          :local-layers="localLayers"
        ></mv-map>
        <legend-list></legend-list>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>

<script>
// For Leaflet, whose constructors are often lowercase
/* eslint new-cap: "off" */
import _ from "lodash";
import Vue from "vue";
import moment from "moment";

import store from "../store";
import mapLayers from "../layers";
import L from "leaflet";
import p4l from "proj4leaflet"; // eslint-disable-line
import leaflet_heat from "leaflet.heat"; // eslint-disable-line
import "leaflet/dist/leaflet.css";
import axios from "axios";

Object.defineProperty(Vue.prototype, "$L", { value: L });
Object.defineProperty(Vue.prototype, "$axios", { value: axios });
Object.defineProperty(Vue.prototype, "$moment", { value: moment });

const wfsUrl = "https://gs.mapventure.org/geoserver/wfs";

// Wire in two listeners that will keep track of open
// HTTP requests.
Vue.prototype.$axios.interceptors.request.use(
  function (config) {
    store.commit("incrementPendingHttpRequest");
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// Add a response interceptor
Vue.prototype.$axios.interceptors.response.use(
  function (response) {
    store.commit("decrementPendingHttpRequest");
    return response;
  },
  function (error) {
    return Promise.reject(error);
  },
);

import MvMap from "./Map";
import LegendList from "./LegendList";
import LayerList from "./LayerList";

// Leaflet objects, keep these outside of the
// scope of the Vue component for performance
// reasons
var firePolygons;
var fireMarkers;
var fireLayerGroup;
var viirsLayerGroup;
var purpleAirMarkers;
var purpleAirLayerGroup;

// Current time zone offset (used in parseDate below).
var offset = new Date().getTimezoneOffset();

const aqiColorRanges = [
  {
    max: 50,
    class: "aqi-green",
    name: "Good",
    description:
      "Air quality is satisfactory, and air pollution poses little or no risk.",
  },
  {
    max: 100,
    class: "aqi-yellow",
    name: "Moderate",
    description:
      "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.",
  },
  {
    max: 150,
    class: "aqi-orange",
    name: "Unhealthy for Sensitive Groups",
    description:
      "Members of sensitive groups may experience health effects. The general public is less likely to be affected.",
  },
  {
    max: 200,
    class: "aqi-red",
    name: "Unhealthy",
    description:
      "Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.",
  },
  {
    max: 300,
    class: "aqi-purple",
    name: "Very Unhealthy",
    description:
      "Health alert: The risk of health effects is increased for everyone.",
  },
  {
    max: 10000,
    class: "aqi-maroon",
    name: "Hazardous",
    description:
      "Health warning of emergency conditions: everyone is more likely to be affected.",
  },
];

export default {
  name: "AK_Fires",
  components: {
    MvMap,
    LayerList,
    LegendList,
  },
  computed: {
    crs() {
      return new this.$L.Proj.CRS(
        "EPSG:3338",
        "+proj=aea +lat_1=55 +lat_2=65 +lat_0=50 +lon_0=-154 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs",
        {
          resolutions: [4096, 2048, 1024, 512, 256, 128, 64],

          // Origin should be lower-left coordinate
          // in projected space.  Use GeoServer to
          // find this:
          // TileSet > Gridset Bounds > compute from maximum extent of SRS
          origin: [-4648005.934316417, 444809.882955059],
        },
      );
    },
    baseLayer() {
      return new this.$L.tileLayer.wms(
        process.env.VUE_APP_GEOSERVER_WMS_URL,
        _.extend(this.baseLayerOptions, {
          layers: "atlas_mapproxy:alaska_osm_retina",
        }),
      );
    },
    localLayers() {
      return {
        fires: fireLayerGroup,
        viirs: viirsLayerGroup,
        purple_air: purpleAirLayerGroup,
      };
    },
  },
  data() {
    return {
      mapOptions: {
        zoom: 1,
        minZoom: 1,
        maxZoom: 5,
        center: [65, -152.5],
      },
      baseLayerOptions: {
        transparent: true,
        srs: "EPSG:3338",
        format: "image/png",
        version: "1.3",
        continuousWorld: true, // needed for non-3857 projs
      },
      layers: mapLayers,
      fireJson: null,
      viirsJson: null,
      purpleAirJson: null,
      map: undefined,
    };
  },
  created() {
    // This will be the container for the fire markers & popups.
    fireLayerGroup = this.$L.layerGroup();
    viirsLayerGroup = this.$L.layerGroup();
    purpleAirLayerGroup = this.$L.layerGroup();

    // Initialize the layers!
    this.$store.commit("setLayers", this.layers);
    this.$store.commit("clearSelected");
  },
  mounted() {
    this.fetchFireData();
    this.fetchViirsData();
    this.fetchPurpleAirData();

    // Remove any stray localStorage.
    localStorage.clear();
  },
  methods: {
    // Helper function to format incoming UNIX timestamps
    // relative to browser's local time zone.  Returns Moment
    // object for formatting relevant in context.
    parseDate(t) {
      return this.$moment(parseInt(t)).utcOffset(offset);
    },

    fetchPurpleAirData() {
      // Define parameters for the WFS requests
      var params = {
        service: "WFS",
        version: "1.1.0",
        request: "GetFeature",
        typeName: "alaska_wildfires:purple_air",
        outputFormat: "json",
      };

      return new Promise((resolve) => {
        this.$axios
          .get(wfsUrl, { params })
          .then((response) => {
            if (response.data) {
              // Process the WFS data
              this.processPurpleAirData(response.data);
              this.$refs.map.refreshLayers();
              resolve();
            }
          })
          .catch((error) => {
            console.error("Error fetching WFS data:", error);
            resolve();
          });
      });
    },

    convertToAKST(utcTimestamp) {
      // Convert the UTC timestamp in seconds to milliseconds and create a Date object
      const date = new Date(utcTimestamp * 1000);

      // Convert the date to AKST (Alaska Standard Time)
      const akstDateString = date.toLocaleString("en-US", {
        timeZone: "America/Anchorage",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });

      return akstDateString;
    },

    processPurpleAirData(data) {
      // Create markers for PurpleAir data
      purpleAirMarkers = this.getPurpleAirMarkers(data);

      // Add the layer group to the map
      purpleAirLayerGroup.addLayer(this.$L.layerGroup(purpleAirMarkers));
    },
    getAqiClassInfo(aqi) {
      let classInfo;
      aqiColorRanges.every((e) => {
        if (aqi <= e.max) {
          classInfo = e;
          return false;
        }
        return true;
      });
      return classInfo;
    },
    getPurpleAirMarkers(geoJson) {
      var markers = [];

      geoJson.features.forEach((feature) => {
        const aqiClassInfo = this.getAqiClassInfo(feature.properties.aqi_24hr);

        if (_.isUndefined(aqiClassInfo)) {
          return false;
        }

        var icon = this.$L.divIcon({
          className: "aqi",
          popupAnchor: [15, -5],
          html:
            '<span class="' +
            aqiClassInfo.class +
            '">' +
            feature.properties.aqi_24hr +
            "</span>",
        });

        var marker = this.$L.marker(
          [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
          { icon: icon },
        );

        // Create popup content
        var popupContent = `
        <div class="${aqiClassInfo.class} sensor-detail">
            <p>24-hour average PM2.5 AQI at this sensor on ${this.convertToAKST(
              feature.properties.lastupdate,
            )}:
            </p>

            <span class="sensor-aqi ${aqiClassInfo.class}">${
          feature.properties.aqi_24hr
        } &mdash; ${aqiClassInfo.name}</span>
            </p>
            <p class="aqi-explain">${aqiClassInfo.description}</p>

          </div>
`;

        // Bind popup to marker
        marker.bindPopup(popupContent);

        // Push the marker to the markers array
        markers.push(marker);
      });

      return markers;
    },

    fetchViirsData() {
      // Define parameters for the WFS requests
      var params = {
        service: "WFS",
        version: "1.1.0",
        request: "GetFeature",
        typeName: "alaska_wildfires:viirs_hotspots",
        outputFormat: "json",
      };

      return new Promise((resolve) => {
        this.$axios
          .get(wfsUrl, { params })
          .then((response) => {
            if (response.data) {
              // Process the WFS data
              this.processViirsData(response.data);
              this.$refs.map.refreshLayers();
              resolve();
            }
          })
          .catch((error) => {
            console.error("Error fetching WFS data:", error);
            resolve();
          });
      });
    },
    processViirsData(data) {
      let viirsPoints = this.getViirsMarkers(data);
      viirsLayerGroup.addLayer(viirsPoints);
    },
    getViirsMarkers(geoJson) {
      // reverse lat/lng for this plugin
      var coords = [];
      _.each(geoJson.features, (feature) => {
        coords.push([
          feature.geometry.coordinates[1],
          feature.geometry.coordinates[0],
        ]);
      });
      var heatLayer = this.$L.heatLayer(coords, {
        minOpacity: 0.6,
        radius: 12,
        blur: 8,
        gradient: {
          0: "#FBF10A",
          0.9: "#FB7202",
          1: "#5F200E",
        },
      });
      return heatLayer;
    },
    fetchFireData() {
      // Define parameters for the WFS requests
      var pointParams = {
        service: "WFS",
        version: "1.1.0",
        request: "GetFeature",
        typeName: "alaska_wildfires:fire_points",
        outputFormat: "json",
      };

      var polygonParams = {
        service: "WFS",
        version: "1.1.0",
        request: "GetFeature",
        typeName: "alaska_wildfires:fire_polygons",
        outputFormat: "json",
      };

      return Promise.all([
        this.$axios.get(wfsUrl, { params: pointParams }),
        this.$axios.get(wfsUrl, { params: polygonParams }),
      ])
        .then((responses) => {
          // Process the WFS data for fire points and polygons
          this.processFirePointData(responses[0].data);
          this.processFirePolygonData(responses[1].data);
          this.$refs.map.refreshLayers();
        })
        .catch((error) => {
          console.error("Error fetching WFS data:", error);
        });
    },
    processFirePointData(data) {
      fireMarkers = this.getGeoJsonLayer(data);
      fireLayerGroup.addLayer(fireMarkers);
    },
    processFirePolygonData(data) {
      firePolygons = this.getGeoJsonLayer(data);
      fireMarkers = this.getFireMarkers(data);

      fireLayerGroup.addLayer(firePolygons);
      fireLayerGroup.addLayer(fireMarkers);
    },
    // For any polygon features, return a marker with a bound popup.
    getFireMarkers(geoJson) {
      var svgCircleTemplate = _.template(`
      <svg width="120" height="120" viewBox="0 0 120 120"
         xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="fire-gradient">
            <stop offset="0%" stop-opacity="<%= stop1opacity %>" stop-color="<%= stop1 %>"/>
            <stop offset="75%" stop-opacity="<%= stop2opacity %>" stop-color="<%= stop2 %>"/>
            <stop offset="100%" stop-opacity="<%= stop3opacity %>" stop-color="<%= stop3 %>"/>
          </radialGradient>
        </defs>

        <circle fill="url(#fire-gradient)" cx="60" cy="60" r="50"/>
      </svg>
      `);
      var activeSvgCircle = svgCircleTemplate({
        stop1: "RGB(207, 38, 47)",
        stop1opacity: ".05",
        stop2: "RGB(207, 38, 47)",
        stop2opacity: ".15",
        stop3: "RGB(207, 38, 47)",
        stop3opacity: ".35",
      });
      var inactiveSvgCircle = svgCircleTemplate({
        stop1: "RGB(80, 63, 63)",
        stop1opacity: ".05",
        stop2: "RGB(80, 63, 63)",
        stop2opacity: ".15",
        stop3: "RGB(80, 63, 63)",
        stop3opacity: ".35",
      });

      var activeFireCircle = encodeURI(
        "data:image/svg+xml," + activeSvgCircle,
      ).replace("#", "%23");
      var inactiveFireCircle = encodeURI(
        "data:image/svg+xml," + inactiveSvgCircle,
      ).replace("#", "%23");

      // Set up icon markers
      let FireIcon = this.$L.Icon.extend({
        options: {
          iconUrl: activeFireCircle,
          shadowSize: [0, 0], // no shadow!
          popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor
        },
      });

      var fireMarkers = [];
      var popupOptions = {
        maxWidth: 200,
      };

      // Compute largest to scale fire bubbles
      var smallest;
      var largest = 0;
      _.each(geoJson.features, (feature) => {
        let size = parseInt(feature.properties.acres, 10);
        if (smallest === undefined) {
          smallest = size;
        }
        if (smallest > size) {
          smallest = feature.properties.acres;
        }
        if (largest < size) {
          largest = size;
        }
      });
      // Pixel scale factor.
      var scaleFactor = 100 / largest;

      _.each(geoJson.features, (feature) => {
        if (
          feature.geometry.type === "Polygon" ||
          feature.geometry.type === "MultiPolygon"
        ) {
          // If this is a MultiPolygon, we need to "flatten" the
          // array of polygons into a single polygon before we can
          // calculatethe centroid.  The use of `[].concat.apply`
          // accomplishes this flattening by concatenating the
          // array of polygons.
          var polygonCoordinates =
            feature.geometry.type === "MultiPolygon"
              ? [].concat.apply([], feature.geometry.coordinates[0])
              : feature.geometry.coordinates[0];

          // Icon size needs to be proportionate to fire size, max 100px.
          var iconCandidateSize = feature.properties.acres * scaleFactor;
          var iconSize = iconCandidateSize < 25 ? 25 : iconCandidateSize;

          // Reverse order from what we need
          var coords = this.getCentroid2(polygonCoordinates);
          var icon = this.isFireActive(feature.properties)
            ? new FireIcon({
                iconSize: [iconSize, iconSize],
                iconAnchor: [iconSize / 2, iconSize / 2],
                className: "fire-polygon",
              })
            : new FireIcon({
                iconUrl: inactiveFireCircle,
                iconSize: [iconSize, iconSize],
                iconAnchor: [iconSize / 2, iconSize / 2],
                className: "fire-polygon",
              });

          fireMarkers.push(
            this.$L
              .marker(new this.$L.latLng([coords[1], coords[0]]), {
                icon: icon,
              })
              .bindPopup(
                this.getFireMarkerPopupContents(
                  {
                    title: feature.properties.NAME,
                    acres: feature.properties.acres,
                    cause: feature.properties.GENERALCAUSE,
                    updated: feature.properties.updated,
                    outdate: feature.properties.OUTDATE,
                    discovered: feature.properties.discovered,
                  },
                  popupOptions,
                ),
              ),
          );
        }
      });
      return this.$L.layerGroup(fireMarkers);
    },
    getGeoJsonLayer(geoJson) {
      return this.$L.geoJson(geoJson, {
        style: this.styleFirePolygons,
        pointToLayer: this.firePointFeatureHandler,
      });
    },
    styleFirePolygons(feature) {
      if (this.isFireActive(feature.properties)) {
        return {
          color: "#ff0000",
          fillColor: "#E83C18",
          opacity: 0.8,
          weight: 2,
          fillOpacity: 0.3,
        };
      } else {
        return {
          color: "#888888",
          fillColor: "#888888",
          opacity: 0.8,
          weight: 3,
          fillOpacity: 1,
        };
      }
    },
    // There's a few places in the code that are making this check,
    // and we've needed to swap it more than once to account
    // for differing upstream data.  This function implements
    // the logic to determine if a fire is active or not.
    isFireActive(fireFeatures) {
      return fireFeatures.active == 1 ? true : false;
    },
    // This handler is only used for point features (no polygon).
    // It returns a Leaflet divIcon marker with classes
    // for active/inactive, and if the size of the fire is
    // less than an acre, the class 'small' is attached.
    firePointFeatureHandler(geoJson, latLng) {
      var isActive;
      var zIndex;
      var popupOptions = {
        maxWidth: 200,
      };
      if (this.isFireActive(geoJson.properties)) {
        isActive = "active";
        zIndex = 1000;
      } else {
        isActive = "inactive";
        zIndex = 300;
      }
      var acres = parseFloat(geoJson.properties.acres).toFixed(1);
      if (acres <= 1) {
        isActive += " small";
        acres = " ";
      }
      var icon = this.$L.divIcon({
        className: isActive,
        popupAnchor: [15, -5],
        html: '<span class="' + isActive + '">' + acres + "</span>",
      });
      return this.$L
        .marker(latLng, {
          icon: icon,
          zIndexOffset: zIndex,
        })
        .bindPopup(
          this.getFireMarkerPopupContents(
            {
              title: geoJson.properties.NAME,
              acres: geoJson.properties.acres,
              cause: geoJson.properties.GENERALCAUSE,
              updated: geoJson.properties.updated,
              outdate: geoJson.properties.OUTDATE,
              discovered: geoJson.properties.discovered,
            },
            popupOptions,
          ),
        );
    },
    // For this method, fireInfo must contain properties
    // title, acres, cause, updated, outdate
    getFireMarkerPopupContents(fireInfo) {
      // Convert updated to "days ago" format; not all fires have
      // updated info, in which case, leave that blank.
      var updated = "";

      if (fireInfo.updated) {
        updated =
          '<p class="updated">Updated ' +
          this.parseDate(fireInfo.updated).fromNow() +
          ".</p>";
      }

      var acres = fireInfo.acres + " acres";
      var out = fireInfo.outdate
        ? '<p class="out">Out date: ' +
          this.parseDate(fireInfo.outdate).format("MMMM D") +
          "</p>"
        : "";
      var cause = fireInfo.cause
        ? "<h3>Cause: " + fireInfo.cause + "</h3>"
        : "";
      var discovered = fireInfo.discovered
        ? '<h3 class="discovered">Discovered ' +
          this.parseDate(fireInfo.discovered).format("MMMM D") +
          "</h3>"
        : "";

      return _.template(`
  <h1><%= title %></h1>
  <h2><%= acres %></h2>
  <%= discovered %>
  <%= cause %>
  <%= out %>
  <%= updated %>`)({
        title: fireInfo.title,
        acres: acres,
        cause: cause,
        updated: updated,
        out: out,
        discovered: discovered,
      });
    },
    // Helper function to place markers at the centroid
    // of their polygon.
    // http://stackoverflow.com/questions/22796520/finding-the-center-of-leaflet-polygon
    getCentroid2(arr) {
      var twoTimesSignedArea = 0;
      var cxTimes6SignedArea = 0;
      var cyTimes6SignedArea = 0;

      var length = arr.length;

      var x = (i) => {
        return arr[i % length][0];
      };
      var y = (i) => {
        return arr[i % length][1];
      };

      for (let i = 0; i < arr.length; i++) {
        var twoSA = x(i) * y(i + 1) - x(i + 1) * y(i);
        twoTimesSignedArea += twoSA;
        cxTimes6SignedArea += (x(i) + x(i + 1)) * twoSA;
        cyTimes6SignedArea += (y(i) + y(i + 1)) * twoSA;
      }
      var sixSignedArea = 3 * twoTimesSignedArea;
      return [
        cxTimes6SignedArea / sixSignedArea,
        cyTimes6SignedArea / sixSignedArea,
      ];
    },
  },
};
</script>

<style lang="scss">
// *** Design/content folks: don't edit these please!
// Not scoped, for editing leaflet styles

.leaflet-popup-content {
  z-index: 1000;

  h1 {
    font-size: 16pt;
    color: #322323;
    margin: 0.5rem 0 0.25rem;
    padding: 0;
  }

  h2 {
    font-size: 1rem;
    margin: 0.5rem 0;
    padding: 0;
  }

  h3 {
    font-size: 0.75rem;
    margin-bottom: 0;
    padding: 0;

    &.discovered {
      margin-top: 0;
      font-weight: 500;
    }
  }

  p.updated {
    margin-top: 0.25ex;
    font-weight: 300;
    color: #988989;
  }

  p.out {
    font-weight: 700;
    margin: 0;
  }
}

.fire-polygon {
  cursor: pointer !important;
}

div.leaflet-marker-icon span {
  font-size: 85%;
  color: white;
  font-weight: 500;
  border-radius: 1em;
  margin: 1ex;
  padding: 0.5ex;
  cursor: pointer;

  &.active {
    background-color: rgba(200, 56, 20, 0.55);
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
    z-index: 10000;
  }

  &.inactive {
    background-color: rgba(100, 100, 100, 0.6);
    z-index: 500;
  }

  &.small {
    border-radius: 50%;
    width: 1em;
    height: 1em;
    display: inline-block;
    z-index: 300;
  }
}

.sensor-detail {
  font-size: 1rem;

  span.sensor-aqi {
    font-size: 1.5rem;
    font-weight: 700;
    padding: 0.25rem 0.5rem;

    &.aqi-green {
      background-color: #67e142;
      color: #000;
    }
    &.aqi-yellow {
      background-color: #ffff00;
      color: #000;
    }
    &.aqi-orange {
      background-color: #ff7e00;
      color: #000;
    }
    &.aqi-red {
      background-color: #ff0000;
      color: #fff;
    }
    &.aqi-purple {
      background-color: #8f3f97;
      color: #fff;
    }
    &.aqi-maroon {
      background-color: #7e0122;
      color: #fff;
    }
  }
}

// Override / change some things from above
// for the AQI popups vs. the fire info popups
div.leaflet-marker-icon.aqi {
  span {
    display: inline-block;
    border-radius: 0;
    opacity: 0.75;
    min-width: 1rem;
    text-align: center;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    font-weight: 600;

    &.aqi-green {
      background-color: #67e142;
      color: #000;
    }
    &.aqi-yellow {
      background-color: #ffff00;
      color: #000;
    }
    &.aqi-orange {
      background-color: #ff7e00;
      color: #000;
    }
    &.aqi-red {
      background-color: #ff0000;
      color: #fff;
    }
    &.aqi-purple {
      background-color: #8f3f97;
      color: #fff;
    }
    &.aqi-maroon {
      background-color: #7e0122;
      color: #fff;
    }
  }
}

// Legends that use images
// Legend table styling
table.alaska-wildfires-legend {
  td {
    vertical-align: middle !important;

    // For the color blocks
    div {
      height: 2em;
      width: 2em;
    }
  }

  &.active-fires {
    img {
      min-width: 3em;
    }
  }

  &.historical-fire-perimeters {
    td div {
      &.h-40-69 {
        background-color: #cbd1ce;
        border: 2px solid #98a09c;
      }
      &.h-70-99 {
        background-color: #8f9693;
        border: 2px solid #5b6360;
      }
      &.h-00-17 {
        background-color: #5f6462;
        border: 2px solid #2b3131;
      }
    }
  }

  &.lightning-climatology {
    td div {
      &.lc-let1 {
        background-color: rgb(229, 230, 236);
      }
      &.lc-6 {
        background-color: rgb(142, 155, 186);
      }
      &.lc-13 {
        background-color: rgb(84, 115, 160);
      }
      &.lc-19 {
        background-color: rgb(98, 129, 152);
      }
      &.lc-26 {
        background-color: rgb(130, 152, 141);
      }
      &.lc-32 {
        background-color: rgb(174, 186, 145);
      }
      &.lc-39 {
        background-color: rgb(236, 236, 199);
      }
      &.lc-gte45 {
        background-color: rgb(255, 255, 255);
        border: 1px solid #ccc;
      }
    }
  }

  &.purple-air {
    td div {
      &.pa-50 {
        background-color: #67e142;
      }
      &.pa-100 {
        background-color: #ffff00;
      }
      &.pa-150 {
        background-color: #ff7e00;
      }
      &.pa-200 {
        background-color: #ff0000;
      }
      &.pa-300 {
        background-color: #8f3f97;
      }
      &.pa-3000 {
        background-color: #7e0122;
      }
    }
  }

  &.aqi-forecast {
    td div {
      &.aqi-good {
        border: 2px solid rgb(0, 228, 0);
      }
      &.aqi-moderate {
        background-color: rgb(255, 255, 0);
      }
      &.aqi-unhealthy-sg {
        background-color: rgb(255, 126, 0);
      }
      &.aqi-unhealthy {
        background-color: rgb(255, 0, 0);
      }
      &.aqi-very-unhealthy {
        background-color: rgb(143, 63, 151);
      }
      &.aqi-hazardous {
        background-color: rgb(126, 0, 35);
      }
    }
  }

  &.alaska-landcover-2015 {
    td div {
      &.l-1 {
        background-color: #003d00;
      }
      &.l-2 {
        background-color: #949c70;
      }
      &.l-3 {
        background-color: #148c3d;
      }
      &.l-4 {
        background-color: #5c752b;
      }
      &.l-5 {
        background-color: #b38a33;
      }
      &.l-6 {
        background-color: #e1cf8a;
      }
      &.l-7 {
        background-color: #9c7554;
      }
      &.l-8 {
        background-color: #bad48f;
      }
      &.l-9 {
        background-color: #408a70;
      }
      &.l-10 {
        background-color: #6ba38a;
      }
      &.l-11 {
        background-color: #e6ae66;
      }
      &.l-12 {
        background-color: #a8abae;
      }
      &.l-13 {
        background-color: #dd40d6;
      }
      &.l-14 {
        background-color: #4c70a3;
      }
      &.l-15 {
        background-color: #eee9ee;
      }
    }
  }

  &.smokey-bear {
    td div {
      &.sa-1 {
        background-color: #2b83ba;
      }
      &.sa-2 {
        background-color: #abdda4;
      }
      &.sa-3 {
        background-color: #ffffbf;
      }
      &.sa-4 {
        background-color: #fdae61;
      }
      &.sa-5 {
        background-color: #d7191c;
      }
    }
  }

  &.snow-cover {
    td div {
      &.sc-open {
        background-color: rgb(221, 221, 221);
      }
      &.sc-snow {
        background-color: white;
        border: 1px solid #ddd;
      }
    }
  }

  &.flammability {
    td div {
      &.rf-1 {
        background-color: #fef0d9;
      }
      &.rf-2 {
        background-color: #fdcc8a;
      }
      &.rf-3 {
        background-color: #fc8d59;
      }
      &.rf-4 {
        background-color: #e34a33;
      }
      &.rf-5 {
        background-color: #b30000;
      }
    }
  }
}
</style>
