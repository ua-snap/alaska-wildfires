<template>
  <div id="app">
    <section class="section">
      <div class="container">
        <h1 class="title is-1">Alaska Wildfires: Past, Present &amp; Future</h1>
        <p>
          This map shows<br />
          where current fires are and how big they are,<br />
          recent hotspot and lightning strikes,<br />
          historical extent of fires in Alaska,<br />
          and other layers relevant to fire in Alaska.
        </p>
      </div>
    </section>

    <FireMap></FireMap>

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

<style type="scss">
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
