import moment from "moment";

function getPublicPath() {
  switch (process.env.NODE_ENV) {
    case "production":
      return "/tools/alaska-wildfires";
    default:
      return "";
  }
}

export default [
  {
    id: "fires",
    wmsLayerName: "fires",
    title: "2021 Wildfires",
    local: true,
    visible: true,
    legend: `<table class="alaska-wildfires-legend active-fires">
      <tr><td><img src="${getPublicPath()}/images/fire-perimeter.png"/></td><td class="fire-text">Active Fire Perimeters</td></tr>
      <tr><td><img src="${getPublicPath()}/images/large-fire.png"/></td><td class="fire-text">Large Fire</td></tr>
      <tr><td><img class="small-fire-dot" src="${getPublicPath()}/images/small-fire.png"/></td><td class="fire-text">Small Fires</td></tr>
      </table>`,
    abstract: `
    <p>Active (red) and inactive (gray) fires for the 2021 season, using data from the most recent information from the Alaska Interagency Coordination Center.  Small fires (1 acre or less) are shown with a dot. Larger fires and fires with mapped perimeters have a halo to show their relative size.  Recently-discovered fires may not have a mapped perimeter.</p>`
  },
  {
    id: "postgis_lightning",
    wmsLayerName: "postgis_lightning",
    title: "Lightning strikes, last 36 hours",
    layerName: "alaska_wildfires:postgis_lightning",
    legend: `<table class="alaska-wildfires-legend lightning">
              <tr><td><div class="positive"><img src="${getPublicPath()}/images/lightning-positive.svg"/></div></td><td>Positive</td></tr>
              <tr><td><div class="negative"><img src="${getPublicPath()}/images/lightning-negative.svg"/></div></td><td>Negative</td></tr>
              <tr><td><div class="cloud2cloud">•</div></td><td>Cloud to cloud</td></tr>
            </table>`,
    zindex: 20,
    abstract: `
            <p>Lightning strikes are classified according to the type of charge released. Nearly 95% of lightning strikes carry a negative charge, but positively-charged strikes are much more powerful. This layer shows the last 36 hours of lightning activity; older lightning strikes fade over time. </p>`
  },
  {
    id: "gridded_lightning",
    wmsLayerName(params) {
      var monthName = moment.months(params.month - 1);
      return {
        name: `alaska_wildfires:lightning-monthly-climatology`,
        time: `2015-${params.month}-01T00:00:00Z`,
        title: `Historical lightning strikes in ${monthName}`
      };
    },
    controls: "months",
    defaults: {
      month: 5
    },
    zindex: 15,
    legend: `<table class="alaska-wildfires-legend lightning-climatology">
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
            <p>Average of detected lightning strikes for Alaska’s wildfire season (May&ndash;August). Calculated by averaging all strikes within a 20&times;20 km area for each month across 30 years (1986&ndash;2015). This layer looks blocky because each square is showing the average for that area.</p>`
  },
  {
    id: "viirs",
    wmsLayerName: "viirs",
    title: "Hotspots, last 48 hours",
    local: true,
    legend: `<img src="${getPublicPath()}/images/hotspot-legend.png"/>`,
    zindex: 100,
    abstract: `<p>&ldquo;Hotspots&rdquo; are places where temperatures are higher than expected. Scientific instruments on satellites can detect hotspots, which helps fire managers discover new wildfires. Individual hotspots are compiled into smooth gradients, where darker colors indicate greater densities of hotspots. Note that the instrument can also detect other hotspots unrelated to wildfire, such as flare stacks at oil drilling facilities on the North Slope of Alaska or even ship exhaust in the ocean.</p>
            `
  },
  {
    abstract: `

          <p>Details of Alaska’s land cover as detected by Landsat satellite imagery. Spatial resolution is 30 m (1 pixel = 30 m on the ground). Dominant land cover relates to wildfire because it varies across the landscape, and influences how a region may burn. Wildfires often change the dominant land cover type, and many fires have occurred since this layer was created in 2015.</p>`,
    id: "alaska_landcover_2015",
    wmsLayerName: "alaska_wildfires:alaska_landcover_2015",
    title: "Land cover types",
    zindex: 3,
    legendClassOverride: "is-one-third", //
    legend: `<table class="alaska-wildfires-legend alaska-landcover-2015">
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
          </table>`
  },
  {
    abstract: `

          <p>Older wildfire perimeters can be interesting to study in relation to newer fires. Previously burned areas often stop new fires from spreading due to a lack of fuel.</p>`,
    id: "historical_fire_perimiters",
    wmsLayerName: "historical_fire_perimiters",
    zindex: 10,
    styles: "historical_fire_polygon_buckets",
    title: "Historical fire perimeters",
    legend: `<table class="alaska-wildfires-legend historical-fire-perimeters">
            <tr><td><div class="h-40-69"></div></td><td>1940&mdash;1969</td></tr>
            <tr><td><div class="h-70-99"></div></td><td>1970&mdash;1999</td></tr>
            <tr><td><div class="h-00-17"></div></td><td>2000&mdash;2019</td></tr>
          </table>`
  },
  {
    abstract: `
    <p>This layer is derived from the U.S. National Ice Center’s Interactive Multisensor Snow and Ice Mapping System, which shows snow and ice coverage over the Northern Hemisphere at 1 km resolution. This map shows only snow coverage as an indicator of potential for early fire during spring in Alaska. <a href="https://usicecenter.gov/Resources/ImsInfo">Visit the data source</a>.</p>`,
    id: "snow_cover_3338",
    wmsLayerName: "alaska_wildfires:snow_cover_3338",
    styles: "alaska_wildfires:snow_cover",
    zindex: 10,
    title: "Today&rsquo;s Snow Cover",
    legend: `<table class="alaska-wildfires-legend snow-cover">
            <tr><td><div class="sc-open"></div></td><td>Open terrain (no snow)</td></tr>
            <tr><td><div class="sc-snow"></div></td><td>Snow</td></tr>
          </table>`
  },
  {
    abstract: `
    <p>This is the same information shown on the &ldquo;Smokey the Bear&rdquo; signs!  Fire managers use these ratings to understand the environment that is developing over time. Ratings are used to assess the risk of wildfires for areas of Alaska based on factors such as recent precipitation and buildup of vegetation in an area.</p>
    `,
    id: "spruceadj_3338",
    wmsLayerName: "alaska_wildfires:spruceadj_3338",
    styles: "alaska_wildfires:spruce_adjective",
    zindex: 10,
    title: "Today&rsquo;s Fire Danger Ratings",
    legend: `<table class="alaska-wildfires-legend smokey-bear">
      <tr><td><div class="sa-1"></div></td><td>Low</td></tr>
      <tr><td><div class="sa-2"></div></td><td>Medium</td></tr>
      <tr><td><div class="sa-3"></div></td><td>High</td></tr>
      <tr><td><div class="sa-4"></div></td><td>Very High</td></tr>
      <tr><td><div class="sa-5"></div></td><td>Extreme</td></tr>
    </table>`
  },
  {
    abstract: `
          <p>This layer shows output from ALFRESCO, a computer model that simulates the responses of Northern vegetation to climate change. Darker colors mean a greater chance of a region burning <strong>relative</strong> to other areas of the model output. These model projections, for 2000&ndash;2099, can be useful for planning, but they can&rsquo;t predict which specific places will burn.</p>`,
    id: "alfresco_relative_flammability_NCAR-CCSM4_rcp85_2000_2099",
    wmsLayerName:
      "alaska_wildfires:alfresco_relative_flammability_NCAR-CCSM4_rcp85_2000_2099",
    zindex: 5,
    title: "Projected relative flammability",
    legend: `<table class="alaska-wildfires-legend relative-flammability">
      <tr><td><div class="rf-1"></div></td><td>Less likely to burn</td></tr>
      <tr><td><div class="rf-2"></div></td><td></td></tr>
      <tr><td><div class="rf-3"></div></td><td>More likely to burn</td></tr>
      <tr><td><div class="rf-4"></div></td><td></td></tr>
      <tr><td><div class="rf-5"></div></td><td>Much more likely to burn</td></tr>
    </table>`
  }
];
