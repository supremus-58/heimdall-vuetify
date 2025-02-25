<template>
  <div slot="no-body">
    <vue-apex-charts
      :id="chart_id"
      type="donut"
      :width="350"
      :options="chartOptions"
      :series="_series"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import VueApexCharts from "vue-apexcharts";
import { ApexOptions, exec } from "apexcharts";
import { install } from "vuetify/es5/install";
import { getModule } from "vuex-module-decorators";
import ColorHackModule from "@/store/color_hack";

// Represents a slice of the pie.
export interface Category<C extends string> {
  label: string;
  value: C;
  color: string;
}

// Type guard for Category
function isCategory(x: any): x is Category<string> {
  return (
    typeof x.label === "string" &&
    typeof x.value === "string" &&
    typeof x.color === "string"
  );
}

// We declare the props separately to make props types inferable.
const ApexPieChartProps = Vue.extend({
  props: {
    categories: Array, // Should be of type Category[]
    series: Array // Should be of type number[]
  }
});

let id_counter = 0;
function next_id(): number {
  id_counter += 1;
  return id_counter;
}

/**
 * Emits "category-selected" with payload of type Category whenever a category is selected.
 */
@Component({
  components: {
    VueApexCharts
  }
})
export default class ApexPieChart extends ApexPieChartProps {
  chart_id: string = `piechart_${next_id}`;

  /**
   * Provide a type-checked accessor to our categories propertyt
   */
  get _categories(): Category<string>[] {
    // Ensure it's an array
    if (!(this.categories instanceof Array)) {
      throw "categories must be an array of type Category";
    }

    // Ensure each are categories
    this.categories.forEach(element => {
      if (!isCategory(element)) {
        throw `Invalid category ${element}`;
      }
    });

    // Finally, return as known type
    return this.categories as Category<string>[];
  }

  /**
   * Provide a type-checked accessor to our series property
   */
  get _series(): number[] {
    // Ensure it's an array
    if (!(this.series instanceof Array)) {
      throw "series must be an array of numbers";
    }

    // Ensure all of its elements are numbers
    this.series.forEach(element => {
      if (typeof element !== "number") {
        throw `Invalid series item ${element}`;
      }
    });

    // We now know the type is definitely number[]
    let final = this.series as number[];

    // If we have any non-zero data, just returngive 0.01 of all
    return final;
  }

  // Generate the chart options based on _categories
  get chartOptions(): ApexOptions {
    // Apex charts does not support color names; must use color hack module
    let colors = getModule(ColorHackModule, this.$store);

    return {
      labels: this._categories.map(cat => cat.label),
      dataLabels: {
        formatter: (val, opts) => opts.w.config.series[opts.seriesIndex]
      },
      legend: {
        position: "bottom",
        onItemClick: {
          toggleDataSeries: false
        },
        labels: {
          useSeriesColors: true
        }
      },
      chart: {
        type: "donut",
        toolbar: {
          show: false
        },
        events: {
          dataPointSelection: (event, chartContext, config) => {
            this.$emit(
              "category-selected",
              this._categories[config.dataPointIndex]
            );
          },
          dataPointMouseEnter: (event, chartContext, config) => {
            document.body.style.cursor = "pointer";
          },
          dataPointMouseLeave: (event, chartContext, config) => {
            document.body.style.cursor = "default";
          }
        },
        dropShadow: {
          enabled: true,
          top: 0,
          left: 0,
          blur: 3,
          opacity: 0.35
        }
      },
      stroke: { width: 0 },
      colors: this._categories.map(cat => colors.lookupColor(cat.color))
    };
  }
}
</script>

<style scoped>
svg {
  fill: currentColor;
}
</style>
