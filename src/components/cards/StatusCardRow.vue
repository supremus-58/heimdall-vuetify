<template>
  <v-row>
    <v-col
      cols="12"
      sm="6"
      md="6"
      lg="3"
      xl="3"
      v-for="card in cardProps"
      :key="card.title"
    >
      <v-card height="100%" :color="card.color">
        <v-card-title>
          <v-icon large left>mdi-{{ card.icon }}</v-icon>
          <span class="title">{{ card.title + ": " + card.number }}</span>
        </v-card-title>
        <v-card-text v-text="card.subtitle" />
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getModule } from "vuex-module-decorators";
import StatusCountModule from "@/store/status_counts";

interface CardProps {
  icon: string;
  title: string;
  number: number;
  subtitle: string;
  color: string;
}

// We declare the props separately to make props types inferable.
const StatusCardRowProps = Vue.extend({
  props: {
    filter: Object // Of type Filter
  }
});

@Component({
  components: {}
})
export default class StatusCardRow extends StatusCardRowProps {
  // Cards
  get cardProps(): CardProps[] {
    let counts = getModule(StatusCountModule, this.$store);
    let filter = this.filter;
    return [
      {
        icon: "check-circle",
        title: "Passed",
        subtitle: "All tests passed.",
        color: "statusPassed", // These shouldn't be hard coded
        number: counts.passed(filter)
      },
      {
        icon: "close-circle",
        title: "Failed",
        subtitle: "Has tests that failed.",
        color: "statusFailed",
        number: counts.failed(filter)
      },
      {
        icon: "minus-circle",
        title: "Not Applicable",
        subtitle: "System exception/absent component.",
        color: "statusNotApplicable",
        number: counts.notApplicable(filter)
      },
      {
        icon: "alert-circle",
        title: "Not Reviewed",
        subtitle: "Manual testing required/disabled test.",
        color: "statusNotReviewed",
        number: counts.notReviewed(filter)
      }
    ];
  }
}
</script>
