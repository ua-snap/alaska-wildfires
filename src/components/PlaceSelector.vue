<template>
  <div class="place-selector--wrapper">
    <div class="content">
      <h4 class="title is-5">Find a community by name</h4>
      <div>
        <b-field>
          <b-autocomplete
            v-model="selectedPlace"
            :data="filteredDataObj"
            keep-first
            field="name"
            placeholder="e.g. Fairbanks"
            icon="magnify"
            clearable
            clear-on-select
            @select="(option) => (selected = option)"
          >
            <template #empty>No results found</template>
            <template slot-scope="props">
              <div class="search-item">
                {{ props.option.name }}
              </div>
            </template>
          </b-autocomplete>
        </b-field>
      </div>
    </div>
    <div v-if="selected" class="name-types">
      <h5 class="title is-5">
        Viewing data for <b>{{ selected.name }}</b>
        <span v-if="selected.alt_name"> ({{ selected.alt_name }}) </span>,
        <b>{{ selected.region }}</b>
      </h5>
      <FireAPIOutput />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.name-types {
  h5 span {
    display: inline-block;
    font-size: 85%;
    @media (max-width: 768px) {
      padding-bottom: 0.2rem;
    }
    @media (min-width: 769px) {
      padding-left: 0.2rem;
    }
  }
  .name-types-list {
    position: relative;
    z-index: -5000; // needed to prevent this div from being on top of autocomplete
    &.columns {
      .column {
        padding-top: 0;
        margin-top: -0.5rem;
        ul {
          list-style-type: none;
          padding-left: 0;
          margin-left: 0;
          li {
            line-height: 1.2;
            margin-bottom: 0.5rem;
          }
        }
      }
    }
  }
}

.place-selector--wrapper * {
  z-index: 10000;
  padding-bottom: 0.3rem;
}

.search-item {
  font-weight: 600;
  white-space: normal;
  .area-additional-info {
    text-transform: uppercase;
    display: inline-block;
    padding-left: 1ex;
    color: #888;
    font-size: 90%;
  }
}
</style>
<script>
import { mapGetters } from "vuex";
import FireAPIOutput from "./FireAPIOutput";

export default {
  name: "PlaceSelector",
  components: { FireAPIOutput },
  data() {
    return {
      selected: undefined, // the actual selected place
      selectedPlace: "", // the temporary search fragment
    };
  },
  computed: {
    filteredDataObj() {
      // Guard in case the async loading of places isn't done yet.
      if (this.places) {
        return this.places.data.filter((option) => {
          return (
            option.name
              .toString()
              .toLowerCase()
              .indexOf(this.selectedPlace.toLowerCase()) >= 0 ||
            (option.alt_name &&
              option.alt_name
                .toString()
                .toLowerCase()
                .indexOf(this.selectedPlace.toLowerCase()) >= 0)
          );
        });
      }

      return []; // Add this line to return an empty array if the async loading of places isn't done yet.
    },
    ...mapGetters({
      places: "places",
    }),
  },
  watch: {
    selected: function (selected) {
      this.$store.commit("setSelected", selected);
      this.fetchFireAPI(selected);
    },
  },
  methods: {
    async fetchFireAPI(selected) {
      await this.$store.dispatch("fetchFireAPI", selected);
    },
  },
};
</script>
