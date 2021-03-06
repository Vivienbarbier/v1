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
import { chartRevenueHistory } from "./chartsOptions";



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
      sState : {
        description : true,
        owner : true,
        schedule : true,
        costs : true,
        risks : true,
        graph: true,
        situation : false,
        exercices : false
      },
      editFlag:{
        budget : false,
        prev : false,
      },
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
      },
      type_datalist : {
        TC : "TC",
        PE : "PE",
        CCO : "CCO",
        TLE : "TLE",
      },
      chartRevenueHistory: chartRevenueHistory,
    }
  },
  computed: {
    work_duration : function(){
      var days = (this.caseDoc.schedule.end_date_ts - this.caseDoc.schedule.start_date_ts) / 86400000;
      return (days == 1) ? "1 jour" : ((days < 30) ? days + " jours" : parseInt(days/7) + "semaines");
    }
  },
  mounted(){
    this.load_case_data();
  },
  methods: {
    computeGraphs(){      
      this.chartRevenueHistory.series = [
        {name : "Chiffre d'affaires", data :[] },
        {name : "Marge", data :[] }
       ];
      var revenu =  0, margin = 0;
      let now = (new Date()).getTime();
      for( var rec of this.caseDoc.records){
        let ts = (new Date(rec.date)).getTime()
        if(ts <= now){
          this.chartRevenueHistory.series[0].data.push([ts, Math.round(revenu)]) 
          this.chartRevenueHistory.series[1].data.push([ts, Math.round(margin)]) 
          revenu +=  rec.revenu
          margin += rec.margin
        }
      }
      var count = 0
      for( var prev of this.caseDoc.previsions){ 
        let ts = (new Date(prev.date)).getTime()
        if(ts > now){
          this.chartRevenueHistory.series[0].data.push([ts, Math.round(revenu)]);
          this.chartRevenueHistory.series[1].data.push([ts, Math.round(margin)]);
          revenu +=  prev.revenu
          margin += rec.margin
          count++;
        }
      }
      
      this.chartRevenueHistory.options.forecastDataPoints.count = count;
      let max = Math.max(revenu,margin);
      console.log(max, revenu, margin)
      this.chartRevenueHistory.options.yaxis.max = max + (10000 - (max % 10000));
    },
    formatCurrency(amount, currency,maximumFractionDigits){
      return (Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency, maximumFractionDigits: maximumFractionDigits }).format(amount));

    },
    load_case_data(){
      var db = getFirebaseBackend().getFirestore();
      db.collection("case").doc(this.$route.params.group).collection("current").doc(this.$route.params.caseId)
      .get().then((document) => {          
        this.caseDoc = document.data();
        console.log(this.caseDoc)
        this.computeGraphs();
      });
    },
    update_case_data(){
      var db = getFirebaseBackend().getFirestore();
      db.collection("case").doc(this.$route.params.group).collection("current").doc(this.$route.params.caseId).update(this.caseDoc);
    },
    update_case_schedule(){
      this.caseDoc.schedule.end_date_ts = (new Date(this.caseDoc.schedule.end_date)).getTime();
      this.caseDoc.schedule.start_date_ts = (new Date(this.caseDoc.schedule.start_date)).getTime();
      var db = getFirebaseBackend().getFirestore();
      db.collection("case").doc(this.$route.params.group).collection("current").doc(this.$route.params.caseId).update({
          "schedule.end_date_ts" : this.caseDoc.schedule.end_date_ts,
          "schedule.end_date" : this.caseDoc.schedule.end_date,
          "schedule.start_date" : this.caseDoc.schedule.start_date,
          "schedule.start_date_ts" : this.caseDoc.schedule.start_date_ts
      });
    },
    update_case_comments(){
      var db = getFirebaseBackend().getFirestore();
      db.collection("case").doc(this.$route.params.group).collection("current").doc(this.$route.params.caseId).update({comments : this.caseDoc.comments});
    }
  }
}
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <Loader :loading="caseDoc !== null">
      <template v-if="caseDoc !== null && caseDoc.contract !== undefined">
        <div class="card">
          <div class="card-body">
            <!--<h4 class="card-title">Détail du chantier</h4>
            <p class="card-title-desc">----</p> -->
            <div role="tablist">
              <b-card no-body class="mb-1 shadow-none">
                <b-card-header header-tag="header" role="tab" @click="sState.description = !sState.description">
                  <h6 class="m-0">
                    <a class="text-dark fw-bold" >Description du chantier</a>
                    <span style="float:right;">
                      <i :class="sState.description ? 'mdi mdi-chevron-up' : 'mdi mdi-chevron-down'"></i>
                    </span>
                  </h6>
                </b-card-header>
                <b-collapse id="description" v-model=sState.description>
                  <b-card-body>
                    <div class="row">           
                      <dataBox  label="Nom du chantier"     type="String"     v-model=caseDoc.contract.name         @updated="update_case_data()"  />
                      <dataBox  label="client"              type="String"     v-model=caseDoc.contract.client       @updated="update_case_data()"  />
                      <dataBox  label="Chiffre d'affaires"  type="Currency"   v-model=caseDoc.contract.revenu       @updated="update_case_data()"  />
                      <dataBox  label="Type"                type="Datalist"   v-model=caseDoc.type                  @updated="update_case_data()"  :datalist="type_datalist"/>
                      <dataBox  label="Numéro de chantier"  type="String"     v-model=caseDoc.work_order            @updated="update_case_data()"  /> 
                      <dataBox  label="Numéro d'imputation" type="String"     v-model=caseDoc.imputation_code       @updated="update_case_data()"  />
                      <dataBox  label="Date de signature"   type="Date"       v-model=caseDoc.contract.signing_date @updated="update_case_data()"  />
                      <dataBox  label="Status"              type="Datalist"   v-model=caseDoc.status                @updated="update_case_data()"  :datalist="status_datalist"/>
                    </div>
                  </b-card-body>
                </b-collapse>
              </b-card>
              <b-card no-body class="mb-1">
                <b-card-header header-tag="header" role="tab" @click="sState.owners = !sState.owners">
                  <h6 class="m-0">
                    <a class="text-dark fw-bold" >Responsables</a>
                    <span style="float:right;">
                      <i :class="sState.owners ? 'mdi mdi-chevron-up' : 'mdi mdi-chevron-down'"></i>
                    </span>
                  </h6>
                </b-card-header>
                <b-collapse id="owners" v-model=sState.owners>
                  <b-card-body>
                    <div class="row">          
                      <dataBox  label="Direction Régionale" type="String"   v-model=caseDoc.owners.business_unit    @updated="update_case_data()" /> 
                      <dataBox  label="Resp. d'affaire"     type="String"   v-model=caseDoc.owners.business         @updated="update_case_data()" />
                      <dataBox  label="Resp. d'exécution"   type="String"   v-model=caseDoc.owners.execution        @updated="update_case_data()" />
                      <dataBox  label="Resp. Opérationnel"  type="String"   v-model=caseDoc.owners.field            @updated="update_case_data()" />
                    </div>
                  </b-card-body>
                </b-collapse>
              </b-card>
              <b-card no-body class="mb-1">
                <b-card-header header-tag="header" role="tab" @click="sState.schedule = !sState.schedule">
                  <h6 class="m-0">
                    <a class="text-dark fw-bold" >Planning</a>
                    <span style="float:right;">
                      <i :class="sState.schedule ? 'mdi mdi-chevron-up' : 'mdi mdi-chevron-down'"></i>
                    </span>
                  </h6>
                </b-card-header>
                <b-collapse id="schedule" v-model=sState.schedule>
                  <b-card-body>
                    <div class="row">        
                      <dataBox  label="Date de début"   type="Date"     v-model=caseDoc.schedule.start_date @updated="update_case_schedule()" />
                      <dataBox  label="Date de fin  "   type="Date"     v-model=caseDoc.schedule.end_date   @updated="update_case_schedule()" />  
                      <dataBox  label="Durée"           type="Label"    v-model=work_duration              />  
                      <dataBox  label="Avancement"      type="Percent"  v-model=caseDoc.progress            @updated="update_case_data()" />
                    </div>
                  </b-card-body>
                </b-collapse>
              </b-card>
              <b-card no-body class="mb-1">
                <b-card-header header-tag="header" role="tab" @click="sState.costs = !sState.costs">
                  <h6 class="m-0">
                    <a class="text-dark fw-bold" >Charges</a>
                    <span style="float:right;">
                      <i :class="sState.costs ? 'mdi mdi-chevron-up' : 'mdi mdi-chevron-down'"></i>
                    </span>
                  </h6>
                </b-card-header>
                <b-collapse id="costs" v-model=sState.costs>
                  <b-card-body>
                    <table class="table center table-nowrap ">
                      <tr>
                         <th></th>
                         <th>Budget d'Exécution<i class="mdi mdi-pencil" @click="editFlag.budget = !editFlag.budget"/>
                         </th>
                         <th>Consommé à date</th>
                         <th>Prévision à Terminaison<i class="mdi mdi-pencil" @click="editFlag.prev = !editFlag.prev"/></th>
                      </tr>
                      <tr>
                        <td style="padding-left: 1em;">MO Agents</td>
                        <td v-if="!editFlag.budget"> {{ this.formatCurrency(caseDoc.budget.workforce, 'EUR',0) }} </td>
                        <td v-else style="text-align:center; ">
                          <input  type="number" step="any" v-model="caseDoc.budget.workforce" class="form-control form-control-sm editable-value-in-tab ">
                        </td>
                        <td> {{ this.formatCurrency(caseDoc.conso.workforce, 'EUR',0)  }} </td>
                        <td v-if="!editFlag.prev"> {{ this.formatCurrency(caseDoc.prev.workforce, 'EUR',0)   }} </td>
                        <td v-else style="text-align:center; ">
                          <input  type="number" step="any" v-model="caseDoc.prev.workforce" class="form-control form-control-sm editable-value-in-tab ">
                        </td>
                      </tr>
                       <tr>
                         <td style="padding-left: 1em;">MO Etudes</td>
                         <td> - €</td>
                         <td> - €</td>
                         <td> - €</td>                
                      </tr>
                      <tr>
                        <td style="padding-left: 1em;">Matériel</td>
                        <td v-if="!editFlag.budget"> {{ this.formatCurrency(caseDoc.budget.material, 'EUR',0) }} </td>
                        <td v-else>
                          <input  type="number" step="any" v-model="caseDoc.budget.material" class="form-control form-control-sm editable-value-in-tab ">
                        </td>
                        <td> {{  this.formatCurrency(caseDoc.conso.material, 'EUR',0)  }} </td>
                        <td v-if="!editFlag.prev"> {{ this.formatCurrency(caseDoc.prev.material, 'EUR',0)   }} </td>
                        <td v-else>
                          <input  type="number" step="any" v-model="caseDoc.prev.material" class="form-control form-control-sm editable-value-in-tab ">
                        </td>
                      </tr>   
                      <tr>
                        <td style="padding-left: 1em;">Sous-traitance</td>
                        <td v-if="!editFlag.budget"> {{ this.formatCurrency(caseDoc.budget.subcontracting, 'EUR',0) }} </td>
                        <td v-else>
                          <input  type="number" step="any" v-model="caseDoc.budget.subcontracting" class="form-control form-control-sm editable-value-in-tab ">
                        </td>
                        <td> {{  this.formatCurrency(caseDoc.conso.subcontracting, 'EUR',0)  }} </td>
                        <td v-if="!editFlag.prev"> {{ this.formatCurrency(caseDoc.prev.subcontracting, 'EUR',0)   }} </td>
                        <td v-else>
                          <input  type="number" step="any" v-model="caseDoc.prev.subcontracting" class="form-control form-control-sm editable-value-in-tab ">
                        </td>
                      </tr>  
                      <tr>
                        <td style="padding-left: 0.5em;">Total</td>
                        <td> {{  this.formatCurrency(parseFloat(caseDoc.budget.workforce)+parseFloat(caseDoc.budget.material)+parseFloat(caseDoc.budget.subcontracting), 'EUR',0) }} </td>
                        <td> {{  this.formatCurrency(caseDoc.conso.workforce+caseDoc.conso.material+caseDoc.conso.subcontracting, 'EUR',0)  }} </td>
                        <td> {{  this.formatCurrency(parseFloat(caseDoc.prev.workforce)+parseFloat(caseDoc.prev.material)+parseFloat(caseDoc.prev.subcontracting), 'EUR',0)   }} </td>
                      </tr>
                      <tr>
                        <td style="padding-left: 1em;">Chiffre d'affaires</td>
                        <td> {{  this.formatCurrency(caseDoc.contract.revenu, 'EUR',0) }} </td>
                        <td> - </td>
                        <td v-if="!editFlag.prev"> {{ this.formatCurrency(caseDoc.prev.revenu, 'EUR',0)   }} </td>
                        <td v-else>
                          <input  type="number" step="any" v-model="caseDoc.prev.revenu" class="form-control form-control-sm editable-value-in-tab ">
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-left: 1em;">Marge (€)</td>
                        <td> {{  this.formatCurrency( (parseFloat(caseDoc.contract.revenu) - (parseFloat(caseDoc.budget.workforce) +parseFloat(caseDoc.budget.material)+ parseFloat(caseDoc.budget.subcontracting))), 'EUR',0) }} </td>
                        <td> - </td>
                        <td> {{  this.formatCurrency( (parseFloat(caseDoc.prev.revenu) - (parseFloat(caseDoc.prev.workforce)+parseFloat(caseDoc.prev.material)+parseFloat(caseDoc.prev.subcontracting))), 'EUR',0) }} </td>
                      </tr> 
                      <tr>
                        <td style="padding-left: 1em;">Marge (%)</td>
                        <td> {{ (((parseFloat(caseDoc.contract.revenu) - parseFloat(caseDoc.budget.workforce) - parseFloat(caseDoc.budget.material) - parseFloat(caseDoc.budget.subcontracting))*100) / parseFloat(caseDoc.contract.revenu)).toFixed( 1 ) }} % </td>
                        <td> - </td>
                        <td> {{ (((parseFloat(caseDoc.prev.revenu) - parseFloat(caseDoc.prev.workforce) - parseFloat(caseDoc.prev.material) - parseFloat(caseDoc.prev.subcontracting))*100) / parseFloat(caseDoc.prev.revenu)).toFixed( 1 ) }} % </td>
                      </tr>                  
                    </table>
                  </b-card-body>
                </b-collapse>
              </b-card>          
              <b-card no-body class="mb-1">
                <b-card-header header-tag="header" role="tab" @click="sState.graph = !sState.graph">
                  <h6 class="m-0">
                    <a class="text-dark fw-bold" >Graphiques</a>
                    <span style="float:right;">
                      <i :class="sState.graph ? 'mdi mdi-chevron-up' : 'mdi mdi-chevron-down'"></i>
                    </span>
                  </h6>
                </b-card-header>
                <b-collapse id="graph" v-model=sState.graph>
                  <b-card-body>
                    <apexchart
                      class="apex-charts"
                      height="380"
                      type="line"
                      dir="ltr"
                      :series="chartRevenueHistory.series"
                      :options="chartRevenueHistory.options"
                    ></apexchart>
                  </b-card-body>
                </b-collapse>
              </b-card>
              <b-card no-body class="mb-1">
                <b-card-header header-tag="header" role="tab" @click="sState.risks = !sState.risks">
                  <h6 class="m-0">
                    <a class="text-dark fw-bold" >Risques et Provisions</a>
                    <span style="float:right;">
                      <i :class="sState.risks ? 'mdi mdi-chevron-up' : 'mdi mdi-chevron-down'"></i>
                    </span>
                  </h6>
                </b-card-header>
                <b-collapse id="risks" v-model=sState.risks>
                  <b-card-body>
                    <div class="row">        
                      <dataBox  label="Montant Risques et Op."  type="Currency"     v-model=caseDoc.prev.risk_amount @updated="update_case_data()" />
                      <dataBox  label="Description "            type="String"       v-model=caseDoc.prev.risk_description @updated="update_case_data()" />
                      <dataBox  label="Montant Provisions"      type="Currency"     v-model=caseDoc.provision.amount @updated="update_case_data()" />
                      <dataBox  label="Description "            type="String"       v-model=caseDoc.provision.description @updated="update_case_data()" />
                    </div>
                  </b-card-body>
                </b-collapse>
              </b-card>
               <b-card no-body class="mb-1">
                <b-card-header header-tag="header" role="tab" @click="sState.situation = !sState.situation">
                  <h6 class="m-0">
                    <a class="text-dark fw-bold" >Situation</a>
                    <span style="float:right;">
                      <i :class="sState.situation ? 'mdi mdi-chevron-up' : 'mdi mdi-chevron-down'"></i>
                    </span>
                  </h6>
                </b-card-header>
                <b-collapse id="situation" v-model=sState.situation>
                  <b-card-body>
                    <div class="row">              
                      <dataBox  label="Situation méritée"   type="Currency"   v-model=caseDoc.situation.activity        :editable="false" @updated="update_case_data()" />
                      <dataBox  label="Montant facturé"     type="Currency"   v-model=caseDoc.situation.billed_amount   :editable="false" @updated="update_case_data()" />
                      <dataBox  label="Montant à facturer"  type="Currency"   v-model=caseDoc.situation.fae             :editable="false" @updated="update_case_data()" />
                      <dataBox  label="Montant encaissé"    type="Currency"   v-model=caseDoc.situation.received_amount :editable="false" @updated="update_case_data()" />                
                      <dataBox  label="Produit à recevoir"  type="Currency"   v-model=caseDoc.situation.PAR             :editable="false" @updated="update_case_data()" />
                    </div>
                  </b-card-body>
                </b-collapse>
              </b-card>
               <b-card no-body class="mb-1">
                <b-card-header header-tag="header" role="tab" @click="sState.exercices = !sState.exercices">
                  <h6 class="m-0">
                    <a class="text-dark fw-bold" >Exercices</a>
                    <span style="float:right;">
                      <i :class="sState.exercices ? 'mdi mdi-chevron-up' : 'mdi mdi-chevron-down'"></i>
                    </span>
                  </h6>
                </b-card-header>
                <b-collapse id="exercices" v-model=sState.exercices>
                  <b-card-body>
                    <div class="col-md-6 hstack gap-1 databox">  
                      <table class="table center table-nowrap ">
                        <tr>
                          <th></th>
                          <th>2020<br>-</th>
                          <th>2021 <br>Réalisé</th>
                          <th>2021 <br>A réaliser</th>
                          <th>2022+ <br>Projection</th>
                        </tr>
                        <tr>
                          <td>Chiffre d'affaires</td>
                          <td> {{  this.formatCurrency(caseDoc.situation.last_years_revenu, 'EUR',0) }} </td>
                          <td> {{  this.formatCurrency(caseDoc.situation.producted_current_year_revenu, 'EUR',0) }} </td>
                          <td> {{  this.formatCurrency(caseDoc.situation.remaining_current_year_revenu, 'EUR',0) }} </td>
                          <td> {{  this.formatCurrency(caseDoc.situation.projection_next_years_revenu, 'EUR',0) }} </td>
                        </tr>
                        <tr>
                          <td>Marge (€)</td>
                          <td> - </td>
                          <td> - </td>
                          <td> - </td>
                          <td> - </td>
                        </tr>
                        <tr>
                          <td>Marge (%)</td>
                          <td> -% </td>
                          <td> -% </td>
                          <td> -% </td>
                          <td> -% </td>
                        </tr>
                      </table>
                    </div>  
                  </b-card-body>
                </b-collapse>
              </b-card>
            </div>
          </div>
        </div>
      <div class="card">
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
tr:nth-child(6) { 
  color: white  ;
  background:#2A3042; }
tr:nth-child(9) { 
  font-weight:normal;
  font-style: italic;
  background:white; 
}

.editable-value-in-tab{
  max-width: 9em;
  text-align: center; 
  margin-right: auto; 
  margin-left: auto; 
  max-height: 1em;
  background:#ffc40096;
}



</style>
