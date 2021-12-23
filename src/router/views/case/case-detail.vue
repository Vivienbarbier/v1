<script>
// import axios from "axios";

import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { getFirebaseBackend } from "@/firebaseUtils";
import dataBox from '@/helpers/data-box';
import appConfig from "@/app.config";
import "firebase/firestore";
import Loader from "@/components/widgets/loader";

import CKEditor from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

/**
 * Advanced table component
 */
export default {
  page: {
    title: "Détail du chantier",
    meta: [
      {
        name: "Fiche de détail du chantier",
        content: appConfig.description,
      },
    ],
  },
  components: { Layout, PageHeader, dataBox, Loader, ckeditor: CKEditor.component},
  data() {
    return {
      content: 'hello world2',
      title: 'Détail du chantier',
      filter: null,
      items: [
        {
          text: "Liste des chantiers",
          href: "/case",
        },
        {
          text: "Détail",
          active: true,
        }
      ],     
      caseDoc : null,
      editor: ClassicEditor,
      status_datalist : {
        qualify : "Qualify",
        planify : "Planify",
        prepare : "Prepare",
        execute : "Execute",
        wip     : "En cours",
        closing : "Closing",
        closed  : "Closed",
      }
     }
  },
  mounted(){
    this.load_case_data();
  },
  methods: {
    load_case_data(){
      var db = getFirebaseBackend().getFirestore();
      db.collection("case").doc(this.$route.params.bu).collection("2021").doc(this.$route.params.caseId)
      .get().then((document) => {          
        this.caseDoc = document.data();
      });
    },
    update_case_data(){
      var db = getFirebaseBackend().getFirestore();
      db.collection("case").doc(this.$route.params.bu).collection("2021").doc(this.$route.params.caseId).update(this.caseDoc);
    },
    update_case_comments(){
      var db = getFirebaseBackend().getFirestore();
      db.collection("case").doc(this.$route.params.bu).collection("2021").doc(this.$route.params.caseId).update({comments : this.caseDoc.comments});
    },
  }
}
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />   
    <Loader :loading="caseDoc !== null">
      <template v-if="caseDoc !== null && caseDoc.contract !== null">
      <div class="card">
          <div class="card-body">
            <h4 class="card-title mb-4 font-size-18">Description du chantier</h4>
            <div class="row">           
              <dataBox  label="Nom du chantier"     type="String"     v-model=caseDoc.contract.name         @updated="update_case_data()"  />
              <dataBox  label="client"              type="String"     v-model=caseDoc.contract.client       @updated="update_case_data()"  />
              <dataBox  label="Revenu"              type="Currency"   v-model=caseDoc.contract.revenu       @updated="update_case_data()"  />
              <dataBox  label="Type"                type="String"     v-model=caseDoc.type                  @updated="update_case_data()"  />
              <dataBox  label="Numéro de chantier"  type="String"     v-model=caseDoc.work_order            @updated="update_case_data()"  /> 
              <dataBox  label="Numéro d'imputation" type="String"     v-model=caseDoc.imputation_code       @updated="update_case_data()"  />
              <dataBox  label="Date de signature"   type="Date"       v-model=caseDoc.contract.signing_date @updated="update_case_data()"  />
              <dataBox  label="Status"              type="Datalist"   v-model=caseDoc.status                @updated="update_case_data()"  :datalist="status_datalist"/>

            </div>
          </div>
          <div class="card-body">
            <h4 class="card-title mb-4 font-size-18">Responsables</h4>
            <div class="row">          
              <dataBox  label="Direction Régionale" type="String"   v-model=caseDoc.owners.business_unit    @updated="update_case_data()" /> 
              <dataBox  label="Resp. d'affaire"     type="String"   v-model=caseDoc.owners.business_owner   @updated="update_case_data()" />
              <dataBox  label="Resp. d'exécution"   type="String"   v-model=caseDoc.owners.execution_owner  @updated="update_case_data()" />
              <dataBox  label="Resp. Opérationnel"  type="String"   v-model=caseDoc.owners.field_owner      @updated="update_case_data()" />
            </div>
          </div>
          <div class="card-body">
            <h4 class="card-title mb-4 font-size-18">Planning</h4>
            <div class="row">        
              <dataBox  label="Preparation"     type="String"   v-model=caseDoc.preparation_status  @updated="update_case_data()" />
              <dataBox  label="Date de début"   type="Date"     v-model=caseDoc.schedule.start_date @updated="update_case_data()" />  
              <dataBox  label="Durée"           type="String"   v-model=caseDoc.schedule.duration   @updated="update_case_data()" />  
              <dataBox  label="Avancement"      type="Percent"  v-model=caseDoc.progress            @updated="update_case_data()" />
            </div>
          </div>
          <div class="card-body">
            <h4 class="card-title mb-4 font-size-18">Charges</h4>
            <table class="table center table-nowrap ">
               <tr>
                  <th></th>
                  <th>Budget d'Exécution</th>
                  <th>Consommé à date</th>
                  <th>Prévision à Terminaison</th>
               </tr>
               <tr>
                  <td>MO Agents</td>
                  <td> {{ Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(caseDoc.budget.workforce) }} </td>
                  <td> {{ Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(caseDoc.conso.workforce)  }} </td>
                  <td> {{ Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(caseDoc.prev.workforce)   }} </td>
               </tr>
                <tr>
                  <td>MO Etudes</td>
                  <td> - €</td>
                  <td> - €</td>
                  <td> - €</td>                
               </tr>
                <tr>
                  <td>Matériel</td>
                  <td> {{ Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(caseDoc.budget.material) }} </td>
                  <td> {{ Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(caseDoc.conso.material)  }} </td>
                  <td> {{ Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(caseDoc.prev.material)   }} </td>
              </tr>   
              <tr>
                  <td>Sous-traitance</td>
                  <td> {{ Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(caseDoc.budget.subcontracting) }} </td>
                  <td> {{ Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(caseDoc.conso.subcontracting)  }} </td>
                  <td> {{ Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(caseDoc.prev.subcontracting)   }} </td>
              </tr>  
              <tr>
                  <td>Total</td>
                  <td> {{ Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(caseDoc.budget.workforce+caseDoc.budget.material+caseDoc.budget.subcontracting) }} </td>
                  <td> {{ Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(caseDoc.conso.workforce+caseDoc.conso.material+caseDoc.conso.subcontracting)  }} </td>
                  <td> {{ Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(caseDoc.prev.workforce+caseDoc.prev.material+caseDoc.prev.subcontracting)   }} </td>
               </tr>                
            </table>
          </div>
          <div class="card-body">
          <h4 class="card-title mb-4 font-size-18">Commentaires</h4>
          <ckeditor v-model="caseDoc.comments" :editor="editor" @blur="update_case_comments()"></ckeditor>       
          </div>
        </div>
      </template>
    </Loader>
  </Layout>
</template>


<style scoped>
.databox{
  border-bottom: solid 1px grey ; 
}


td:first-child
{
    text-align: left; 
}
table
{
    text-align: center; 
}
td:first-child{
   text-align: left; 
    font-weight: bold;
}
tr:first-child{
  color: #2A3042;
}
tr:last-child { 
  color: white  ;
  background:#2A3042; }

</style>
