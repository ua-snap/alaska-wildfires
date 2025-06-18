import moment from "moment";

const currentYear = new Date().getFullYear();

const aqiForecastTitle = "Forecast air quality";

const aqiAbstract = `
<p>This layer shows the <strong>predicted</strong> Air Quality Index (AQI), an indicator of how polluted the air is. The AQI is based on the local concentration of particulate matter that is 2.5 micrometers or smaller (PM<sub>2.5</sub>). These tiny particles can be inhaled and cause serious health problems. <a href="https://www.epa.gov/pm-pollution/particulate-matter-pm-basics">Read more here</a>.</p>
<p>&lsquo;Good&rsquo; air quality (AQI &le;50) is shown as transparent on the map.</p>
<p>The predicted air quality can be affected by a variety of pollution sources. Smoke from wildfires is a major source of air pollution in Alaska, but PM<sub>2.5</sub> can also come from industry, cars, or wood stoves.</p>
<p>The data in this layer are sourced from the Global Modeling and Assimilation Office (GMAO) at NASA Goddard Space Flight Center through the <a href="https://gmao.gsfc.nasa.gov/GMAO_products/NRT_products.php">online data portal in the NASA Center for Climate Simulation</a>.</p>
<p>The model used is the GEOS AGCM (Atmospheric General Circulation Model), operated within the GEOS FP (Forward Processing) data assimilation system. The GEOS FP system is run in near-real-time to provide global weather forecasts and reanalysis data. Output is provided at approximately 12 km horizontal resolution. For additional information, see the <a href="https://gmao.gsfc.nasa.gov/pubs/docs/Lucchesi1203.pdf">project documentation</a>.</p>
`;

const aqiTable = `
<table class="table alaska-wildfires-legend aqi-forecast">
  <tr><td><div class="aqi-good"></div></td><td>Good: 0&ndash;50</td></tr>
  <tr><td><div class="aqi-moderate"></div></td><td>Moderate: 51&ndash;100</td></tr>
  <tr><td><div class="aqi-unhealthy-sg"></div></td><td>Unhealthy for Sensitive Groups: 101&ndash;150</td></tr>
  <tr><td><div class="aqi-unhealthy"></div></td><td>Unhealthy: 151&ndash;200</td></tr>
  <tr><td><div class="aqi-very-unhealthy"></div></td><td>Very Unhealthy: 201&ndash;300</td></tr>
  <tr><td><div class="aqi-hazardous"></div></td><td>Hazardous: 301&ndash;500</td></tr>
</table>
`;

const sensorNetworkLayerTable = `
<table class="table alaska-wildfires-legend aqi-shapes mb-6">
  <tr>
    <td>
      <div class="aqi-hazardous"></div>
    </td>
    <td>
      <strong>Squares</strong> are the PurpleAir sensor network, 10 minute average AQI.
    </td>
  </tr>
  <tr>
    <td>
      <div class="aqi-hazardous dec"></div>
    </td>
    <td>
      <strong>Circles</strong> show data hosted by the Alaska Department of Environmental Conservation, 1 hour average AQI.
    </td>
  </tr>
</table>
<div class="purple-air">
  ${aqiTable}
</div>
`;

const activeFiresLayerTable = `
  <table class="table alaska-wildfires-legend active-fires">
  <thead>
    <tr>
      <th scope="col"></th>
      <th scope="col">Active</th>
      <th scope="col">Inactive/out</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Fires with mapped perimeters</th>
      <td><img src=" ${require("@/assets/active-perimeter.svg")} "/></td>
      <td><img src=" ${require("@/assets/inactive-perimeter.svg")} "/></td>
    </tr>
    <tr>
      <th scope="row">Fires &gt;1 acre</th>
      <td><span class="active">800</span></td>
      <td><span class="inactive">800</span></td>
    </tr>
    <tr>
      <th scope="row">Fires &lt;1 acre</th>
      <td><span class="active small"></span></td>
      <td><span class="inactive small"></span></td>
    </tr>
  </tbody>
  </table>
`;

export default [
  {
    id: "fires",
    numericId: 0,
    wmsLayerName: "fires",
    title: currentYear + " Wildfires",
    local: true,
    visible: true,
    legendClassOverride: "is-one-third",
    legend: activeFiresLayerTable,
    abstract:
      "<p>Active (orange) and inactive (gray) fires for the " +
      currentYear +
      ' season, using data from the most recent information from the Alaska Interagency Coordination Center.  Small fires (1 acre or less) are shown with a dot. Larger fires and fires with mapped perimeters have a halo to show their relative size.  Recently-discovered fires may not have a mapped perimeter.</p><p>Data are accessed from the Alaska Interagency Coordination Center (AICC) <a href="https://fire.ak.blm.gov/predsvcs/maps.php">data services</a>.</p>',
  },
  {
    id: "lightning_strikes",
    numericId: 2,
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
            <p>Lightning strikes are classified according to the type of charge released. Nearly 95% of lightning strikes carry a negative charge, but positively-charged strikes are much more powerful. This layer shows the last 36 hours of lightning activity; older lightning strikes fade over time.</p><p>Data are accessed from the Alaska Interagency Coordination Center (AICC) <a href="https://fire.ak.blm.gov/predsvcs/maps.php">data services</a>.</p>`,
  },
  {
    id: "gridded_lightning",
    numericId: 11,
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
            <p>Average of detected lightning strikes for Alaska's wildfire season (May&ndash;August). Calculated by averaging all strikes within a 20&times;20 km area for each month across 30 years (1986&ndash;2015). This layer looks blocky because each square is showing the average for that area.</p><p>Detailed information about this dataset can be found in <a href="https://journals.ametsoc.org/view/journals/apme/59/6/JAMC-D-19-0209.1.xml">this academic paper</a>, and <a href="https://search.dataone.org/view/10.24431_rw1k45z_2020_7_23_23548">the dataset can be downloaded here</a>.`,
  },
  {
    id: "aqi_forecast_6_hrs",
    numericId: 5,
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
    numericId: 6,
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
    numericId: 7,
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
    numericId: 8,
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
    numericId: 1,
    wmsLayerName: "viirs",
    title: "Hotspots, last 48 hours",
    layerName: "alaska_wildfires:viirs_hotspots",
    local: true,
    legend: `<img src="` + require("@/assets/hotspot-legend.png") + `"/>`,
    zindex: 100,
    abstract: `<p>&ldquo;Hotspots&rdquo; are places where temperatures are higher than expected. Scientific instruments on satellites can detect hotspots, which helps fire managers discover new wildfires. Individual hotspots are compiled into smooth gradients, where darker colors indicate greater densities of hotspots. Note that the instrument can also detect other hotspots unrelated to wildfire, such as flare stacks at oil drilling facilities on the North Slope of Alaska or even ship exhaust in the ocean.</p>

    <p>The data source is <a href="https://www.ospo.noaa.gov/Products/land/afiband.html">NOAA Active Fire Detections from the VIIRS sensor</a>, accessed from the Alaska Interagency Coordination Center (AICC) <a href="https://fire.ak.blm.gov/predsvcs/maps.php">data services</a>.</p>
    <p>Read about the <a href="https://gina.alaska.edu/wp-content/uploads/2022/05/VIIRS_ActiveFiresAlgorithm_Quick_Guide.pdf">VIIRS Active Fire Detection</a> product.
    `,
  },
  {
    abstract: `
          <p>Land cover classification from the <a href="https://eros.usgs.gov/doi-remote-sensing-activities/2019/usgs/nalcms-release-new-land-cover-north-america">North American Land Change Monitoring System, 2015</a>. Spatial resolution is 30&#8239;m (1 pixel = 30&#8239;m on the ground). Dominant land cover relates to wildfire because it varies across the landscape, and influences how a region may burn. Wildfires often change the dominant land cover type, and many fires have occurred since this layer was created.</p>`,
    id: "alaska_landcover_2015",
    numericId: 10,
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
          <p>Older wildfire perimeters can be interesting to study in relation to newer fires. Previously burned areas often stop new fires from spreading due to a lack of fuel.</p><p>Data are accessed from the Alaska Interagency Coordination Center (AICC) <a href="https://fire.ak.blm.gov/predsvcs/maps.php">data services</a>.</p>`,
    id: "historical_fire_perimeters",
    numericId: 12,
    wmsLayerName: "historical_fire_perimeters",
    zindex: 10,
    styles: "historical_fire_polygon_buckets",
    title: "Historical fire perimeters",
    legend: `<table class="table alaska-wildfires-legend historical-fire-perimeters">
            <tr><td><div class="h-40-69"></div></td><td>1940&mdash;1969</td></tr>
            <tr><td><div class="h-70-99"></div></td><td>1970&mdash;1999</td></tr>
            <tr><td><div class="h-00-17"></div></td><td>2000&mdash;2024</td></tr>
          </table>`,
  },
  {
    abstract: `
    <p>This layer is derived from the U.S. National Ice Center&rsquo;s Interactive Multisensor Snow and Ice Mapping System, which shows snow and ice coverage over the Northern Hemisphere at 1 km resolution. This map shows only snow coverage as an indicator of potential for early fire during spring in Alaska. <a href="https://usicecenter.gov/Resources/ImsInfo">Visit the data source</a>.</p>`,
    id: "snow_cover_3338",
    numericId: 9,
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
    <p>This is the same information shown on the &ldquo;Smokey the Bear&rdquo; signs!  Fire managers use these ratings to understand the environment that is developing over time. Ratings are used to assess the risk of wildfires for areas of Alaska based on factors such as recent precipitation and buildup of vegetation in an area.  Data are derived from <a href="https://akff.mesowest.org">layers provided by MesoWest Alaska Fires &amp; Fuels website</a>.</p>
    `,
    id: "spruceadj_3338",
    numericId: 3,
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
    rasdaman: true,
    abstract: `
          <p>This layer shows output from ALFRESCO, a computer model that simulates the responses of Northern vegetation to climate change. Darker colors mean a greater chance of a region burning. These modeled data for 1950&ndash;2008 allow for comparison with projected data but do not necessarily match historical fire perimeters.</p>
          <p>Source data, including additional models and scenarios, <a href="https://catalog.snap.uaf.edu/geonetwork/srv/eng/catalog.search#/metadata/eeaaca2c-0280-4226-b126-fda42a2b6214">can be downloaded here</a>.</p>`,
    id: "alfresco_relative_flammability_cru_ts40_historical_1950_2008_iem",
    numericId: 13,
    wmsLayerName: "alfresco_relative_flammability_30yr",
    dim_model: 0,
    dim_scenario: 0,
    zindex: 5,
    styles: "alaska_wildfire_explorer_historical",
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
    rasdaman: true,
    abstract: `
          <p>This layer shows output from ALFRESCO, a computer model that simulates the responses of Northern vegetation to climate change. Darker colors mean a greater chance of a region burning. Model projections are for 2070&ndash;2099 using the <a href="https://www.cesm.ucar.edu/models/ccsm">NCAR CCSM4</a> model under the RCP 8.5 emission scenario. These projections can be useful for planning, particularly when compared to historical flammability and historical fires, but they can't predict which specific places will burn.</p><p>Source data, including additional models and scenarios, <a href="https://catalog.snap.uaf.edu/geonetwork/srv/eng/catalog.search#/metadata/eeaaca2c-0280-4226-b126-fda42a2b6214">can be downloaded here</a>.</p>`,
    id: "alfresco_relative_flammability_NCAR-CCSM4_rcp85_2070_2099",
    numericId: 14,
    wmsLayerName: "alfresco_relative_flammability_30yr",
    dim_model: 6,
    dim_scenario: 3,
    zindex: 5,
    styles: "alaska_wildfire_explorer_projected",
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
    <p>This layer shows sensor values for the <a href="https://www.airnow.gov/aqi/aqi-basics/">Air Quality Index (AQI)</a>, an indicator of how polluted the air is. The AQI is based on the local concentration of particulate matter that is 2.5 micrometers or smaller (PM<sub>2.5</sub>). These tiny particles can be inhaled and cause serious health problems. <a href="https://www.epa.gov/pm-pollution/particulate-matter-pm-basics">Read more here</a>.</p>
    <p>The layer shows the average AQI over the last 10 minutes or 1 hour at each sensor location. The 24-hour average AQI can be seen if you click on any of the sensors with a square icon.</p>
    <p>The air quality shown on these sensors can be affected by a variety of pollution sources. Smoke from wildfires is a major source of air pollution in Alaska, but PM<sub>2.5</sub> can also come from industry, cars, or wood stoves.</p>
    <p>The data in this layer are measured using air quality sensors. These include:</p>
    <ul>
      <li><a href="https://map.purpleair.com/air-quality-standards-us-epa-aqi?opt=%2F1%2Flp%2Fa10%2Fp604800%2FcC0#1/11.5/-30">PurpleAir sensors</a> that are hosted by communities and made public</li>
      <li>sensors hosted by the <a href="https://dec.alaska.gov/air/air-monitoring/instruments-sites/community-based-monitoring/">Alaska Department of Environmental Conservation</a>, including Quant MODULAIR pods provided to their Community-Based Air Monitoring Network.  <strong>Note:</strong> the QuantAQ sensor&rsquo;s data quality does not meet rigorous regulatory requirements and should not be compared to regulatory instruments or health-based standards.  For questions or to request sensor data, email <a href="mailto:amqa-data-request@alaska.gov">amqa-data-request@alaska.gov</a>.</li>
    </ul>
    <p>If you would like to add your sensor network to this map, please contact the <a href="mailto:uaf-snap-data-tools@alaska.edu">SNAP team.</a></p>
    `,
    id: "purple_air",
    numericId: 4,
    wmsLayerName: "purple_air",
    local: true,
    title: "Current air quality",
    blurb: "updated every 10 minutes",
    zindex: 20,
    legend: sensorNetworkLayerTable,
    legendClassOverride: "purple-air is-one-third",
  },
  {
    id: "gmu",
    numericId: 16,
    wmsLayerName: "all_boundaries:all_gmus",
    title: "Game Management Units",
    zindex: 100,
    abstract: `
      <p>To manage wildlife and hunting effectively, the Alaska Department of Fish and Game divides the state into Game Management Units (GMUs). Each unit, and its sub-units shown on this map, has specific regulations for different species, hunting seasons, and harvest limits. <a href="https://www.adfg.alaska.gov/index.cfm?adfg=huntingmaps.gmuinfo">Read more here</a>.</p>
      `,
  },
  {
    id: "fire_zones",
    numericId: 18,
    wmsLayerName: "all_boundaries:all_fire_zones",
    title: "Fire Management Zones",
    zindex: 100,
    abstract: `
      <p>
        Alaska is divided into fire management zones to coordinate wildfire response across the state&apos;s vast and varied landscapes. Fire management in Alaska is a cooperative effort between the State of Alaska Division of Forestry & Fire Protection, the U.S. Bureau of Land Management Alaska Fire Service, and the U.S. Forest Service. Together, they manage zones to ensure efficient use of firefighting resources, reduce duplication of effort, and respond effectively to wildfires across jurisdictional boundaries. <a href="https://www.blm.gov/programs/fire-and-aviation-/state-information/alaska-fire-service/fire-management">Read more here</a>.
      `,
  },
  {
    id: "viirs_adp",
    numericId: 20,
    wmsLayerName: "alaska_wildfires:viirs_adp",
    title: "Current smoke plumes",
    zindex: 5,
    abstract: `
      <p>This layer shows where smoke was detected in the air yesterday. When you look at the map, you will see areas marked as <strong>thin smoke</strong> or <strong>thick smoke</strong>.</p>
      <ul>
        <li><strong>Thin smoke</strong> means some smoke particles are present high up in the air, but they are more spread out.</li>
        <li><strong>Thick smoke</strong> means that the smoke particles high up in the air are more concentrated.</li>
      </ul>
      <p>It is important to remember that this layer shows smoke overhead, but it does not measure what&rsquo;s happening at ground level. It can help track where smoke is traveling, gauge visibility, and anticipate air quality concerns, but it does not tell us directly whether the air is healthy to breathe at the surface. Smoke that is underneath clouds cannot be detected so this layer may not show the full extent of the plume.</p>
      <p>The data shown in this layer is from the <a href="https://www.star.nesdis.noaa.gov/atmospheric-composition-training/documents/VIIRS_Aerosol_Detection_Product_Quick_Guide.pdf">VIIRS Aerosol Detection Product</a>. These daily snapshots are sourced from the <a href="https://www.star.nesdis.noaa.gov/atmospheric-composition-training/index.php">NOAA Aerosols and Atmospheric Composition Science Team</a>.</p>
    `,
    legend: `<table class="table alaska-wildfires-legend viirs-adp">
      <tr><td><div class="adp-1"></div></td><td>Thin</td></tr>
      <tr><td><div class="adp-2"></div></td><td></td></tr>
      <tr><td><div class="adp-3"></div></td><td></td></tr>
      <tr><td><div class="adp-4"></div></td><td></td></tr>
      <tr><td><div class="adp-5"></div></td><td></td></tr>
      <tr><td><div class="adp-6"></div></td><td>Thick</td></tr>
    </table>`,
  },
];
