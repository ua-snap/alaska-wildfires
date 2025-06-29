<template>
  <footer class="footer">
    <div class="container">
      <div class="content is-size-4">
        <p class="data-credit">
          Information about the current fire season comes from the
          <a href="https://fire.ak.blm.gov/aicc.php">
            Alaska Interagency Coordination Center</a
          >
          and the
          <a href="https://mesowest.utah.edu">MesoWest data services</a>. Smoke
          forecasts are provided by the
          <a href="https://gmao.gsfc.nasa.gov/"
            >Global Modeling and Assimilation Office (GMAO)</a
          >
          at NASA Goddard Space Flight Center. Local air quality sensor data
          feeds are provided through the
          <a href="https://dec.alaska.gov/"
            >Alaska Department of Environmental Conservation</a
          >
          and <a href="https://www2.purpleair.com/">PurpleAir</a>.
        </p>
        <p>
          VIIRS Active Fire Detections are provided by the
          <a href="https://gina.alaska.edu"
            >Geographic Information Network of Alaska</a
          >
          with support from
          <a
            href="https://www.nesdis.noaa.gov/about/our-offices/office-of-low-earth-orbit-observations"
            >NOAA</a
          >
          and the Bureau of Land Management&rsquo;s
          <a
            href="https://www.blm.gov/programs/fire-and-aviation/regional-info/alaska-fire-service"
            >Alaska Fire Service</a
          >. Data are accessed from the
          <a href="https://fire.ak.blm.gov"
            >Alaska Interagency Coordination Center</a
          >.
        </p>
        <p>
          This tool was developed by the
          <a href="https://www.snap.uaf.edu/" title="👍"
            >Scenarios Network for Alaska and Arctic Planning</a
          >
          in collaboration with the
          <a href="https://akcasc.org"
            >Alaska Climate Adaptation Science Center</a
          >, the University of Alaska Anchorage
          <a href="https://www.uaa.alaska.edu/academics/college-of-health/departments/population-health-sciences/institute-for-circumpolar-health-studies"
            >Institute for Circumpolar Health Studies</a
          >, the University of Washington
          <a href="https://cdrc.uw.edu"
            >Center for Disaster Resilient Communities</a
          >, <a href="https://www.loudentribe.org/">Louden Tribe</a>, the <a href="https://nvgakona.com/">Native Village of Gakona</a>, <a href="https://www.igiugig.com/tribal-government">Igiugig Village Council</a>, 
          <a href="https://crnative.org/">Copper River Native Association</a
            >, 
          <a href="https://www.anthc.org/what-we-do/climate-initiatives/center-for-climate-and-health/">ANTHC</a
            >, the 
          <a href="https://www.frames.gov/afsc/home"
            >Alaska Fire Science Consortium</a
          >, the 
          <a href="https://www.muni.org/Departments/health/Admin/environment/pages/default.aspx"
            >Anchorage Health Department Environmental Health Program</a
          >, and the 
          <a href="https://health.alaska.gov/en/division-of-public-health/epidemiology/environmental-public-health/"
            >Alaska Department of Health Environmental Public Health Program</a
          >. Development was partially funded by
          <a
            href="https://cfpub.epa.gov/ncer_abstracts/index.cfm/fuseaction/display.abstractDetail/abstract_id/11349"
            >EPA Grant Number R840479</a
          >. SNAP is a research group in the
          <a href="https://uaf-iarc.org/"
            >International Arctic Research Center</a
          >
          at the
          <a href="https://uaf.edu/uaf/">University of Alaska Fairbanks</a>.
        </p>
        <p>
          Please contact
          <a href="mailto:uaf-snap-data-tools@alaska.edu"
            >uaf-snap-data-tools@alaska.edu</a
          >
          if you have questions or would like to provide feedback for this tool.
          <a href="https://uaf-snap.org/tools-overview/"
            >Visit the SNAP Climate + Weather Tools page</a
          >
          to see our full suite of interactive web tools.
        </p>
        <p>
          Copyright &copy; {{ year }} University of Alaska Fairbanks. All rights
          reserved.
        </p>
        <p>
          The <a href="https://www.alaska.edu/">University of Alaska</a> is an
          Equal Opportunity/Equal Access Employer and Educational Institution.
          The University is committed to a
          <a href="https://www.alaska.edu/nondiscrimination/"
            >policy of non-discrimination</a
          >
          against individuals on the basis of any legally protected status.
        </p>
        <p>
          UA is committed to providing accessible websites.
          <a href="https://www.alaska.edu/webaccessibility/"
            >Learn more about UA&rsquo;s notice of web accessibility</a
          >. If we can help you access this website&rsquo;s content,
          <a href="mailto:uaf-snap-data-tools@alaska.edu">email us!</a>
        </p>
        <div class="logo mt-6">
          <a href="https://uaf.edu/uaf/">
            <img src="@/assets/UAF.svg" alt="UAF Logo" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "Footer",
  computed: {
    year() {
      return new Date().getFullYear();
    },
  },
};
</script>

<style lang="scss">
footer {
  box-shadow: inset 0 7px 9px -7px rgba(0, 0, 0, 0.4);

  .content {
    max-width: 55rem;
    margin: 0 auto;
    .logo {
      text-align: center;
    }
  }
}
</style>
