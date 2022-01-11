<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import form_entry from "./module/form-entry.vue";
import { getFirebaseBackend } from "@/firebaseUtils";
import "firebase/firestore";

import {
  required,
} from "vuelidate/lib/validators";

/**
 * Form validation component
 */
export default {
  page: {
    title: "Form Validation",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: { Layout, PageHeader, form_entry },
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
      caseDoc: this.createNewCase(),
      submitform: false,
      status_datalist : {
        qualify : "Qualify",
        planify : "Planify",
        prepare : "Prepare",
        execute : "Execute",
        wip     : "En cours",
        closing : "Closing",
        closed  : "Closed",
      },
      type_datalist : {
        TC : "TC",
        PE : "PE",
        CCO : "CCO",
        TLE : "TLE",
      },
      bu_datalist : {
        OCPL : "Centre Pays de Loire",
        OAURA : "Auvergne-Rhône-Alpes"
      },
    };   
  },
  validations: {   
    caseDoc: {
      imputation_code : { required },
      type : { required },
      owners: {
          business : { required },
          execution : { required },
          field : { required },
          business_unit : { required },
      },
      contract : {
          signing_date : { required },
          client : { required },
          name : { required },
          revenu: { required },
      } 
    }
  },
  computed : {
    work_duration : function(){
      if (this.caseDoc.schedule.end_date == "" || this.caseDoc.schedule.start_date == "" ) return '-';
      var days = (this.caseDoc.schedule.end_date_ts - this.caseDoc.schedule.start_date_ts) / 86400000;
      return (days == 1) ? "1 jour" : ((days < 30) ? days + " jours" : parseInt(days/7) + "semaines");
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
    update_dates(){
      this.caseDoc.schedule.end_date_ts = (new Date(this.caseDoc.schedule.end_date)).getTime();
      this.caseDoc.schedule.start_date_ts = (new Date(this.caseDoc.schedule.start_date)).getTime();
    },
    update_currency(){

       this.caseDoc.contract.revenu = this.caseDoc.contract.revenu.replace('€','').replaceAll(/\s/g,'').replace(",",".");
    },
    create_new_case(){
      var db = getFirebaseBackend().getFirestore();
      db.collection("case").doc(this.caseDoc.owners.business_unit).collection("current").add(this.caseDoc).then((docRef) => {
       this.$router.push({ name: 'case-detail', params: { bu:this.caseDoc.owners.business_unit, caseId: docRef.id } })
      })
      .catch((error) => {
          console.error("Error writing document: ", error);
      });
    },
    submitForm() {
      this.submitform = true;
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.create_new_case();
      }

    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <h1>{{caseDoc.fname}}</h1>
    <form class="needs-validation" @submit.prevent="submitForm">
      <div class="row">
        <div class="col-lg-12">
          <div class="card">
            <div class="card-body">
              <h4 class="card-title font-size-16">Description du chantier</h4>
              <!--<p class="card-title-desc">----</p> -->
                <div class="row">
                  <form_entry type='datalist' label="Type"                v-model="caseDoc.type                  " size="2"  :check="$v.caseDoc.type                 " tooltip="Champs obligatoire" :submitform="submitform" :list="type_datalist"/>
                  <form_entry type='text'     label="Numéro d'imputation" v-model="caseDoc.imputation_code       " size="3"  :check="$v.caseDoc.imputation_code      " tooltip="Champs obligatoire" :submitform="submitform"/>
                  <form_entry type='date'     label="Date de signature"   v-model="caseDoc.contract.signing_date " size="3"  :check="$v.caseDoc.contract.signing_date" tooltip="Champs obligatoire" :submitform="submitform"/>
                  
                  <form_entry type='currency' label="Chiffre d'affaires"  v-model="caseDoc.contract.revenu       " size="4"  :check="$v.caseDoc.contract.revenu       " tooltip="Champs obligatoire" :submitform="submitform" @updated="update_currency()"/>
                  <form_entry type='text'     label="Nom du chantier"     v-model="caseDoc.contract.name         " size="12"  :check="$v.caseDoc.contract.name        " tooltip="Champs obligatoire" :submitform="submitform"/>
                  <form_entry type='text'     label="Client"              v-model="caseDoc.contract.client       " size="12"  :check="$v.caseDoc.contract.client      " tooltip="Champs obligatoire" :submitform="submitform"/>
                  </div>
            </div>
            <div class="card-body">
              <h1 class="card-title font-size-16">Responsables</h1>
              <!--<p class="card-title-desc">----</p> -->
                <div class="row">
                  <form_entry type='datalist' label="Direction Régionale" v-model=caseDoc.owners.business_unit size="3"  :check="$v.caseDoc.owners.business_unit " tooltip="Champs obligatoire" :submitform="submitform" :list="bu_datalist"/>
                  <form_entry type='text'     label="Resp. d'affaire"     v-model=caseDoc.owners.business      size="3"  :check="$v.caseDoc.owners.business      " tooltip="Champs obligatoire" :submitform="submitform"/>
                  <form_entry type='text'     label="Resp. d'exécution"   v-model=caseDoc.owners.execution     size="3"  :check="$v.caseDoc.owners.execution     " tooltip="Champs obligatoire" :submitform="submitform"/>
                  <form_entry type='text'     label="Resp. Opérationnel"  v-model=caseDoc.owners.field         size="3"  :check="$v.caseDoc.owners.field         " tooltip="Champs obligatoire" :submitform="submitform"/>
                  </div>
            </div>
            <div class="card-body">
              <h1 class="card-title">Planning</h1>
              <!--<p class="card-title-desc">----</p> -->
                <div class="row">
                  <form_entry type='date'     label="Date de début" v-model=caseDoc.schedule.start_date  size="3" @updated="update_dates()"/>
                  <form_entry type='date'     label="Date de fin  " v-model=caseDoc.schedule.end_date    size="3" @updated="update_dates()"/>
                  <form_entry type='label'    label="Durée"         v-model=work_duration                size="2" />
                  </div>
            </div>
            <!--<div class="card-body">
              <h1 class="card-title">Budget d'exécution</h1>
              <p class="card-title-desc">----</p>
                <div class="row">
                  <form_entry type='number'     label="Budget Main d'Oeuvre(€)" v-model=caseDoc.budget.workforce    size="4"  />
                  <form_entry type='number'     label="Budget Matériel(€)"      v-model=caseDoc.budget.material      size="4"  />
                  <form_entry type='number'     label="Budget ST(€)"            v-model=caseDoc.budget.subcontracting        size="4"  />
                  <form_entry type='label'     label="Total(€)"                 :v-model="(caseDoc.budget.workforce+caseDoc.budget.material+caseDoc.budget.subcontracting)"  size="12"  />
                </div>
            </div> -->
          </div>
          <!-- end card -->
        </div>
        <!-- end col -->
      </div>
      <!-- end row -->
      <p align="right">
        <button type="submit" class="pill btn btn-success btn-rounded mb-2 me-2 ">Créer le chantier</button>
      </p>
    </form>
  </Layout>
</template>

<style>
.pill {
  border-radius: 30px;
  color: #fff;
  background-color: #34c38f;
  border-color: #34c38f;
}
</style>