<template>
  <!-- Need to catch for ResponsiveRowSwitch @toggle events for small view -->
  <ResponsiveRowSwitch>
    <template #status>
      <v-card
        class="ma-1"
        :color="status_color"
        hover
        @click="$emit('toggle', !expanded)"
      >
        <v-card-text class="pa-2">
          {{ control.status }}
          <v-icon class="float-right">{{
            expanded ? "expand_more" : "expand_less"
          }}</v-icon>
        </v-card-text>
      </v-card>
    </template>

    <template #severity>
      <v-card-text class="pa-2">
        <v-icon v-for="i in severity_arrow_count" :key="i" class="stack-icon">
          chevron_right
        </v-icon>
        {{ control.severity }}
      </v-card-text>
    </template>

    <template #title>
      <v-card-text class="pa-2">{{ truncated_title }}</v-card-text>
    </template>

    <!-- ID and Tags -->
    <template #id>
      <v-card-text class="pa-2">{{ control.wraps.id }}</v-card-text>
    </template>
    <template #tags>
      <v-chip-group column active-class="NONE">
        <v-chip
          v-for="tag in control.fixed_nist_tags"
          :key="tag"
          active-class="NONE"
        >
          {{ tag }}
        </v-chip>
      </v-chip-group>
    </template>
  </ResponsiveRowSwitch>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { HDFControl, ControlStatus, Severity } from "inspecjs";
import ResponsiveRowSwitch from "@/components/cards/controltable/ResponsiveRowSwitch.vue";

// We declare the props separately to make props types inferable.
const ControlRowHeaderProps = Vue.extend({
  props: {
    control: {
      type: Object, // Of type HDFControl (but with added key field)
      required: true
    },
    expanded: {
      type: Boolean, // Whether or this control should be open
      required: false
    }
  }
});

@Component({
  components: {
    ResponsiveRowSwitch
  }
})
export default class ControlRowHeader extends ControlRowHeaderProps {
  get truncated_title(): string {
    if (this.control.wraps.title.length > 80) {
      return this.control.wraps.title.substr(0, 80) + "...";
    } else {
      return this.control.wraps.title;
    }
  }

  get status_color(): string {
    // maps stuff like "not applicable" -> "statusnotapplicable", which is a defined color name
    return `status${this.control.status.replace(" ", "")}`;
  }

  get severity_arrow_count(): number {
    switch (this.control.severity) {
      default:
      case "none":
        return 0;
      case "low":
        return 1;
      case "medium":
        return 2;
      case "high":
        return 3;
      case "critical":
        return 4;
    }
  }

  fmtNist(nist: string[]): string {
    return nist.join(", ");
  }
}
</script>

<style scoped>
.center {
  text-align: justify;
}

.stack-icon {
  margin-left: -8px;
  margin-right: -8px;
  margin-top: -8px;
  margin-bottom: -8px;
}
</style>
