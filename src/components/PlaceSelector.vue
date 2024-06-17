<template>
  <div class="place-selector mb-6">
    <div class="content">
      <div>
        <b-field label="Go to a community">
          <b-autocomplete
            v-model="placeNameFragment"
            :data="filteredDataObj"
            keep-first
            field="name"
            placeholder="e.g. Fairbanks"
            clearable
            clear-on-select
            @select="
              (option) => {
                if (option) community = option;
              }
            "
          >
            <template #empty>No results found</template>
            <template slot-scope="props">
              <div class="search-item">
                {{ props.option.name }}
              </div>
            </template>
          </b-autocomplete>
        </b-field>
        <div v-if="isPlaceSelected">
          <b-button
            type="is-light"
            @click="clearSelection"
            class="is-clear-location"
          >
            Clear Location
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.place-selector {
  z-index: 10000;
  position: relative;
}
</style>

<script>
import { mapGetters } from "vuex";

export default {
  name: "PlaceSelector",
  data() {
    return {
      community: undefined, // the actual selected place
      placeNameFragment: "", // the temporary search fragment
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
              .indexOf(this.placeNameFragment.toLowerCase()) >= 0 ||
            (option.alt_name &&
              option.alt_name
                .toString()
                .toLowerCase()
                .indexOf(this.placeNameFragment.toLowerCase()) >= 0)
          );
        });
      }

      return [];
    },
    isPlaceSelected() {
      return this.selected !== undefined;
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
