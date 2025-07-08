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

const decTypes = ["dec", "conocophillips", "blm", "louden_tribe"];

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
    reloadLocalLayers() {
      return this.$store.state.reloadLocalLayers;
    },
  },
  data() {
    return {
      mapOptions: {
        zoom: 1,
        minZoom: 1,
        maxZoom: 6,
        zoomSnap: 0.5,
        center: [65, -152.5],
      },
      baseLayerOptions: {
        transparent: true,
        srs: "EPSG:3338",
        format: "image/png",
        version: "1.3.0",
        continuousWorld: true, // needed for non-3857 projs
      },
      active_fire_color: "#fc8d05",
      inactive_fire_color: "#22535b",
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
    this.loadLocalLayers();

    // Remove any stray localStorage.
    localStorage.clear();
  },
  watch: {
    reloadLocalLayers(bool) {
      if (bool) {
        this.loadLocalLayers();
        this.$store.commit("clearReloadLocalLayers");
      }
    },
  },
  methods: {
    // Helper function to format incoming UNIX timestamps
    // relative to browser's local time zone.  Returns Moment
    // object for formatting relevant in context.
    parseDate(t) {
      return this.$moment(parseInt(t)).utcOffset(offset);
    },

    loadLocalLayers() {
      this.fetchFireData();
      this.fetchViirsData();
      this.fetchPurpleAirData();
    },

    fetchPurpleAirData() {
      // Define parameters for the WFS requests
      var params = {
        service: "WFS",
        version: "1.1.0",
        request: "GetFeature",
        typeName: "alaska_wildfires:purple_air_dec",
        outputFormat: "json",
      };

      return new Promise((resolve) => {
        this.$axios
          .get(process.env.VUE_APP_GEOSERVER_WFS_URL, { params })
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
        const aqi10minClassInfo = this.getAqiClassInfo(
          feature.properties.aqi_10m,
        );
        const aqi24hrClassInfo = this.getAqiClassInfo(
          feature.properties.aqi_24hr,
        );
        const aqi1hrClassInfo = this.getAqiClassInfo(
          feature.properties.aqi_1hr,
        );

        if (
          _.isUndefined(aqi10minClassInfo) ||
          _.isUndefined(aqi24hrClassInfo) ||
          _.isUndefined(aqi1hrClassInfo)
        ) {
          return false;
        }

        var icon;
        if (decTypes.includes(feature.properties.type)) {
          icon = this.$L.divIcon({
            className: "aqi-dec",
            popupAnchor: [15, -5],
            html: `<span class="${aqi1hrClassInfo.class}">${feature.properties.aqi_1hr}</span>`,
          });
        } else {
          icon = this.$L.divIcon({
            className: "aqi",
            popupAnchor: [15, -5],
            html: `<span class="${aqi10minClassInfo.class}">${feature.properties.aqi_10m}</span>`,
          });
        }

        var marker = this.$L.marker(
          [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
          {
            icon: icon,
            zIndexOffset: feature.properties.type == "dec" ? 500 : 0,
          },
        );

        // Create popup content
        var popupContent;
        if (decTypes.includes(feature.properties.type)) {
          var dataProvider;
          if (feature.properties.type == "conocophillips") {
            dataProvider = `<a href="https://www.conocophillips.com/">ConocoPhillips</a>`;
          } else if (feature.properties.type == "blm") {
            dataProvider = `<a href="https://www.blm.gov/">Bureau of Land Management</a>`;
          } else if (feature.properties.type == "louden_tribe") {
            dataProvider = `<a href="https://www.loudentribe.org/">Louden Tribe</a>`;
          } else {
            dataProvider = `<a href="https://dec.alaska.gov/air/air-monitoring/instruments-sites/community-based-monitoring/">Department of Environmental Conservation</a>`;
          }
          popupContent = `<div class="${aqi24hrClassInfo.class} sensor-detail">
            <p><strong>1-hour average PM2.5 AQI</strong> at this sensor on ${this.convertToAKST(
              feature.properties.lastupdate,
            )}:
            </p>
            <p><span class="sensor-aqi ${aqi1hrClassInfo.class}">${
            feature.properties.aqi_1hr
          } &mdash; ${aqi1hrClassInfo.name}</span>
            </p>
            <p class="aqi-explain">${aqi1hrClassInfo.description}</p>
            <p>Data provided by a ${dataProvider} sensor.</p>
          </div>`;
        } else {
          popupContent = `
        <div class="${aqi24hrClassInfo.class} sensor-detail">
            <p><strong>10-minute average PM2.5 AQI</strong> at this sensor on ${this.convertToAKST(
              feature.properties.lastupdate,
            )}:
            </p>
            <p><span class="sensor-aqi ${aqi10minClassInfo.class}">${
            feature.properties.aqi_10m
          } &mdash; ${aqi10minClassInfo.name}</span>
            </p>
            <p class="aqi-explain">${aqi10minClassInfo.description}</p>
            <p><strong>24-hour average PM2.5 AQI</strong> at this sensor is <span class="sensor-24hr-aqi ${
              aqi24hrClassInfo.class
            }">${feature.properties.aqi_24hr} &mdash; ${
            aqi24hrClassInfo.name
          } </span> &nbsp;${aqi24hrClassInfo.description}
            </p>
            <p>Data provided by a local <a href="https://www2.purpleair.com/">PurpleAir</a> sensor.</p>
          </div>
`;
        }

        // Bind popup to marker
        marker.bindPopup(popupContent);

        // Attach analytics
        marker.on("click", () => {
          window.umami.track("aqi-marker-click");
        });

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
          .get(process.env.VUE_APP_GEOSERVER_WFS_URL, { params })
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
        this.$axios.get(process.env.VUE_APP_GEOSERVER_WFS_URL, {
          params: pointParams,
        }),
        this.$axios.get(process.env.VUE_APP_GEOSERVER_WFS_URL, {
          params: polygonParams,
        }),
      ])
        .then((responses) => {
          let fireCount = 0;
          let totalAcresBurned = 0;

          responses.forEach((response) => {
            response.data.features.forEach((feature) => {
              // Count number of features with active == "1" to count total number of active fires
              if (feature.properties.active == "1") {
                fireCount++;
              }

              // Sum up total acres burned
              totalAcresBurned += parseFloat(feature.properties.acres) || 0;
            });
          });
          totalAcresBurned = Math.round(totalAcresBurned);

          this.$store.commit("setFireCount", fireCount);
          this.$store.commit("setAcresBurned", totalAcresBurned);

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
      let featureHandler = (feature, layer) => {
        layer.bindPopup(
          this.getFireMarkerPopupContents({
            title: feature.properties.NAME,
            acres: feature.properties.acres,
            cause: feature.properties.CAUSE,
            updated: feature.properties.updated,
            outdate: feature.properties.OUTDATE,
            discovered: feature.properties.discovered,
            summary: feature.properties.SUMMARY,
          }),
        );
      };
      firePolygons = this.getGeoJsonLayer(data, featureHandler);
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
        stop1: this.active_fire_color,
        stop1opacity: ".1",
        stop2: this.active_fire_color,
        stop2opacity: ".45",
        stop3: this.active_fire_color,
        stop3opacity: ".95",
      });
      var inactiveSvgCircle = svgCircleTemplate({
        stop1: this.inactive_fire_color,
        stop1opacity: ".05",
        stop2: this.inactive_fire_color,
        stop2opacity: ".15",
        stop3: this.inactive_fire_color,
        stop3opacity: ".35",
      });

      var activeFireCircle =
        "data:image/svg+xml," + encodeURIComponent(activeSvgCircle);
      var inactiveFireCircle =
        "data:image/svg+xml," + encodeURIComponent(inactiveSvgCircle);

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
                    cause: feature.properties.CAUSE,
                    updated: feature.properties.updated,
                    outdate: feature.properties.OUTDATE,
                    discovered: feature.properties.discovered,
                    summary: feature.properties.SUMMARY,
                  },
                  popupOptions,
                ),
              )
              .on("click", () => {
                window.umami.track("fire-marker-click");
              }),
          );
        }
      });
      return this.$L.layerGroup(fireMarkers);
    },
    getGeoJsonLayer(geoJson, layerHandler) {
      let config = {
        style: this.styleFirePolygons,
        pointToLayer: this.firePointFeatureHandler,
      };
      if (layerHandler) {
        config.onEachFeature = layerHandler;
      }
      return this.$L.geoJson(geoJson, config);
    },
    styleFirePolygons(feature) {
      if (this.isFireActive(feature.properties)) {
        return {
          color: "#fff",
          fillColor: this.active_fire_color,
          opacity: 0.8,
          weight: 2,
          fillOpacity: 0.8,
          className: "fire-polygon",
        };
      } else {
        return {
          color: "#333",
          fillColor: this.inactive_fire_color,
          opacity: 0.8,
          weight: 2,
          fillOpacity: 1,
          className: "fire-polygon",
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
              cause: geoJson.properties.CAUSE,
              updated: geoJson.properties.updated,
              outdate: geoJson.properties.OUTDATE,
              discovered: geoJson.properties.discovered,
              summary: geoJson.properties.SUMMARY,
            },
            popupOptions,
          ),
        )
        .on("click", () => {
          // Attach analytics
          window.umami.track("fire-marker-click");
        });
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

      var summary = fireInfo.summary
        ? "<strong>Summary</strong>: <div class='fire-summary'>" +
          fireInfo.summary +
          "</div>"
        : "";

      return _.template(`
  <h1><%= title %></h1>
  <h2><%= acres %></h2>
  <%= discovered %>
  <%= cause %>
  <%= out %>
  <%= updated %>
  <%= summary %>`)({
        title: fireInfo.title,
        acres: acres,
        cause: cause,
        updated: updated,
        out: out,
        discovered: discovered,
        summary: summary,
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

:root {
  --aqi-green: lch(81% 132 141);
  --aqi-yellow: lch(100% 132 88);
  --aqi-orange: lch(75% 125 65);
  --aqi-red: lch(57% 132 39);
  --aqi-purple: lch(32% 132 320);
  --aqi-maroon: lch(18% 102 2);
}

.leaflet-popup-content {
  z-index: 1000;
  min-width: 20vh;
  max-width: 30vh;

  .fire-summary {
    width: 100%;
    max-height: 30vh;
    overflow-y: auto;
    white-space: pre-wrap;
  }

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
    color: #000;
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
    background-color: #fc8d05;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
    z-index: 10000;
  }

  &.inactive {
    background-color: #22535b;
    opacity: 0.6;
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
  }

  span.sensor-24hr-aqi {
    font-size: 1rem;
    padding: 0.25rem 0.25rem;
  }

  span {
    &.aqi-green {
      background-color: var(--aqi-green);
      color: #000;
    }
    &.aqi-yellow {
      background-color: var(--aqi-yellow);
      color: #000;
    }
    &.aqi-orange {
      background-color: var(--aqi-orange);
      color: #000;
    }
    &.aqi-red {
      background-color: var(--aqi-red);
      color: #fff;
    }
    &.aqi-purple {
      background-color: var(--aqi-purple);
      color: #fff;
    }
    &.aqi-maroon {
      background-color: var(--aqi-maroon);
      color: #fff;
    }
  }
}

// Override / change some things from above
// for the AQI popups vs. the fire info popups
div.leaflet-marker-icon {
  &.aqi span {
    display: inline-block;
    border-radius: 0;
    opacity: 0.85;
    min-width: 1rem;
    text-align: center;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    font-weight: 600;
  }

  &.aqi-dec span {
    display: inline-block;
    border-radius: 50%;
    border: 2px solid rgba(50, 50, 50, 0.3);
    opacity: 0.85;
    min-width: 1.5rem;
    min-height: 1rem;
    text-align: center;
    line-height: 1rem;
    font-weight: 600;
  }

  span {
    &.aqi-green {
      background-color: var(--aqi-green);
      color: #000;
    }
    &.aqi-yellow {
      background-color: var(--aqi-yellow);
      color: #000;
    }
    &.aqi-orange {
      background-color: var(--aqi-orange);
      color: #000;
    }
    &.aqi-red {
      background-color: var(--aqi-red);
      color: #fff;
    }
    &.aqi-purple {
      background-color: var(--aqi-purple);
      color: #fff;
    }
    &.aqi-maroon {
      background-color: var(--aqi-maroon);
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
    tr > td {
      text-align: center;
    }
    td > img {
      // ensure both active/inactive symbols are the same size
      max-width: 3.5rem;
    }
    td > span {
      text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
      color: white;
      font-weight: 600;
      border-radius: 1em;
      margin: 1ex;
      padding: 0.5ex;

      &.active {
        background-color: #fc8d05;
      }
      &.inactive {
        background-color: #22535b;
      }
      &.small {
        display: inline-block;
        width: 1em;
        height: 1em;
      }
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

  // See the rule below with `purple-air`, there is a one-off rule to get
  // a solid green box for the PurpleAir legend (but everything else
  // is reused)
  &.aqi-forecast {
    td div {
      display: inline-block;
      &.aqi-good {
        border: 2px solid var(--aqi-green);
      }
      &.aqi-moderate {
        background-color: var(--aqi-yellow);
      }
      &.aqi-unhealthy-sg {
        background-color: var(--aqi-orange);
      }
      &.aqi-unhealthy {
        background-color: var(--aqi-red);
      }
      &.aqi-very-unhealthy {
        background-color: var(--aqi-purple);
      }
      &.aqi-hazardous {
        background-color: var(--aqi-maroon);
      }
    }
  }

  &.aqi-shapes {
    td {
      border-bottom: none;

      div {
        background-color: var(--aqi-green);

        &.dec {
          border: 2px solid rgba(50, 50, 50, 0.3) !important;
          border-radius: 50%;
        }
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

  &.viirs-adp {
    td div {
      &.adp-1 {
        background-color: #d0e5f8;
      }

      &.adp-2 {
        background-color: #aac4db;
      }

      &.adp-3 {
        background-color: #85a4be;
      }

      &.adp-4 {
        background-color: #6086a2;
      }

      &.adp-5 {
        background-color: #396887;
      }

      &.adp-6 {
        background-color: #004c6d;
      }
    }
  }

  &.viirs-aod {
    td div {
      &.aod-1 {
        background-color: #3f64fa;
      }

      &.aod-2 {
        background-color: #71febc;
      }

      &.aod-3 {
        background-color: #ebca70;
      }

      &.aod-4 {
        background-color: #ff2210;
      }

      &.aod-5 {
        background-color: #8b0000;
      }
    }
  }
}

.purple-air .aqi-good {
  background-color: var(--aqi-green);
}
</style>
