<script>

import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Loader from "@/components/widgets/loader";
//import { getFirebaseBackend } from "@/firebaseUtils";
import appConfig from "@/app.config";
import "firebase/firestore";

import {
  required, 
} from "vuelidate/lib/validators";


/**
 * Advanced table component
 */
export default {
  page: {
    title: "Créer un chantier",
    meta: [
      {
        name: "Fiche de création d'un chantier",
        content: appConfig.description,
      },
    ],
  },
  components: { Layout, PageHeader, Loader},

  data() {
    return {
      content: 'Formulaire de création d\'un chantier',
      title: 'Creer un chantier',
      filter: null,
      items: [
        {
          text: "Liste des chantiers",
          href: "/case",
        },
        {
          text: "Nouveau",
          active: true,
        }
      ],
      loaded : true,
      caseDoc : this.createNewCase(),
      validation : this.validationScheeme(),
      submitform : false,
      validations: {
        tooltipform: {
          fname: { required },
          lname: { required },
          username: { required },
          city: { required },
          state: { required },
        }
      }
    }
  },
  methods: {
    createNewCase(){
      var record = Object({
            work_order : "",
            imputation_code : "",
            progress : 0,
            type : "",
            comments : "",
            status : "qualify",
            owners: {
                business : "",
                execution : "",
                field : "",
                business_unit: ""
            },

            contract : {
                signing_date : "",
                client : "",
                name : "",
                revenu: ""
            },
            schedule : {
                start_date_ts :  0,
                start_date :  "",
                end_date_ts :  0,
                end_date :  "",
            },
            budget : {
                workloads : [
                    { 
                        type : 1,
                        workload : "", // TO fix
                        rate : 100
                    },
                    { 
                        type : 2,
                        workload : "",
                        rate : ""
                    },
                ],
                workforce : "",
                material: "",
                subcontracting :  "",
                total :  "",
            },
            conso : {
                workloads : [
                    { 
                        type : 1,
                        workload : "", // TO fix
                        rate : "",
                    },
                    { 
                        type : 2,
                        workload : "",
                        rate : "",
                    },                
                ],
                workforce : "",
                material : "",
                subcontracting :  "",
                total :  "",
            },
            prev : {
                workloads : [
                    { 
                        type : 1,
                        workload : "",
                        rate : 100
                    },
                    { 
                        type : 2,
                        workload : "",
                        rate : "",
                    },                
                ],
                workforce : "",
                material : "",
                subcontracting :  "",
                total :  "",
                revenu : "",
                marging : "",
                risk_amount : "",
                risk_description : "",
            },
            provision : {
                    amount : 0,
                    description : "",
            },
            ytd : {
                workforce : "",
                material : "",
                subcontracting :"",
                total : "",
                stock : "",
                marging:"",
            },
            situation : {
                activity : "",
                billed_amount : "",
                fae :"",
                received_amount : "",
                last_years_revenu : "",
                producted_current_year_revenu : "",
                remaining_current_year_revenu : "",
                projection_next_years_revenu  : "",
                PAR : ""
            }
        });
        return record;
    },
    validationScheeme(){
      var validation = Object({
            imputation_code : { required },
            type : { required },
            owners: {
                business : { required }
            },
            contract : {
                signing_date : { required },
                client : { required },
                name : { required },
                revenu: { required },
            } 
        });
        return validation;
    },
    tooltipForm() {
      this.submitform = true;
      this.$v.$touch();
    },
  }
}
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />   
    <Loader :loading="loaded">
      <div class="card">
        <div class="card-body">
          <h4 class="card-title">Créer un chantier</h4>
          <!--<p class="card-title-desc">----</p> -->
          <form class="needs-validation" @submit.prevent="tooltipForm">
              <div class="row">
                <div class="col-md-4">
                  <div class="mb-3 position-relative">
                    <label for="validationTooltip01">First name</label>
                    <input
                      id="validationTooltip01"
                      v-model="caseDoc.imputation_code"
                      type="text"
                      class="form-control"
                      placeholder="First name"
                      value="Mark"
                      :class="{
                        'is-invalid': submitform && $v.tooltipform.fname.$error,
                      }"
                    />
                    <div
                      v-if="submitform && $v.tooltipform.fname.$error"
                      class="invalid-tooltip"
                    >
                      <span v-if="!$v.tooltipform.fname.required"
                        >Please provide valid First name.</span
                      >
                    </div>
                  </div>
                </div>
              </div>
              <button class="btn btn-primary" type="submit">Submit form</button>
          </form>
        </div>     
      </div>
    </Loader>
  </Layout>
</template>


<style scoped>
</style>
