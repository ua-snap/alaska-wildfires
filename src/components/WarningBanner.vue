<template>
  <div class="warning-banner">
    <b-message
      title="AICC Fire and Lightning Data Currently Unavailable"
      type="is-warning"
      class="warning-banner-box"
      aria-close-label="Close message"
      ><p>
        Thanks for checking out this tool! Right now, the data feeds for the
        Alaska Interagency Coordination Center's daily fire and lightning data
        are not being updated. As soon as new data is available to be displayed,
        this application will be updated with the current fire year's data.
      </p>
    </b-message>
  </div>
</template>
<style lang="scss" scoped>
::v-deep .message-header p:not(:last-child) {
  margin-bottom: 0;
}
.warning-banner-box .media-content p {
  color: #333;

  a {
    font-weight: 600;
  }
}
</style>
<script>
export default {
  name: "WarningBanner",
};
</script>
