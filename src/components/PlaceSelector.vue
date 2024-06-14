<template>
  <div class="place-selector--wrapper">
    <div class="content">
      <h4 class="title is-5">Find a community by name</h4>
      <div class="selector-container">
        <b-field class="selector-field">
          <b-autocomplete
            v-model="selectedPlace"
            :data="filteredDataObj"
            keep-first
            field="name"
            placeholder="e.g. Fairbanks"
            icon="magnify"
            clearable
            clear-on-select
            @select="(option) => (community = option)"
          >
            <template #empty>No results found</template>
            <template slot-scope="props">
              <div class="search-item">
                {{ props.option.name }}
              </div>
            </template>
          </b-autocomplete>
        </b-field>
        <div v-if="isPlaceSelected"><b-button type="is-light" @click="clearSelection" class="is-clear-location">
          Clear Location
        </b-button></div>
      </div>
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

.selector-container {
  display: flex;
  align-items: center;
}

.selector-field {
  flex: 1;
  margin-right: 1rem;
  margin-top: 1.35rem;
}

</style>
<script>
import { mapGetters } from "vuex";

export default {
  name: "PlaceSelector",
  data() {
    return {
      community: undefined, // the actual selected place
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

      return [];
    },
    isPlaceSelected() {
      return this.selected !== undefined
    },
    ...mapGetters({
      places: "places",
      selected: "selected",
    }),
  },
  watch: {
    community: function (community) {
      this.$store.commit("setSelected", community);
      this.fetchFireAPI(community);
    },
  },
  methods: {
    async fetchFireAPI(selected) {
      await this.$store.dispatch("fetchFireAPI", selected);
    },
    clearSelection() {
      this.$store.commit("clearSelected");
    },
  },
};
</script>
