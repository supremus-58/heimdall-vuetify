<!--    This is the "base view" that we just modify with slots.
        Saves us the trouble of messing around with sidebar functionality
        in every view. "Subclass" by utilizing the slots. -->
<template>
  <div>
    <!-- Top appbar. The center content of it is configured via the topbar-content slot -->
    <Topbar @toggle-drawer="drawer = !drawer">
      <slot name="topbar-content"></slot>
    </Topbar>

    <!-- Sidebar to navigate between different views -->
    <Sidebar v-model="drawer" />

    <!-- The actual content. Slotted by our "descendants" -->
    <v-content>
      <slot name="main-content"></slot>
    </v-content>

    <slot>
      <!-- The default slot -->
    </slot>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Sidebar from "@/components/global/Sidebar.vue";
import Topbar from "@/components/global/Topbar.vue";

// We declare the props separately
// to make props types inferable.
const BaseProps = Vue.extend({
  props: {}
});

@Component({
  components: {
    Sidebar,
    Topbar
  }
})
export default class Base extends BaseProps {
  /** Models if the drawer is open */
  drawer: boolean = false;
}
</script>
