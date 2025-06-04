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
            <p v-if="fireUpdateDate && fireCount">
              <span class="glow"
                >As of {{ dataDate }}, there are
                <strong>{{ fireCount }}</strong> active fires, and approximately
                <strong>{{ acresBurned }}</strong> acres have burned this fire
                season.</span
              >
            </p>
            <p>
              To compare the current fire year to high fire years since 2004,
              visit the
              <a href="https://snap.uaf.edu/tools/daily-fire-tally"
                >Fire Tally</a
              >
              tool.
            </p>
            <p class="intro--legend">
              <img src="@/assets/active-perimeter.svg" />Active fires with
              mapped perimeters have a &lsquo;halo&rsquo; to show relative size.
            </p>
            <ul>
              <li>Click one or more map layer names to activate.</li>
              <li>
                Legends are shown below the map, scroll down to see details.
              </li>
              <li>
                Learn more about how to use this tool to
                <a href="https://uaf-snap.org/project/epa-star-wfe"
                  >protect yourself and your family from wildfire smoke</a
                >.
              </li>
            </ul>
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
        <div class="container">
          <div class="clamp">
            <h2 class="is-2 title">❄️ This tool is offline for the winter.</h2>
            <h3 class="is-2 subtitle">
              It will come back online in April 2025.
            </h3>
            <div class="content is-size-4">
              <p>
                Thanks for visiting this site! During the Alaska wildfire
                season, this tool shows the following kinds of information:
              </p>
              <ul>
                <li>
                  <strong>Updated twice per day:</strong> locations and sizes of
                  active wildfires, hotspots and recent lightning, and air
                  quality forecasts up to 48 hours
                </li>
                <li>
                  <strong>Updated every 10 minutes:</strong> air quality sensors
                  showing PM2.5 AQI (Air Quality Index)
                </li>
                <li>
                  Academic data layers for research, including lightning
                  frequency, projected flammability, historical fire scars and
                  terrain classification
                </li>
              </ul>

              <p>
                The real-time data feeds stop during the winter, so we take the
                map tool offline. Email us at
                <a href="mailto:uaf-snap-data-tools@alaska.edu"
                  >uaf-snap-data-tools@alaska.edu</a
                >
                if you have any questions!
              </p>
            </div>

            <h3 class="title is-3">
              Interested in general information about wildfires?
            </h3>
            <div class="content is-size-4">
              <ul>
                <li>
                  Learn more about wildfire in Arctic ecosystems from
                  <a
                    href="https://courses.edx.org/videos/block-v1:AlaskaX+IARC100+2T2024+type@video+block@460e8ddddab04171bcaafba0919c7d86"
                  >
                    SNAP Director and wildfire ecologist Dr. Scott Rupp in this
                    video on EdX </a
                  >.
                </li>
                <li>
                  Our partner research unit the
                  <a href="https://www.frames.gov/afsc/home"
                    >Alaska Fire Science Consortium</a
                  >
                  is another great place for resources on fire management in
                  Alaska.
                </li>
              </ul>
            </div>

            <h3 class="title is-3">
              Looking for online tools and data about wildfire?
            </h3>
            <div class="content is-size-4">
              <ul>
                <li>
                  You can find out more about historical and projected
                  flammability across Alaska and western Canada in our
                  <a href="https://northernclimatereports.org">
                    Northern Climate Reports
                  </a>
                  tool.
                </li>
                <li>
                  Our
                  <a href="https://snap.uaf.edu/tools/daily-fire-tally"
                    >Fire Tally tool</a
                  >, developed in partnership with the Alaska Interagency
                  Coordination Center, displays historical acres burned for
                  different wildfire seasons across different areas in Alaska.
                </li>
                <li>
                  Our
                  <a href="https://snap.uaf.edu/tools/fish-and-fire/"
                    >Fish and Fire in Interior Alaska</a
                  >
                  tool explores fire management options in the context of runoff
                  and river growth for the watershed around Fairbanks, Alaska.
                </li>
                <li>
                  Many of the data feeds that are used by this tool come from
                  the
                  <a href="https://fire.ak.blm.gov"
                    >Alaska Interagency Coordination Center</a
                  >
                  where data and reports for current and past fire seasons are
                  often available.
                </li>
              </ul>
              <p>Looking forward to seeing you here next year!</p>
            </div>
          </div>
        </div>
      </section>
    </div>
    <Footer />
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
  font-size: 1.5rem;
  background-color: #f3f7a8;
}

.intro--legend {
  img {
    vertical-align: middle;
    display: inline-block;
    margin-right: 1rem;
    height: 75px;
  }
}
</style>

<script>
import { mapGetters } from "vuex";
import FireMap from "@/components/FireMap.vue";
import PlaceSelector from "@/components/PlaceSelector.vue";
import FireAPIOutput from "@/components/FireAPIOutput";
import Footer from "@/components/Footer";

export default {
  name: "App",
  components: { FireMap, PlaceSelector, FireAPIOutput, Footer },
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
    fireCountPresent() {
      return this.fireUpdateDate && this.fireCount > 0;
    },
    dataDate() {
      return this.fireUpdateDate.format("MMMM D, YYYY");
    },
    ...mapGetters({
      fireUpdateDate: "fireUpdateDate",
      fireCount: "fireCount",
      acresBurned: "acresBurned",
    }),
  },
  created() {
    const path = (/#!(\/.*)$/.exec(this.$route.fullPath) || [])[1];
    if (path) {
      this.$router.push({ path: path });
    }

    // Remove the "layers" GET parameter if it is empty
    if (this.$route.query.layers === "") {
      this.$router.push({ query: {} });
    }

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
