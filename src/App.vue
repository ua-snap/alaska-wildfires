<template>
  <div id="app">
    <div class="banner">
      University of Alaska Fairbanks • International Arctic Research Center
    </div>
    <header>
      <img src="@/assets/ak_shadowed.png" alt="" />
      <h1>Alaska Wildfire Analysis</h1>
      <h2>
        See active wildfire locations and sizes in relation to fire history, recent lightning strikes, land cover
        types, and more
      </h2>
    </header>

    <section class="section">
      <FireMap></FireMap>
    </section>

    <footer class="footer">
      <div class="container">
        <div class="columns">
          <div class="logo column is-one-fifth">
            <img src="@/assets/UAF.svg" alt="UAF Logo" />
          </div>
          <div class="column is-four-fifths">
            <p>
              This tool was developed by the
              <a href="https://www.snap.uaf.edu/" title="👍"
                >Scenarios Network for Alaska and Arctic Planning</a
              > in collaboration with the <a href="https://akcasc.org">Alaskan
                Climate Adaptation Science Center</a>. SNAP is a research group
                in the <a href="https://uaf-iarc.org/">International Arctic Research Center</a>
                at the <a href="https://uaf.edu/uaf/">University of Alaska Fairbanks</a>.
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
    margin-top: -2rem;
    padding: 0 0 1rem 0;
    font-family: "Yellowtail";
    color: white !important;
    font-size: 6.75rem;
    text-shadow: 3px 3px 3px #000;
  }
  h2 {
    border-top: 0.25rem solid white;
    background-color: rgb(39, 41, 26);
    padding: .75rem;
    color: white;
    font-weight: 300;
    font-size: 1.75rem;
  }
}

.footer {
  box-shadow: inset 0 7px 9px -7px rgba(0, 0, 0, 0.4);

  .logo {
    text-align: center;
    img {
      position: relative;
      top: 0.25rem;
      width: 75%;
      max-width: 40vw;
    }
  }

  p {
    margin: 1rem;
  }
}
</style>

<script>
import FireMap from "@/components/FireMap.vue";

export default {
  name: "App",
  components: {
    FireMap
  },
  computed: {
    year() {
      return new Date().getFullYear();
    }
  }
};
</script>
