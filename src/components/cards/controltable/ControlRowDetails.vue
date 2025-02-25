<template>
  <v-row no-gutters>
    <v-col cols="12">
      <v-card>
        <v-tabs>
          <v-tabs-slider></v-tabs-slider>
          <!-- Declare our tabs -->
          <v-tab href="#tab-test">
            Test
          </v-tab>
          <v-tab href="#tab-details">
            Details
          </v-tab>
          <v-tab href="#tab-code">
            Code
          </v-tab>

          <v-tab-item value="tab-test">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <span>{{ control.finding_details.split(":")[0] }}:</span>
                  <br />
                  <br />
                  <span>{{ control.wraps.desc }}</span>
                </v-col>
              </v-row>
              <v-row
                v-for="(result, index) in control.wraps.results"
                :key="index"
              >
                <v-col cols="1" class="stripes">{{
                  result.status.toUpperCase()
                }}</v-col>
                <v-col cols="5" class="stripes right">
                  <prism language="makefile" class="fill-height"
                    >Test: {{ result.code_desc }}</prism
                  >
                </v-col>
                <v-col v-if="result.message" cols="6" class="stripes right">
                  <prism language="makefile" class="fill-height"
                    >Result: {{ result.message }}
                  </prism>
                </v-col>
              </v-row>
            </v-container>
          </v-tab-item>

          <v-tab-item value="tab-details">
            <v-container>
              <!-- Create a row for each detail -->
              <template v-for="(detail, index) in details">
                <v-row :key="index">
                  <v-col cols="1"> {{ detail.name }}: </v-col>
                  <v-col cols="11" :class="detail.class">
                    {{ detail.value }}
                  </v-col>
                  <v-divider> </v-divider>
                </v-row>
              </template>
            </v-container>
          </v-tab-item>

          <v-tab-item value="tab-code">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <prism language="ruby">{{ control.wraps.code }}</prism>
                </v-col>
              </v-row>
            </v-container>
          </v-tab-item>
        </v-tabs>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { HDFControl, ControlStatus } from "inspecjs";

//TODO: add line numbers
import "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-scss.min";
import "prismjs/components/prism-makefile.js";
import "prismjs/components/prism-ruby.js";
//@ts-ignore
import Prism from "vue-prism-component";
Vue.component("prism", Prism);

import "prismjs/components/prism-ruby.js";

interface Detail {
  name: string;
  value: string;
  class?: string;
}

// We declare the props separately to make props types inferable.
const ControlRowDetailsProps = Vue.extend({
  props: {
    control: {
      type: Object, // Of type HDFControl
      required: true
    }
  }
});

@Component({
  components: { Prism }
})
export default class ControlRowDetails extends ControlRowDetailsProps {
  get details(): Detail[] {
    return [
      {
        name: "Control",
        value: this.control.wraps.id
      },
      {
        name: "Title",
        value: this.control.wraps.title
      },
      {
        name: "Desc",
        value: this.control.wraps.desc
      },
      {
        name: "Severity",
        value: this.control.severity
      },
      {
        name: "Impact",
        value: this.control.wraps.impact
      },
      {
        name: "Nist",
        value: this.control.nist_tags.join(", ")
      },
      {
        name: "Check Text",
        value: this.control.wraps.tags.check
      },
      {
        name: "Fix Text",
        value: this.control.wraps.tags.fix
      }
    ];
  }
}
</script>

<style scoped>
.v-application code {
  background-color: revert;
  color: revert;
  display: revert;
  font-size: revert;
  -webkit-box-shadow: revert;
  box-shadow: revert;
  border-radius: revert;
  white-space: auto;
  overflow-wrap: break-word;
  max-width: 100%;
}
.code-card {
  height: inherit;
  margin: inherit;
  white-space: auto;
}
.wset {
  min-width: 125px;
  justify-content: center;
}
code[class*="language-"] {
  word-break: break-word;
}
div[class*="stripes"] {
  border-style: solid;
  border-width: 1px;
}
.right {
  margin-left: -1px;
}
</style>
