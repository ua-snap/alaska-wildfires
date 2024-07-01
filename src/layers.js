import moment from "moment";

const currentYear = new Date().getFullYear();

const aqiForecastTitle = "Air quality forecast";

const aqiAbstract = `
<p>This layer shows <strong>projected</strong> Air Quality Index from PM2.5, a measure of how polluted the air is.</p>

<p>&lsquo;Good&rsquo; air quality (AQI &le;50) is shown as transparent on the map.</p>

<p>The data used in this layer have been provided by the Global Modeling and Assimilation Office (GMAO) at NASA Goddard Space Flight Center through the <a  target="_blank" href="https://gmao.gsfc.nasa.gov/GMAO_products/NRT_products.php">online data portal in the NASA Center for Climate Simulation</a>.</p>

<ul>
  <li><a  target="_blank" href="https://www.epa.gov/pm-pollution/particulate-matter-pm-basics">Read about Particulate Matter (PM) basics</a></li>
  <li><a  target="_blank" href="https://www.airnow.gov/aqi/aqi-basics/">Read more about AQI</a></li>
</ul>
`;

const aqiTable = `
  <table class="table alaska-wildfires-legend aqi-forecast">
    <tr><td><div class="aqi-good"></div></td><td>Good: 0&ndash;50</td></tr>
    <tr><td><div class="aqi-moderate"></div></td><td>Moderate: 51&ndash;100</td></tr>
    <tr><td><div class="aqi-unhealthy-sg"></div></td><td>Unhealthy for Senstitive Groups: 101&ndash;150</td></tr>
    <tr><td><div class="aqi-unhealthy"></div></td><td>Unhealthy: 151&ndash;200</td></tr>
    <tr><td><div class="aqi-very-unhealthy"></div></td><td>Very Unhealthy: 201&ndash;300</td></tr>
    <tr><td><div class="aqi-hazardous"></div></td><td>Hazardous: 301&ndash;500</td></tr>
  </table>`;

export default [
  {
    id: "fires",
    wmsLayerName: "fires",
    title: currentYear + " Wildfires",
    local: true,
    visible: true,
    legendClassOverride: "is-one-third",
    legend:
      `<table class="table alaska-wildfires-legend active-fires">
      <tr><td><img src="` +
      require("@/assets/fire-perimeter.png") +
      `"/></td><td class="fire-text">Active Fire Perimeters</td></tr>
      <tr><td><img src="` +
      require("@/assets/large-fire.png") +
      `"/></td><td class="fire-text">Large Fire</td></tr>
      <tr><td><img class="small-fire-dot" src="` +
      require("@/assets/small-fire.png") +
      `"/></td><td class="fire-text">Small Fires</td></tr>
      </table>`,
    abstract:
      "<p>Active (red) and inactive (gray) fires for the " +
      currentYear +
      ' season, using data from the most recent information from the Alaska Interagency Coordination Center.  Small fires (1 acre or less) are shown with a dot. Larger fires and fires with mapped perimeters have a halo to show their relative size.  Recently-discovered fires may not have a mapped perimeter.</p><p>Data are accessed from the Alaska Interagency Coordination Center (AICC) <a  target="_blank" href="https://fire.ak.blm.gov/predsvcs/maps.php">data services</a>.</p>',
  },
  {
    id: "lightning_strikes",
    wmsLayerName: "lightning_strikes",
    title: "Lightning strikes, last 36 hours",
    layerName: "alaska_wildfires:lightning_strikes",
    legend:
      `<table class="table alaska-wildfires-legend lightning">
              <tr><td><div class="positive"><img src="` +
      require("@/assets/lightning-positive.svg") +
      `"/></div></td><td>Positive</td></tr>
              <tr><td><div class="negative"><img src="` +
      require("@/assets/lightning-negative.svg") +
      `"/></div></td><td>Negative</td></tr>
              <tr><td><div class="cloud2cloud">•</div></td><td>Cloud to cloud</td></tr>
            </table>`,
    zindex: 20,
    abstract: `
            <p>Lightning strikes are classified according to the type of charge released. Nearly 95% of lightning strikes carry a negative charge, but positively-charged strikes are much more powerful. This layer shows the last 36 hours of lightning activity; older lightning strikes fade over time.</p><p>Data are accessed from the Alaska Interagency Coordination Center (AICC) <a  target="_blank"  href="https://fire.ak.blm.gov/predsvcs/maps.php">data services</a>.</p>`,
  },
  {
    id: "gridded_lightning",
    wmsLayerName(params) {
      var monthName = moment.months(params.month - 1);
      return {
        name: `alaska_wildfires:lightning-monthly-climatology`,
        time: `2015-${params.month}-01T00:00:00Z`,
        title: `Historical lightning strikes in ${monthName}`,
      };
    },
    controls: "months",
    defaults: {
      month: 5,
    },
    zindex: 15,
    legend: `<table class="table alaska-wildfires-legend lightning-climatology">
              <tr><td><div class="lc-let1"></div></td><td>&lt;1</td></tr>
              <tr><td><div class="lc-6"></div></td><td>6</td></tr>
              <tr><td><div class="lc-13"></div></td><td>13</td></tr>
              <tr><td><div class="lc-19"></div></td><td>19</td></tr>
              <tr><td><div class="lc-26"></div></td><td>26</td></tr>
              <tr><td><div class="lc-32"></div></td><td>32</td></tr>
              <tr><td><div class="lc-39"></div></td><td>39</td></tr>
              <tr><td><div class="lc-gte45"></div></td><td>45+</td></tr>
            </table>`,
    abstract: `
            <p>Average of detected lightning strikes for Alaska’s wildfire season (May&ndash;August). Calculated by averaging all strikes within a 20&times;20 km area for each month across 30 years (1986&ndash;2015). This layer looks blocky because each square is showing the average for that area.</p><p>Detailed information about this dataset can be found in <a  target="_blank" href="https://journals.ametsoc.org/view/journals/apme/59/6/JAMC-D-19-0209.1.xml">this academic paper</a>, and <a target="_blank" href="https://search.dataone.org/view/10.24431_rw1k45z_2020_7_23_23548">the dataset can be downloaded here</a>.`,
  },
  {
    id: "aqi_forecast_6_hrs",
    wmsLayerName: "alaska_wildfires:aqi_forecast_6_hrs",
    title: "6 Hours",
    subtitle: aqiForecastTitle,
    legend: aqiTable,
    zindex: 20,
    styles: "alaska_wildfires:aqi_forecast",
    abstract: aqiAbstract,
    legendClassOverride: "is-one-third",
  },
  {
    id: "aqi_forecast_12_hrs",
    wmsLayerName: "alaska_wildfires:aqi_forecast_12_hrs",
    title: "12 Hours",
    subtitle: aqiForecastTitle,
    legend: aqiTable,
    zindex: 20,
    styles: "alaska_wildfires:aqi_forecast",
    abstract: aqiAbstract,
  },
  {
    id: "aqi_forecast_24_hrs",
    wmsLayerName: "alaska_wildfires:aqi_forecast_24_hrs",
    title: "24 Hours",
    subtitle: aqiForecastTitle,
    legend: aqiTable,
    zindex: 20,
    styles: "alaska_wildfires:aqi_forecast",
    abstract: aqiAbstract,
  },
  {
    id: "aqi_forecast_48_hrs",
    wmsLayerName: "alaska_wildfires:aqi_forecast_48_hrs",
    title: "48 Hours",
    subtitle: aqiForecastTitle,
    legend: aqiTable,
    zindex: 20,
    styles: "alaska_wildfires:aqi_forecast",
    abstract: aqiAbstract,
  },
  {
    id: "viirs",
    wmsLayerName: "viirs",
    title: "Hotspots, last 48 hours",
    layerName: "alaska_wildfires:viirs_hotspots",
    local: true,
    legend: `<img src="` + require("@/assets/hotspot-legend.png") + `"/>`,
    zindex: 100,
    abstract: `<p>&ldquo;Hotspots&rdquo; are places where temperatures are higher than expected. Scientific instruments on satellites can detect hotspots, which helps fire managers discover new wildfires. Individual hotspots are compiled into smooth gradients, where darker colors indicate greater densities of hotspots. Note that the instrument can also detect other hotspots unrelated to wildfire, such as flare stacks at oil drilling facilities on the North Slope of Alaska or even ship exhaust in the ocean.</p>

    <p>The data source is <a target="_blank" href="https://www.ospo.noaa.gov/Products/land/afiband.html">NOAA Active Fire Detections from the VIIRS sensor</a>, accessed from the Alaska Interagency Coordination Center (AICC) <a target="_blank" href="https://fire.ak.blm.gov/predsvcs/maps.php">data services</a>.</p>
    `,
  },
  {
    abstract: `
          <p>Land cover classification from the <a  target="_blank" href="https://eros.usgs.gov/doi-remote-sensing-activities/2019/usgs/nalcms-release-new-land-cover-north-america">North American Land Change Monitoring System, 2015</a>. Spatial resolution is 30&#8239;m (1 pixel = 30&#8239;m on the ground). Dominant land cover relates to wildfire because it varies across the landscape, and influences how a region may burn. Wildfires often change the dominant land cover type, and many fires have occurred since this layer was created.</p>`,
    id: "alaska_landcover_2015",
    wmsLayerName: "alaska_wildfires:alaska_landcover_2015",
    title: "Land cover types",
    zindex: 3,
    legendClassOverride: "is-one-third",
    legend: `<table class="table alaska-wildfires-legend alaska-landcover-2015">
            <tr><td><div class="l-1"></div></td><td>Temperate or sub-polar needleleaf forest</td></tr>
            <tr><td><div class="l-2"></div></td><td>Sub-polar taiga needleleaf forest</td></tr>
            <tr><td><div class="l-3"></div></td><td>Temperate or sub-polar broadleaf deciduous forest</td></tr>
            <tr><td><div class="l-4"></div></td><td>Mixed forest</td></tr>
            <tr><td><div class="l-5"></div></td><td>Temperate or sub-polar shrubland</td></tr>
            <tr><td><div class="l-6"></div></td><td>Temperate or sub-polar grassland</td></tr>
            <tr><td><div class="l-7"></div></td><td>Sub-polar or polar shrubland-lichen-moss</td></tr>
            <tr><td><div class="l-8"></div></td><td>Sub-polar or polar grassland-lichen-moss</td></tr>
            <tr><td><div class="l-9"></div></td><td>Sub-polar or polar barren-lichen-moss</td></tr>
            <tr><td><div class="l-10"></div></td><td>Wetland</td></tr>
            <tr><td><div class="l-11"></div></td><td>Cropland</td></tr>
            <tr><td><div class="l-12"></div></td><td>Barren land</td></tr>
            <tr><td><div class="l-13"></div></td><td>Urban and built-up</td></tr>
            <tr><td><div class="l-14"></div></td><td>Water</td></tr>
            <tr><td><div class="l-15"></div></td><td>Snow and ice</td></tr>
          </table>`,
  },
  {
    abstract: `
          <p>Older wildfire perimeters can be interesting to study in relation to newer fires. Previously burned areas often stop new fires from spreading due to a lack of fuel.</p><p>Data are accessed from the Alaska Interagency Coordination Center (AICC) <a  target="_blank"  href="https://fire.ak.blm.gov/predsvcs/maps.php">data services</a>.</p>`,
    id: "historical_fire_perimeters",
    wmsLayerName: "historical_fire_perimeters",
    zindex: 10,
    styles: "historical_fire_polygon_buckets",
    title: "Historical fire perimeters",
    legend: `<table class="table alaska-wildfires-legend historical-fire-perimeters">
            <tr><td><div class="h-40-69"></div></td><td>1940&mdash;1969</td></tr>
            <tr><td><div class="h-70-99"></div></td><td>1970&mdash;1999</td></tr>
            <tr><td><div class="h-00-17"></div></td><td>2000&mdash;2023</td></tr>
          </table>`,
  },
  {
    abstract: `
    <p>This layer is derived from the U.S. National Ice Center&rsquo;s Interactive Multisensor Snow and Ice Mapping System, which shows snow and ice coverage over the Northern Hemisphere at 1 km resolution. This map shows only snow coverage as an indicator of potential for early fire during spring in Alaska. <a  target="_blank" href="https://usicecenter.gov/Resources/ImsInfo">Visit the data source</a>.</p>`,
    id: "snow_cover_3338",
    wmsLayerName: "alaska_wildfires:snow_cover_3338",
    styles: "alaska_wildfires:snow_cover",
    zindex: 10,
    title: "Today&rsquo;s Snow Cover",
    legend: `<table class="table alaska-wildfires-legend snow-cover">
            <tr><td><div class="sc-open"></div></td><td>Open terrain (no snow)</td></tr>
            <tr><td><div class="sc-snow"></div></td><td>Snow</td></tr>
          </table>`,
  },
  {
    abstract: `
    <p>This is the same information shown on the &ldquo;Smokey the Bear&rdquo; signs!  Fire managers use these ratings to understand the environment that is developing over time. Ratings are used to assess the risk of wildfires for areas of Alaska based on factors such as recent precipitation and buildup of vegetation in an area.  Data are derived from <a  target="_blank" href="https://akff.mesowest.org">layers provided by MesoWest Alaska Fires &amp; Fuels website</a>.</p>
    `,
    id: "spruceadj_3338",
    wmsLayerName: "alaska_wildfires:spruceadj_3338",
    styles: "alaska_wildfires:spruce_adjective",
    zindex: 10,
    title: "Today&rsquo;s Fire Danger Ratings",
    legend: `<table class="table alaska-wildfires-legend smokey-bear">
      <tr><td><div class="sa-1"></div></td><td>Low</td></tr>
      <tr><td><div class="sa-2"></div></td><td>Medium</td></tr>
      <tr><td><div class="sa-3"></div></td><td>High</td></tr>
      <tr><td><div class="sa-4"></div></td><td>Very High</td></tr>
      <tr><td><div class="sa-5"></div></td><td>Extreme</td></tr>
    </table>`,
  },
  {
    abstract: `
          <p>This layer shows output from ALFRESCO, a computer model that simulates the responses of Northern vegetation to climate change. Darker colors mean a greater chance of a region burning. These modeled data for the previous century (1900&ndash;1999) allow for comparison between that century and this one, but do not necessarily match historical fire perimeters.</p>
          <p>Source data, including additional models and scenarios, <a  target="_blank" href="https://catalog.snap.uaf.edu/geonetwork/srv/eng/catalog.search#/metadata/eeaaca2c-0280-4226-b126-fda42a2b6214">can be downloaded here</a>.</p>`,
    id: "alfresco_relative_flammability_cru_ts40_historical_1900_1999_iem",
    wmsLayerName:
      "alaska_wildfires:alfresco_relative_flammability_cru_ts40_historical_1900_1999_iem",
    zindex: 5,
    styles: "flammability",
    title: "Historical modeled flammability",
    legend: `<table class="table alaska-wildfires-legend flammability">
      <tr><td><div class="rf-1"></div></td><td>Less likely to burn</td></tr>
      <tr><td><div class="rf-2"></div></td><td></td></tr>
      <tr><td><div class="rf-3"></div></td><td>More likely to burn</td></tr>
      <tr><td><div class="rf-4"></div></td><td></td></tr>
      <tr><td><div class="rf-5"></div></td><td>Much more likely to burn</td></tr>
    </table>`,
  },
  {
    abstract: `
          <p>This layer shows output from ALFRESCO, a computer model that simulates the responses of Northern vegetation to climate change. Darker colors mean a greater chance of a region burning. Model projections are for 2000&ndash;2099 using the <a target="_blank" href="https://www.cesm.ucar.edu/models/ccsm">NCAR CCSM4</a> model under the RCP 8.5 emission scenario. These projections can be useful for planning, particularly when compared to historical flammability and historical fires, but they can’t predict which specific places will burn.</p><p>Source data, including additional models and scenarios, <a  target="_blank" href="https://catalog.snap.uaf.edu/geonetwork/srv/eng/catalog.search#/metadata/eeaaca2c-0280-4226-b126-fda42a2b6214">can be downloaded here</a>.</p>`,
    id: "alfresco_relative_flammability_NCAR-CCSM4_rcp85_2000_2099",
    wmsLayerName:
      "alaska_wildfires:alfresco_relative_flammability_NCAR-CCSM4_rcp85_2000_2099",
    zindex: 5,
    styles: "flammability",
    title: "Projected flammability",
    legend: `<table class="table alaska-wildfires-legend flammability">
      <tr><td><div class="rf-1"></div></td><td>Less likely to burn</td></tr>
      <tr><td><div class="rf-2"></div></td><td></td></tr>
      <tr><td><div class="rf-3"></div></td><td>More likely to burn</td></tr>
      <tr><td><div class="rf-4"></div></td><td></td></tr>
      <tr><td><div class="rf-5"></div></td><td>Much more likely to burn</td></tr>
    </table>`,
  },
  {
    abstract: `
    <p>This layer shows local sensor values for Air Quality Index from PM2.5, a measure of how polluted the air is.</p>
    <p>The layer shows the most recent 24-hour average AQI from Purple Air sensors in Alaska that are configured to share data publicly.  Purple Air sensors are low-cost air quality sensors that measure particulate matter in the air.</p>
    <p>PM2.5 is a common pollutant that can be harmful to human health, especially when levels are high. This layer can be useful for understanding air quality in areas near wildfires.</p>
    <p>Data are provided by <a  target="_blank" href="https://www2.purpleair.com/">PurpleAir</a>.</p>
    <ul>
      <li><a target="_blank" href="https://www.epa.gov/pm-pollution/particulate-matter-pm-basics">Read about Particulate Matter (PM) basics</a></li>
      <li><a target="_blank" href="https://www.airnow.gov/aqi/aqi-basics/">Read more about AQI</a></li>
    </ul>
    `,
    id: "purple_air",
    wmsLayerName: "purple_air",
    local: true,
    title: "Air quality sensor network",
    blurb: "24-hour average AQI",
    zindex: 20,
    legend: aqiTable,
    legendClassOverride: "is-one-third",
  },
];
