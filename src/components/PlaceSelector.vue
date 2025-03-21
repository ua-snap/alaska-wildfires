<template>
  <div class="place-selector mb-6">
    <div class="content">
      <div>
        <b-field
          label="Type a community name below to show current conditions at that place:"
        >
          <b-autocomplete
            v-model="placeNameFragment"
            :data="filteredDataObj"
            keep-first
            field="name"
            placeholder="e.g. Fairbanks"
            clearable
            @select="(option) => (community = option)"
          >
            <template #empty>No results found</template>
            <template slot-scope="props">
              <div class="search-item">
                {{ props.option.name }}
                <span v-if="props.option.country == 'CA'" class="canada">
                  ({{ props.option.region }}, Canada)</span
                >
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
::v-deep .field {
  label.label {
    font-size: 1.25rem;
    color: hsl(0deg, 0%, 29%);
    font-weight: 600;
  }
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
      if (community) {
        window.umami.track("community-selected", {
          id: community.id,
          name: community.name,
          region: community.region,
        });
        if (community.id !== this.$route.params.communityId) {
          let routeParams = { path: '/' + community.id }
          routeParams.query = { layers: this.$route.query.layers }
          this.$router.push(routeParams);
        }
      }
    },
    // Triggered if user started on front page and selected a community
    "$route.params.communityId": function (communityId) {
      this.handleCommunity(communityId);
    },
    // Triggered if user arrived to webapp with communityId permalink
    "places.data": function () {
      let communityId = this.$route.params.communityId;
      this.handleCommunity(communityId);
    },
  },
  methods: {
    handleCommunity(communityId) {
      if (communityId) {
        const community = this.places.data.find(
          (place) => place.id == communityId
        );
        if (community) {
          this.placeNameFragment = community.name;
          this.$store.commit("setSelected", community);
          this.fetchFireAPI({
            community,
            router: this.$router
          });
        }
      }
    },
    async fetchFireAPI(selected) {
      await this.$store.dispatch("fetchFireAPI", selected);
    },
    clearSelection() {
      this.$store.commit("clearSelected");
      this.placeNameFragment = '';

      let routeParams = { path: '/' }
      routeParams.query = { layers: this.$route.query.layers }
      this.$router.push(routeParams);
    },
  },
};
</script>
