<template>
  <div id="app">
    <div class="banner">
      University of Alaska Fairbanks • International Arctic Research Center
    </div>
    <header>
      <img src="@/assets/ak_shadowed.png" alt="" />
      <h1>Alaska Wildfire Explorer</h1>
      <h2>
        See active fire locations and sizes compared to fire history, lightning,
        land cover, and more.
      </h2>
    </header>

    <section class="section">
      <div class="container">
        <div class="intro content is-large">
          <p>
            See current fire information (updated daily) along with work done by
            University of Alaska researchers and other scientists that shows
            historical data and estimated future fire conditions. Information
            about the current fire season comes from the Alaska Interagency
            Coordination Center and the MesoWest data services.
          </p>
          <p>
            The Wildfire Explorer shows data that aids understanding of
            Alaska&rsquo;s fire landscape. It is not designed for fire
            management decision&ndash;making.
          </p>
          <p class="intro--legend">
            <img src="@/assets/fire-perimeter.png" />Active fires with mapped
            perimeters have a &lsquo;halo&rsquo; to show how big they are.
          </p>
          <p>
            Click one or more map layer names to activate. Scroll down to see
            details on each layer.
          </p>
        </div>
      </div>
    </section>

    <section class="section">
      <FireMap></FireMap>
    </section>

    <footer class="footer">
      <div class="container">
        <div class="columns">
          <div class="logos column is-one-fifth">
            <a href="https://uaf.edu/uaf/">
              <img src="@/assets/UAF.svg" alt="UAF Logo" />
            </a>
          </div>
          <div class="column content is-size-4">
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
              UA is an AA/EO employer and educational institution and prohibits
              illegal discrimination against any individual.
              <a href="https://www.alaska.edu/nondiscrimination/"
                >Statement of Nondiscrimination</a
              >
              and
              <a
                href="https://www.alaska.edu/records/records/compliance/gdpr/ua-privacy-statement/"
                >Privacy Statement</a
              >
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

.intro.content p {
  max-width: 40em;
  margin: 0 auto 2rem;
  &:last-child {
    margin-bottom: 0;
  }
  font-size: 120%;
}

.intro--legend img {
  vertical-align: middle;
  display: inline-block;
  margin-right: 1rem;
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
import FireMap from "@/components/FireMap.vue";

export default {
  name: "App",
  components: {
    FireMap,
  },
  computed: {
    year() {
      return new Date().getFullYear();
    },
  },
};
</script>
