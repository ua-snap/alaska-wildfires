<template>
  <div class="mb-6">
    <div class="content">
      <div>
        <b-field label="Go to a community">
          <b-autocomplete
            v-model="selectedPlace"
            :data="filteredDataObj"
            keep-first
            field="name"
            placeholder="e.g. Fairbanks"
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
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped></style>
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
  },
};
</script>
