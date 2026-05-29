const DEFAULT_GEOSERVER_URL = "https://gs.earthmaps.io/geoserver";

const geoserverBaseUrl = (
  process.env.VUE_APP_GEOSERVER_URL || DEFAULT_GEOSERVER_URL
).replace(/\/+$/, "");

const geoserverWmsUrl = `${geoserverBaseUrl}/wms`;
const geoserverWfsUrl = `${geoserverBaseUrl}/wfs`;

export { geoserverBaseUrl, geoserverWmsUrl, geoserverWfsUrl };
