<template>
  <div class="layer-menu">
    <layer-list></layer-list>
  </div>
</template>

<script>
import LayerList from "./LayerList";

export default {
  name: "LayerMenu",
  props: ["map"],
  components: {
    "layer-list": LayerList
  }
};
</script>

<style lang="scss" scoped></style>
