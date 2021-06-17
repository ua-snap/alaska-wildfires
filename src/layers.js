import moment from "moment";

export default [
  {
    id: "fires",
    wmsLayerName: "fires",
    title: "Wildfires, 2021",
    local: true,
    visible: true,
    legend: ``,
    abstract: `<table class="alaska-wildfires-legend active-fires">
    <tr><td><img src="images/fire-perimeter.png"/></td><td class="fire-text">Active Fire Perimeters</td></tr>
    <tr><td><img src="images/large-fire.png"/></td><td class="fire-text">Large Fire</td></tr>
    <tr><td><img src="images/small-fire.png"/></td><td class="fire-text">Small Fires</td></tr>
    </table>
    <p>This layer shows active and inactive fires for the 2021 season, with data pulled every half hour from the most recent available information from the <a href="https://fire.ak.blm.gov">Alaska Interagency Coordination Center</a> data services.  Small fires (an acre or less) are shown with a dot, and larger fires or fires with mapped perimeters have a halo to show their relative size.  Recently-discovered fires, even if large, may not have a mapped perimeter yet.  Inactive fires are shown in grey.</p>`
  },
  {
    id: "postgis_lightning",
    wmsLayerName: "postgis_lightning",
    title: "Lightning strikes, last 36 hours",
    layerName: "alaska_wildfires:postgis_lightning",
    legend: false,
    zindex: 20,
    abstract: `
            <table class="alaska-wildfires-legend lightning">
              <tr><td><div class="positive"><img src="images/lightning-positive.svg"/></div></td><td>Positive</td></tr>
              <tr><td><div class="negative"><img src="images/lightning-negative.svg"/></div></td><td>Negative</td></tr>
              <tr><td><div class="cloud2cloud">•</div></td><td>Cloud to cloud</td></tr>
            </table>
            <p>Lightning strikes are classified according to the type of charge released. Nearly 95% of lightning strikes carry a negative charge. Positively-charged strikes are rare but much more powerful, and can strike more than 20 miles away from a storm. This layer shows the last 36 hours of lightning activity; older lightning strikes fade over time. </p>`
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
    legend: false,
    abstract: `
            <p>Average number of lightning strikes per pixel</p><div><img src="static/lightning-legend.png" style="height: 200px"/></div>
            <p>Average of detected lightning strikes for Alaska’s wildfire season (May&ndash;August). Calculated by averaging all strikes within a 20&times;20 km pixel for each month across 30 years (1986&ndash;2015). </p>`
  },
  {
    id: "viirs",
    wmsLayerName: "viirs",
    title: "Hotspots, last 48 hours",
    local: true,
    legend: false,
    zindex: 100,
    abstract: `<p>&ldquo;Hotspots&rdquo; are places where temperatures are higher than expected. Scientific instruments on satellites can detect hotspots which helps fire managers discover new wildfires. Here, individual hotspots are compiled into smooth gradients, where darker colors indicate greater densities of hotspots. Note that the instrument can also detect other hotspots unrelated to wildfire, such as flare stacks at oil drilling facilities on the North Slope of Alaska or even ship exhaust in the ocean.</p>
            `
  },
  {
    abstract: `
          <table class="alaska-wildfires-legend alaska-landcover-2015">
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
          </table>
          <p>Details of Alaska’s land cover as detected by Landsat satellite imagery. Spatial resolution is 30 m (1 pixel = 30 m on the ground). Dominant land cover relates to wildfire because it varies across the landscape, and influences how a region may burn. Wildfires often change the dominant land cover type, and many fires have occurred since this layer was created in 2015. Which types burn the most?</p>`,
    id: "alaska_landcover_2015",
    wmsLayerName: "alaska_wildfires:alaska_landcover_2015",
    title: "Land cover types",
    zindex: 3,
    legend: false
  },
  {
    abstract: `
          <table class="alaska-wildfires-legend historical-fire-perimeters">
            <tr><td><div class="h-40-69"></div></td><td>1940&mdash;1969</td></tr>
            <tr><td><div class="h-70-99"></div></td><td>1970&mdash;1999</td></tr>
            <tr><td><div class="h-00-17"></div></td><td>2000&mdash;2019</td></tr>
          </table>
          <p>Older wildfire perimeters can be interesting to study in relation to newer fires. Previously burned areas often stop new fires from spreading due to a lack of fuel, but is this always true?</p>`,
    id: "historical_fire_perimiters",
    wmsLayerName: "historical_fire_perimiters",
    zindex: 10,
    styles: "historical_fire_polygon_buckets",
    title: "Historic fire perimeters",
    legend: false
  },
  {
    abstract: `
    <p>This layer is derived from the Interactive Multisensor Snow and Ice Mapping System (IMS)
    which shows snow and ice coverage over the Northern Hemisphere at 1km resolution. For this
    map, we have chosen to only show the snow coverage on the map to indicate potential for early
    fire potential during spring in Alaska. For more information about this layer, visit the <a href="https://usicecenter.gov/Resources/ImsInfo">U.S. National Ice Center's website</a>. </p>`,
    id: "snow_cover_3338",
    wmsLayerName: "alaska_wildfires:snow_cover_3338",
    styles: "alaska_wildfires:snow_cover",
    zindex: 10,
    title: "Today's Snow Cover",
    legend: false
  },
  {
    abstract: `
    <table class="spruce-adjective smokey-bear">
      <tr><td><div class="sa-1"></div></td><td>Low</td></tr>
      <tr><td><div class="sa-2"></div></td><td>Medium</td></tr>
      <tr><td><div class="sa-3"></div></td><td>High</td></tr>
      <tr><td><div class="sa-4"></div></td><td>Very High</td></tr>
      <tr><td><div class="sa-5"></div></td><td>Extreme</td></tr>
    </table>
    <p>Fire managers use these fire weather indexes to understand the environment that is developing over time.
    These are used to assess the risk of forest fires for areas of the state of Alaska based on factors such
    as recent precipitation and build up of trees / grass in the area.
    `,
    id: "spruceadj_3338",
    wmsLayerName: "alaska_wildfires:spruceadj_3338",
    styles: "alaska_wildfires:spruce_adjective",
    zindex: 10,
    title: "Daily Fire Danger Ratings",
    legend: false
  },
  {
    abstract: `
          <table class="alaska-wildfires-legend big-fire-years">
            <tr><td><div class="bf2004"></div></td><td>2004</td></tr>
            <tr><td><div class="bf2005"></div></td><td>2005</td></tr>
            <tr><td><div class="bf2009"></div></td><td>2009</td></tr>
            <tr><td><div class="bf2010"></div></td><td>2010</td></tr>
            <tr><td><div class="bf2013"></div></td><td>2013</td></tr>
            <tr><td><div class="bf2015"></div></td><td>2015</td></tr>
            <tr><td><div class="bf2019"></div></td><td>2019</td></tr>
          </table>
          <p>Extents of the largest recent fire seasons. Here, &ldquo;large&rdquo; means a burned area greater than one million acres.</p>`,
    id: "alaska_wildfires",
    wmsLayerName: "alaska_wildfires:historical_fire_perimiters",
    styles: "alaska_wildfires:big_fire_years",
    zindex: 10,
    title: "Largest fire seasons",
    legend: false
  },
  {
    abstract: `
          <p>This layer shows output from ALFRESCO, a computer model that simulates the responses of Northern vegetation to climate change. Darker colors mean a greater chance of a region burning. These model projections, for 2000&ndash;2099, can be useful for planning.</p>`,
    id: "alfresco_relative_flammability_NCAR-CCSM4_rcp85_2000_2099",
    wmsLayerName:
      "alaska_wildfires:alfresco_relative_flammability_NCAR-CCSM4_rcp85_2000_2099",
    zindex: 5,
    title: "Projected flammability",
    legend: false
  }
];
