<template>
  <v-list-item :to="link">
    <v-list-item-action>
      <v-icon>{{ icon }}</v-icon>
    </v-list-item-action>
    <v-list-item-content>
      <v-list-item-title>{{ text }}</v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

// We declare the props separately to make props types inferable.
const LinkItemProps = Vue.extend({
  props: {
    text: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: false
    },
    link: {
      type: String,
      required: false,
      default: "/"
    }
  }
});

@Component({
  components: {}
})
export default class LinkItem extends LinkItemProps {}
</script>
