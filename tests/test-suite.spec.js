import { test, expect } from '@playwright/test'

const url = 'http://localhost:8080'

// Set this to a community ID/name that has active wildfires near it currently.
// A community's alternate name needs to be included in communityName, so it's
// easier to pick a community that does not have an alternate name.
const communityId = 'AK146'
const communityName = 'Healy'

async function checkForLayers(tiles, expectedWmsLayers) {
  let layersPresent = {}
  for (let layer of expectedWmsLayers) {
    layersPresent[layer] = false
  }
  for (let layer of expectedWmsLayers) {
    const tileCount = await tiles.count();
    for (let i = 0; i < tileCount; i++) {
      let src = await tiles.nth(i).getAttribute('src')
      if (!layersPresent[layer] && src.includes(layer)) {
        layersPresent[layer] = true
      }
      // Return true as soon as all layers are found.
      if (Object.values(layersPresent).every(value => value === true)) {
        return true
      }
    }
  }
  return false
}

test('Intro text', async ({ page }) => {
  await page.goto(url)
  await page.setViewportSize({ width: 1728, height: 1078 })

  let src = await page.locator('.intro a:text-is("Alaska Interagency Coordination Center")').getAttribute('href')
  expect(src).toContain('https://fire.ak.blm.gov/')

  const glowText = await page.locator('.intro .glow').textContent()
  const regex = /As of (.*), there are (.*) active fires, and approximately (.*) acres have burned this fire season./
  const matches = glowText.match(regex)

  const dataDate = matches[1]
  const fireCount = matches[2]
  const acresBurned = matches[3]

  expect(dataDate).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/)
  expect(fireCount).toMatch(/^[0-9,]+$/)
  expect(acresBurned).toMatch(/^[0-9,]+$/)

  src = await page.locator('.intro a:text-is("Alaska Interagency Coordination Center")').getAttribute('href')
  expect(src).toContain('https://fire.ak.blm.gov/')

  src = await page.locator('.intro a:text-is("Fire Tally")').getAttribute('href')
  expect(src).toContain('https://snap.uaf.edu/tools/daily-fire-tally')

  src = await page.locator('a:text-is("protect yourself and your family from wildfire smoke")').getAttribute('href')
  expect(src).toContain('https://uaf-snap.org/project/epa-star-wfe')
})

test('Place selector autocomplete', async ({ page }) => {
  await page.goto(url)
  await page.setViewportSize({ width: 1728, height: 1078 })
  await page.fill('.place-selector input', 'Fairb')

  // Wait a bit for autocomplete options to load.
  await page.waitForTimeout(3000)

  await expect(page.locator('.dropdown-content .search-item')).toHaveCount(1)
})

test('Current conditions', async ({ page }) => {
  await page.goto(url)
  await page.setViewportSize({ width: 1728, height: 1078 })
  await page.fill('.place-selector input', communityName)

  // Wait a bit for autocomplete options to load.
  await page.waitForTimeout(3000)

  await page.click('.dropdown-menu .dropdown-item:has(div:text-is("' + communityName + '"))')

  // Wait a bit for data to load.
  await page.waitForTimeout(3000)

  let src = await page.locator('.intro a:text-is("Fire danger")').getAttribute('href')
  expect(src).toContain('https://en.wikipedia.org/wiki/National_Fire_Danger_Rating_System')

  await expect(page.locator('.intro table')).toHaveCount(2)

  const tables = page.locator('.intro table')
  const tableCount = await tables.count()
  for (let i = 0; i < tableCount; i++) {
    await expect(tables.nth(i)).toBeVisible()
  }
})

test('Active wildfires layer', async ({ page }) => {
  await page.goto(url)
  await page.setViewportSize({ width: 1728, height: 1078 })
  await expect.poll(() => page.locator('.leaflet-container .leaflet-marker-icon').count()).toBeGreaterThan(10)

  let legend = page.locator('.legend--item:has(table.active-fires)')
  expect(legend).toBeVisible()

  let src = await legend.locator('a:text-is("data services")').getAttribute('href')
  expect(src).toContain('https://fire.ak.blm.gov/predsvcs/maps.php')

  // Test disabling of wildfires layer.
  await page.click('#fires a')
  await expect(page.locator('.leaflet-container .leaflet-marker-icon')).toHaveCount(0)
})

test('Hotspots layer', async ({ page }) => {
  await page.goto(url)
  await page.setViewportSize({ width: 1728, height: 1078 })

  // Disable current wildfires layer.
  await page.click('#fires a')

  await page.click('#viirs a')

  await expect(page.locator('.leaflet-container .leaflet-heatmap-layer')).toBeVisible()

  let legend = page.locator('.legend--item:has(h4:text-is("Hotspots, last 48 hours"))')
  expect(legend).toBeVisible()

  let src = await legend.locator('img').last().getAttribute('src')
  expect(src).toContain('hotspot-legend')

  src = await legend.locator('a:text-is("NOAA Active Fire Detections from the VIIRS sensor")').getAttribute('href')
  expect(src).toContain('https://www.ospo.noaa.gov/Products/land/afiband.html')

  src = await legend.locator('a:text-is("data services")').getAttribute('href')
  expect(src).toContain('https://fire.ak.blm.gov/predsvcs/maps.php')

  src = await legend.locator('a:text-is("VIIRS Active Fire Detection")').getAttribute('href')
  expect(src).toContain('https://gina.alaska.edu/wp-content/uploads/2022/05/VIIRS_ActiveFiresAlgorithm_Quick_Guide.pdf')
})

test('Lightning strikes layer', async ({ page }) => {
  await page.goto(url)
  await page.setViewportSize({ width: 1728, height: 1078 })

  // Disable current wildfires layer.
  await page.click('#fires a')

  await page.click('#lightning_strikes a')

  // Check that the most recently added map tiles contain "lightning_strikes" in the URL of their src attribute.
  let src = await page.locator('.leaflet-container .leaflet-layer img').last().getAttribute('src')
  expect(src).toContain('lightning_strikes')

  let legend = page.locator('.legend--item:has(table.lightning)')
  expect(legend).toBeVisible()

  src = await legend.locator('a:text-is("data services")').getAttribute('href')
  expect(src).toContain('https://fire.ak.blm.gov/predsvcs/maps.php')
})

test('Fire danger layer', async ({ page }) => {
  await page.goto(url)
  await page.setViewportSize({ width: 1728, height: 1078 })

  // Disable current wildfires layer.
  await page.click('#fires a')

  await page.click('#spruceadj_3338 a')

  // Check that the most recently added map tiles contain "spruceadj_3338" in the URL of their src attribute.
  let src = await page.locator('.leaflet-container .leaflet-layer img').last().getAttribute('src')
  expect(src).toContain('spruceadj_3338')

  let legend = page.locator('.legend--item:has(table.smokey-bear)')
  expect(legend).toBeVisible()

  src = await legend.locator('a:text-is("layers provided by MesoWest Alaska Fires & Fuels website")').getAttribute('href')
  expect(src).toContain('https://akff.mesowest.org')
})


test('Current smoke plumes', async ({ page }) => {
  await page.goto(url)
  await page.setViewportSize({ width: 1728, height: 1078 })

  await page.click('#viirs_adp a')
  let tiles = page.locator('.leaflet-container .leaflet-layer img')
  let expectedWmsLayers = ['viirs_adp']
  let allLayersFound = await checkForLayers(tiles, expectedWmsLayers)
  expect(allLayersFound).toBe(true)

  let legend = page.locator('.legend--item:has(table.viirs-adp)').nth(0)
  expect(legend).toBeVisible()

  let src = await legend.locator('a:text-is("VIIRS Aerosol Detection Product")').getAttribute('href')
  expect(src).toContain('https://www.star.nesdis.noaa.gov/atmospheric-composition-training/documents/VIIRS_Aerosol_Detection_Product_Quick_Guide.pdf')

  src = await legend.locator('a:text-is("NOAA Aerosols and Atmospheric Composition Science Team")').getAttribute('href')
  expect(src).toContain('https://www.star.nesdis.noaa.gov/atmospheric-composition-training/index.php')
})

test('Current air quality', async ({ page }) => {
  await page.goto(url)
  await page.setViewportSize({ width: 1728, height: 1078 })

  // Disable current wildfires layer.
  await page.click('#fires a')

  await page.click('#purple_air a')
  await expect.poll(() => page.locator('.leaflet-container .leaflet-marker-icon.aqi').count()).toBeGreaterThan(10)

  let legend = page.locator('.legend--item:has(table.aqi-forecast)').nth(0)
  expect(legend).toBeVisible()

  let src = await legend.locator('a:text-is("Air Quality Index (AQI)")').getAttribute('href')
  expect(src).toContain('https://www.airnow.gov/aqi/aqi-basics/')

  src = await legend.locator('a:text-is("Read more here")').getAttribute('href')
  expect(src).toContain('https://www.epa.gov/pm-pollution/particulate-matter-pm-basics')

  src = await legend.locator('a:text-is("PurpleAir sensors")').getAttribute('href')
  expect(src).toContain('https://map.purpleair.com/air-quality-standards-us-epa-aqi?opt=%2F1%2Flp%2Fa10%2Fp604800%2FcC0#1/11.5/-30')
})

test('6-hour air quality forecast layer', async ({ page }) => {
  await page.goto(url)
  await page.setViewportSize({ width: 1728, height: 1078 })

  // Disable current wildfires layer.
  await page.click('#fires a')

  await page.click('#aqi_forecast_6_hrs a')

  await page.waitForTimeout(3000)

  // Check that the most recently added map tiles contain "aqi_forecast_6_hrs" in the URL of their src attribute.
  let src = await page.locator('.leaflet-container .leaflet-layer img').last().getAttribute('src')
  expect(src).toContain('aqi_forecast_6_hrs')

  let legend = page.locator('.legend--item:has(table.aqi-forecast)').nth(1)
  expect(legend).toBeVisible()

  src = await legend.locator('a:text-is("Read more here")').getAttribute('href')
  expect(src).toContain('https://www.epa.gov/pm-pollution/particulate-matter-pm-basics')

  src = await legend.locator('a:text-is("online data portal in the NASA Center for Climate Simulation")').getAttribute('href')
  expect(src).toContain('https://gmao.gsfc.nasa.gov/GMAO_products/NRT_products.php')

})

test('12-hour air quality forecast layer', async ({ page }) => {
  await page.goto(url)
  await page.setViewportSize({ width: 1728, height: 1078 })

  // Disable current wildfires layer.
  await page.click('#fires a')

  await page.click('#aqi_forecast_12_hrs a')

  // Check that the most recently added map tiles contain "aqi_forecast_12_hrs" in the URL of their src attribute.
  let src = await page.locator('.leaflet-container .leaflet-layer img').last().getAttribute('src')
  expect(src).toContain('aqi_forecast_12_hrs')

  let legend = page.locator('.legend--item:has(table.aqi-forecast)').nth(2)
  expect(legend).toBeVisible()

  src = await legend.locator('a:text-is("Read more here")').getAttribute('href')
  expect(src).toContain('https://www.epa.gov/pm-pollution/particulate-matter-pm-basics')

  src = await legend.locator('a:text-is("online data portal in the NASA Center for Climate Simulation")').getAttribute('href')
  expect(src).toContain('https://gmao.gsfc.nasa.gov/GMAO_products/NRT_products.php')
})

test('24-hour air quality forecast layer', async ({ page }) => {
  await page.goto(url)
  await page.setViewportSize({ width: 1728, height: 1078 })

  // Disable current wildfires layer.
  await page.click('#fires a')

  await page.click('#aqi_forecast_24_hrs a')

  // Check that the most recently added map tiles contain "aqi_forecast_24_hrs" in the URL of their src attribute.
  let src = await page.locator('.leaflet-container .leaflet-layer img').last().getAttribute('src')
  expect(src).toContain('aqi_forecast_24_hrs')

  let legend = page.locator('.legend--item:has(table.aqi-forecast)').nth(3)
  expect(legend).toBeVisible()

  src = await legend.locator('a:text-is("Read more here")').getAttribute('href')
  expect(src).toContain('https://www.epa.gov/pm-pollution/particulate-matter-pm-basics')

  src = await legend.locator('a:text-is("online data portal in the NASA Center for Climate Simulation")').getAttribute('href')
  expect(src).toContain('https://gmao.gsfc.nasa.gov/GMAO_products/NRT_products.php')
})

test('48-hour air quality forecast layer', async ({ page }) => {
  await page.goto(url)
  await page.setViewportSize({ width: 1728, height: 1078 })

  // Disable current wildfires layer.
  await page.click('#fires a')

  await page.click('#aqi_forecast_48_hrs a')

  // Check that the most recently added map tiles contain "aqi_forecast_48_hrs" in the URL of their src attribute.
  let src = await page.locator('.leaflet-container .leaflet-layer img').last().getAttribute('src')
  expect(src).toContain('aqi_forecast_48_hrs')

  let legend = page.locator('.legend--item:has(table.aqi-forecast)').nth(4)
  expect(legend).toBeVisible()

  src = await legend.locator('a:text-is("Read more here")').getAttribute('href')
  expect(src).toContain('https://www.epa.gov/pm-pollution/particulate-matter-pm-basics')

  src = await legend.locator('a:text-is("online data portal in the NASA Center for Climate Simulation")').getAttribute('href')
  expect(src).toContain('https://gmao.gsfc.nasa.gov/GMAO_products/NRT_products.php')
})

test('Land cover types', async ({ page }) => {
  await page.goto(url)
  await page.setViewportSize({ width: 1728, height: 1078 })

  // Disable current wildfires layer.
  await page.click('#fires a')

  await page.click('#alaska_landcover_2015 a')

  // Check that the most recently added map tiles contain "wildfires" in the URL of their src attribute.
  let src = await page.locator('.leaflet-container .leaflet-layer img').last().getAttribute('src')
  expect(src).toContain('alaska_landcover_2015')

  let legend = page.locator('.legend--item:has(table.alaska-landcover-2015)')
  expect(legend).toBeVisible()

  src = await legend.locator('a:text-is("North American Land Change Monitoring System, 2015")').getAttribute('href')
  expect(src).toContain('https://eros.usgs.gov/doi-remote-sensing-activities/2019/usgs/nalcms-release-new-land-cover-north-america')
})

test('Historical lightning strikes', async ({ page }) => {
  await page.goto(url)
  await page.setViewportSize({ width: 1728, height: 1078 })

  // Disable current wildfires layer.
  await page.click('#fires a')

  await page.click('#gridded_lightning a')

  // Check that the most recently added map tiles contain "lightning-monthly-climatology" in the URL of their src attribute.
  // Also check that the layer loaded is for the month of May.
  let src = await page.locator('.leaflet-container .leaflet-layer img').last().getAttribute('src')
  expect(src).toContain('lightning-monthly-climatology')
  expect(src).toContain('2015-5-01')

  // Click the #gridded_lightning select dropdown and select "August"
  await page.selectOption('#gridded_lightning select', '8')

  // Check that the most recently added map tiles contain "lightning-monthly-climatology" in the URL of their src attribute.
  // Also check that the layer loaded is for the month of August.
  src = await page.locator('.leaflet-container .leaflet-layer img').last().getAttribute('src')
  expect(src).toContain('lightning-monthly-climatology')
  expect(src).toContain('2015-8-01')

  let legend = page.locator('.legend--item:has(table.lightning-climatology)')
  expect(legend).toBeVisible()

  src = await legend.locator('a:text-is("this academic paper")').getAttribute('href')
  expect(src).toContain('https://journals.ametsoc.org/view/journals/apme/59/6/JAMC-D-19-0209.1.xml')

  src = await legend.locator('a:text-is("the dataset can be downloaded here")').getAttribute('href')
  expect(src).toContain('https://search.dataone.org/view/10.24431_rw1k45z_2020_7_23_23548')
})

test('Historical fire perimeters', async ({ page }) => {
  await page.goto(url)
  await page.setViewportSize({ width: 1728, height: 1078 })

  // Disable current wildfires layer.
  await page.click('#fires a')

  await page.click('#historical_fire_perimeters a')

  // Check that the most recently added map tiles contain "lightning-monthly-climatology" in the URL of their src attribute.
  let src = await page.locator('.leaflet-container .leaflet-layer img').last().getAttribute('src')
  expect(src).toContain('historical_fire_perimeters')

  let legend = page.locator('.legend--item:has(table.historical-fire-perimeters)')
  expect(legend).toBeVisible()

  src = await legend.locator('a:text-is("data services")').getAttribute('href')
  expect(src).toContain('https://fire.ak.blm.gov/predsvcs/maps.php')
})

test('Historical modeled flammability', async ({ page }) => {
  await page.goto(url)
  await page.setViewportSize({ width: 1728, height: 1078 })

  // Disable current wildfires layer.
  await page.click('#fires a')

  await page.click('#alfresco_relative_flammability_cru_ts40_historical_1950_2008_iem a')

  // Check that the most recently added map tiles contain expected substrings in the URL of their src attribute.
  let src = await page.locator('.leaflet-container .leaflet-layer img').last().getAttribute('src')
  expect(src).toContain('alfresco_relative_flammability_30yr')
  expect(src).toContain('alaska_wildfire_explorer_historical')

  let legend = page.locator('.legend--item:has(h4:text-is("Historical modeled flammability"))')
  expect(legend).toBeVisible()

  src = await legend.locator('a:text-is("can be downloaded here")').getAttribute('href')
  expect(src).toContain('https://catalog.snap.uaf.edu/geonetwork/srv/eng/catalog.search#/metadata/eeaaca2c-0280-4226-b126-fda42a2b6214')
})

test('Projected flammability', async ({ page }) => {
  await page.goto(url)
  await page.setViewportSize({ width: 1728, height: 1078 })

  // Disable current wildfires layer.
  await page.click('#fires a')

  await page.click('#alfresco_relative_flammability_NCAR-CCSM4_rcp85_2070_2099 a')

  // Check that the most recently added map tiles contain expected substrings in the URL of their src attribute.
  let src = await page.locator('.leaflet-container .leaflet-layer img').last().getAttribute('src')
  expect(src).toContain('alfresco_relative_flammability_30yr')
  expect(src).toContain('alaska_wildfire_explorer_projected')

  let legend = page.locator('.legend--item:has(h4:text-is("Projected flammability"))')
  expect(legend).toBeVisible()

  src = await legend.locator('a:text-is("can be downloaded here")').getAttribute('href')
  expect(src).toContain('https://catalog.snap.uaf.edu/geonetwork/srv/eng/catalog.search#/metadata/eeaaca2c-0280-4226-b126-fda42a2b6214')
})

test('Boundary layers', async ({ page }) => {
  await page.goto(url)
  await page.setViewportSize({ width: 1728, height: 1078 })

  // Disable current wildfires layer.
  await page.click('#fires a')

  let src

  // Check that the most recently added map tiles contain "all_gmus" in the URL of their src attribute.
  await page.click('#gmu a')
  src = await page.locator('.leaflet-container .leaflet-layer img').last().getAttribute('src')
  expect(src).toContain('all_gmus')

  // Check that the most recently added map tiles contain "all_fire_zones" in the URL of their src attribute.
  await page.click('#fire_zones a')
  src = await page.locator('.leaflet-container .leaflet-layer img').last().getAttribute('src')
  expect(src).toContain('all_fire_zones')
})

test('Footer links', async ({ page }) => {
  await page.goto(url)
  await page.setViewportSize({ width: 1728, height: 1078 })

  let src = await page.locator('.footer a:text-is("Alaska Interagency Coordination Center")').first().getAttribute('href')
  expect(src).toContain('https://fire.ak.blm.gov/aicc.php')

  src = await page.locator('.footer a:text-is("MesoWest data services")').getAttribute('href')
  expect(src).toContain('https://mesowest.utah.edu')

  src = await page.locator('.footer a:text-is("Global Modeling and Assimilation Office (GMAO)")').getAttribute('href')
  expect(src).toContain('https://gmao.gsfc.nasa.gov/')

  src = await page.locator('.footer a:text-is("PurpleAir")').getAttribute('href')
  expect(src).toContain('https://www2.purpleair.com/')

  src = await page.locator('.footer a:text-is("Geographic Information Network of Alaska")').getAttribute('href')
  expect(src).toContain('https://gina.alaska.edu')

  src = await page.locator('.footer a:text-is("NOAA")').getAttribute('href')
  expect(src).toContain('https://www.nesdis.noaa.gov/about/our-offices/office-of-low-earth-orbit-observations')

  src = await page.locator('.footer a:text-is("Alaska Fire Service")').getAttribute('href')
  expect(src).toContain('https://www.blm.gov/programs/fire-and-aviation/regional-info/alaska-fire-service')

  src = await page.locator('.footer a:text-is("Alaska Interagency Coordination Center")').last().getAttribute('href')
  expect(src).toContain('https://fire.ak.blm.gov')

  src = await page.locator('.footer a:text-is("Scenarios Network for Alaska and Arctic Planning")').getAttribute('href')
  expect(src).toContain('https://www.snap.uaf.edu/')

  src = await page.locator('.footer a:text-is("Alaska Climate Adaptation Science Center")').getAttribute('href')
  expect(src).toContain('https://akcasc.org')

  src = await page.locator('.footer a:text-is("Institute for Circumpolar Health Studies")').getAttribute('href')
  expect(src).toContain('https://www.uaa.alaska.edu/academics/college-of-health/departments/population-health-sciences/institute-for-circumpolar-health-studies')

  src = await page.locator('.footer a:text-is("Center for Disaster Resilient Communities")').getAttribute('href')
  expect(src).toContain('https://cdrc.uw.edu')

  src = await page.locator('.footer a:text-is("EPA Grant Number R840479")').getAttribute('href')
  expect(src).toContain('https://cfpub.epa.gov/ncer_abstracts/index.cfm/fuseaction/display.abstractDetail/abstract_id/11349')

  src = await page.locator('.footer a:text-is("International Arctic Research Center")').getAttribute('href')
  expect(src).toContain('https://uaf-iarc.org/')

  src = await page.locator('.footer a:text-is("University of Alaska Fairbanks")').getAttribute('href')
  expect(src).toContain('https://uaf.edu/uaf/')

  src = await page.locator('.footer a:text-is("uaf-snap-data-tools@alaska.edu")').getAttribute('href')
  expect(src).toContain('mailto:uaf-snap-data-tools@alaska.edu')

  src = await page.locator('.footer a:text-is("Visit the SNAP Climate + Weather Tools page")').getAttribute('href')
  expect(src).toContain('https://uaf-snap.org/tools-overview/')

  src = await page.locator('.footer a:text-is("University of Alaska")').getAttribute('href')
  expect(src).toContain('https://www.alaska.edu/')

  src = await page.locator('.footer a:text-is("policy of non-discrimination")').getAttribute('href')
  expect(src).toContain('https://www.alaska.edu/nondiscrimination/')

  src = await page.locator('.footer a:text-is("Learn more about UA’s notice of web accessibility")').getAttribute('href')
  expect(src).toContain('https://www.alaska.edu/webaccessibility/')
})

test('Permalinks', async ({ page }) => {
  let permalinkUrl = url + '/' + communityId + '?layers=0,1,2,3'
  await page.goto(permalinkUrl)
  await page.setViewportSize({ width: 1728, height: 1078 })

  // Check to see if community is set to communityName and intro table has loaded.
  await expect(page.locator('.place-selector input')).toHaveValue(communityName)
  await expect(page.locator('.intro .title strong')).toHaveText(communityName)
  await expect(page.locator('.intro table')).toHaveCount(2)

  let legend

  // Check current wildfires layer.
  await expect.poll(() => page.locator('.leaflet-container .leaflet-marker-icon').count()).toBeGreaterThan(10)
  legend = page.locator('.legend--item:has(table.active-fires)')
  expect(legend).toBeVisible()

  // Check hotspots layer.
  await expect(page.locator('.leaflet-container .leaflet-heatmap-layer')).toBeVisible()
  legend = page.locator('.legend--item:has(h4:text-is("Hotspots, last 48 hours"))')
  expect(legend).toBeVisible()

  // Check fire danger ratings and lightning strikes layers.
  let tiles = page.locator('.leaflet-container .leaflet-layer img')
  let expectedWmsLayers = ['spruceadj_3338', 'lightning_strikes']
  let allLayersFound = await checkForLayers(tiles, expectedWmsLayers)
  expect(allLayersFound).toBe(true)

  legend = page.locator('.legend--item:has(table.lightning)')
  expect(legend).toBeVisible()

  legend = page.locator('.legend--item:has(table.smokey-bear)')
  expect(legend).toBeVisible()
})
