<template>
  <div></div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getModule } from "vuex-module-decorators";
import { ControlStatus, HDFControl } from "inspecjs";
import { scaleLinear, scaleOrdinal } from "d3-scale";
import { json } from "d3-request";
import { hierarchy, treemap } from "d3-hierarchy";
import FilteredDataModule from "@/store/data_filters";

// We declare the props separately to make props types inferable.
const TreemapProps = Vue.extend({
  props: {
    filter: {
      type: Object, // Of type Filter
      required: true
    }
  }
});

/**
 * Categories property must be of type Category
 * Emits "filter-status" with payload of type ControlStatus
 */
@Component({
  components: {}
})
export default class Treemap extends TreemapProps {
  // These fields relate to the currently selected options
  /** The currently selected NIST family, if any */
  selectedFamily: string | null = null;
  /** The currently selected NIST category, if any. */
  selectedSubFamily: string | null = null;
  /**  The currently selected NIST control, if any. Value should be a unique ID, not the control ID */
  selectedControlID: number | null = null;

  nistControls(): HDFControl[] {
    // Get our data module
    let data: FilteredDataModule = getModule(FilteredDataModule, this.$store);

    // Get the current filtered data
    return data.controls(filter);
  }

  // Callbacks for our tree
  setSelectedFamily(val: string): void {
    this.selectedFamily = val;
  }

  setSelectedSubFamily(val: string): void {
    this.selectedSubFamily = val;
  }

  setSelectedControl(val: number): void {
    this.selectedControlID = val;
  }
}
</script>
