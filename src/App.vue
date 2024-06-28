<template>
  <div id="app">
    <div class="banner">
      University of Alaska Fairbanks • International Arctic Research Center
    </div>
    <header>
      <img src="@/assets/ak_shadowed.png" alt="" />
      <h1>Alaska Wildfire Explorer</h1>
      <h2>
        See active fire locations and sizes compared to smoke conditions,
        hotspots, lightning, and more.
      </h2>
    </header>

    <div v-if="active">
      <section class="section">
        <div class="container">
          <div class="intro content clamp is-size-3">
            <p>
              This site shows data that aids understanding of Alaska&rsquo;s
              wildfire landscape.
            </p>
          </div>
          <div class="intro content clamp is-size-4">
            <p>
              Use the map below to see where fires are burning, air quality
              conditions across the state of Alaska, and more data layers
              produced by scientists in the fire research community.
              <strong
                >It is not designed for fire management decision-making</strong
              >. For the most current information, visit the
              <a href="https://fire.ak.blm.gov/"
                >Alaska Interagency Coordination Center</a
              >.
            </p>
          </div>

          <div class="intro content is-size-4 clamp">
            <p v-if="fireCount > 0">
              <span class="glow"
                >As of {{ date }}, there are
                <strong>{{ fireCount }}</strong> active fires, and approximately
                <strong>{{ acresBurned }}</strong> acres have burned.</span
              ><br />To compare the current fire year to high fire years since
              2004, visit the
              <a href="https://snap.uaf.edu/tools/daily-fire-tally"
                >Fire Tally</a
              >
              tool.
            </p>
            <p class="intro--legend">
              <img src="@/assets/fire-perimeter.png" />Active fires with mapped
              perimeters have a &lsquo;halo&rsquo; to show relative size.
            </p>
            <p>
              Click one or more map layer names to activate. Scroll down to see
              details on each layer.<br /><span class="small"
                >Shift-click inside Alaska to get current conditions at that
                point.</span
              >
            </p>
          </div>
          <div class="intro content is-size-4 clamp">
            <PlaceSelector />
            <FireAPIOutput />
          </div>
        </div>
        <FireMap></FireMap>
      </section>
    </div>
    <div v-else>
      <section class="section">
        <div class="container content is-large">
          <h3>Site offline until April, 2025</h3>
          <p>
            This map and tool will be restored in April this year, at the start
            of the 2025 wildfire season.
          </p>
          <p>
            Any questions? Email us at
            <a href="mailto:uaf-snap-data-tools@alaska.edu"
              >uaf-snap-data-tools@alaska.edu</a
            >.
          </p>
        </div>
      </section>
    </div>

    <footer class="footer">
      <div class="container">
        <div class="columns">
          <div class="logos column is-one-fifth">
            <a href="https://uaf.edu/uaf/">
              <img src="@/assets/UAF.svg" alt="UAF Logo" />
            </a>
          </div>
          <div class="column content is-size-4">
            <p class="data-credit">
              Information about the current fire season comes from the
              <a href="https://fire.ak.blm.gov/aicc.php">
                Alaska Interagency Coordination Center</a
              >
              and the
              <a href="https://mesowest.utah.edu">MesoWest data services</a>.
              Smoke forecasts are provided by the
              <a href="https://gmao.gsfc.nasa.gov/"
                >Global Modeling and Assimilation Office (GMAO)</a
              >
              at NASA Goddard Space Flight Center and local air quality sensor
              data feeds are provided through
              <a href="https://www2.purpleair.com/">PurpleAir</a>.
            </p>
            <p>
              This tool was developed by the
              <a href="https://www.snap.uaf.edu/" title="👍"
                >Scenarios Network for Alaska and Arctic Planning</a
              >
              in collaboration with the
              <a href="https://akcasc.org"
                >Alaska Climate Adaptation Science Center</a
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
              if you have questions or would like to provide feedback for this
              tool.
              <a href="https://uaf-snap.org/tools-overview/"
                >Visit the SNAP Climate + Weather Tools page</a
              >
              to see our full suite of interactive web tools.
            </p>
            <p>
              Copyright &copy; {{ year }} University of Alaska Fairbanks. All
              rights reserved.
            </p>
            <p>
              UA is an affirmative action / equal opportunity employer,
              educational institution and provider, and prohibits illegal
              discrimination against any individual.
              <a href="https://www.alaska.edu/nondiscrimination/"
                >Statement of Nondiscrimination</a
              >
              and
              <a
                href="https://www.alaska.edu/records/records/compliance/gdpr/ua-privacy-statement/"
                >Privacy Statement</a
              >
            </p>
            <p>
              UA is committed to providing accessible websites.
              <a href="https://www.alaska.edu/webaccessibility/"
                >Learn more about UA&rsquo;s notice of web accessibility</a
              >. If we can help you access this website&rsquo;s content,
              <a href="mailto:uaf-snap-data-tools@alaska.edu">email us!</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.banner {
  text-transform: uppercase;
  background-color: #545454;
  padding: 0.3rem;
  color: #efefef;
  letter-spacing: 0.2rem;
  text-align: center;
  font-size: 0.8rem;
}

header {
  padding-top: 3rem;

  background-image: url("assets/nenana-fire-rev-cropt.jpg");
  background-size: cover;

  text-align: center;

  img {
    max-width: 15rem;
  }
  h1 {
    margin-top: -1rem;
    padding: 0 0 1rem 0;
    font-family: "Yellowtail";
    color: white !important;
    text-shadow: 3px 3px 3px #000;

    @media (max-width: 458px) {
      font-size: 3.25rem;
      line-height: 0.95;
      margin-top: -0.5rem;
    }
    @media (min-width: 459px) and (max-width: 604px) {
      font-size: 3.1rem;
    }
    @media (min-width: 605px) and (max-width: 704px) {
      font-size: 4rem;
    }
    @media (min-width: 705px) and (max-width: 951px) {
      font-size: 4.75rem;
    }
    @media (min-width: 952px) {
      font-size: 6.5rem;
    }
  }
  h2 {
    border-top: 0.25rem solid white;
    background-color: rgb(39, 41, 26);
    padding: 0.5rem 0 0.75rem;
    color: white;
    font-weight: 400;
    font-size: 1.75rem;
  }
}

.clamp {
  max-width: 55rem;
  margin: 2rem auto;
}

.glow {
  background-color: #f3f7a8;
}

.intro--legend {
  img {
    vertical-align: middle;
    display: inline-block;
    margin-right: 1rem;
  }
}

footer {
  box-shadow: inset 0 7px 9px -7px rgba(0, 0, 0, 0.4);

  .logos.column {
    text-align: right;
    a img {
      max-width: 90%;
      display: inline-block;
      margin-top: 0.45rem;
    }
    @media (max-width: 768px) {
      text-align: center;
      a img {
        width: 200px;
      }
    }
  }
  .content.column p {
    width: 90%;
    @media (max-width: 768px) {
      width: 100%;
    }
  }
}
</style>

<script>
import { mapGetters } from "vuex";
import FireMap from "@/components/FireMap.vue";
import PlaceSelector from "@/components/PlaceSelector.vue";
import FireAPIOutput from "@/components/FireAPIOutput";

export default {
  name: "App",
  components: { FireMap, PlaceSelector, FireAPIOutput },
  data() {
    return {
      // Convert sting to boolean
      active: process.env.VUE_APP_ACTIVE == "true",
    };
  },
  computed: {
    year() {
      return new Date().getFullYear();
    },
    date() {
      return new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    },
    ...mapGetters({
      fireCount: "fireCount",
      acresBurned: "acresBurned",
    }),
  },
  created() {
    this.fetch();
  },
  methods: {
    async fetch() {
      await this.$store.dispatch("fetchCommunities");
      await this.$store.dispatch("fetchUpdateStatus");
    },
  },
};
</script>
