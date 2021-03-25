<template>
  <div id="app">
    <div class="banner">
      University of Alaska Fairbanks • International Arctic Research Center
    </div>
    <div class="columns intro">
      <div class="column is-half splash-image">
        <img
          src="@/assets/nenana-fire.jpg"
          alt="Image of a wildfire near Nenana, Alaska"
        />
      </div>
      <div class="column is-half title-column">
        <h1 class="title is-1">Jackfruit Fire Study</h1>
        <p class="poem">
          This map shows<br />
          where current fires are and how big they are,<br />
          recent hotspot and lightning strikes,<br />
          historical extent of fires in Alaska,<br />
          and other layers<br />
          relevant<br />
          to wildfire research in Alaska.
        </p>
      </div>
    </div>

    <section class="section">
      <FireMap></FireMap>
    </section>

    <section class="section">
      <div class="container">
        <p class="is-size-5">
          Sicilian pistachio pesto lemongrass parsley vegan tomato and basil
          crumbled lentils veggie burgers bruschetta mediterranean chocolate
          cookie salad grains soy milk coconut onion lemon red lentil soup
          ginger lemongrass agave green tea lavender lemonade oranges second
          course cherry cherries.
        </p>
      </div>
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
              >.
            </p>

            <p>
              FIX THIS, add CASC credit, etc.
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

.columns.intro {
  margin-top: 0;

  .column {

    &.title-column {
      background-color: rgb(232, 122, 57);
      color: white;
      text-align: center;
      padding-top: 5rem;
      h1 {
        font-family: "Yellowtail";
        color: white !important;
        font-size: 4rem;
      }
    }
    &.splash-image {
      margin: 0;
      padding: 0;
      border-right: 0.2rem solid #fff;
      img {
        min-height: 50vh;
        height: 100%;
        min-width: 100%;
        width: 50vw;
      }
    }
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
