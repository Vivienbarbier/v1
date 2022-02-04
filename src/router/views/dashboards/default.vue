<script>
import Layout from "../../layouts/main";
import appConfig from "@/app.config";
import PageHeader from "@/components/page-header";
import Stat from "@/components/widgets/stat";

  // import Treeselect component & Style
  import Treeselect from '@riophae/vue-treeselect'
  import '@riophae/vue-treeselect/dist/vue-treeselect.css'

import { dashboardChartsOptions, caseTypePieChart, caseStatusHistogram} from "./dashboardChartsOptions";
import { getFirebaseBackend } from "@/firebaseUtils";


/**
 * Saas Dashboard Component
 */
export default {
  page: {
    title: "Tableau de bord",
    meta: [
      {
        name: "description",
        content: appConfig.description,
      },
    ],
  },
  components: {
    Layout,
    PageHeader,
    Stat,
    Treeselect,
  },
  data() {
    return {
      title: "Tableau de Bord",
      items: [
        {
          text: "Dashboards",
          href: "/",
        },
        {
          text: "Chantiers",
          active: true,
        },
      ],
      groups : {
        selected : ["DR1","DR2"],
        list : [ 
          {
              id: 'DR1',
              label: 'Direction régionnale #1',
              children: [ {
                id: 'DR1-T1',
                label: 'Territoire #1',
                children: [ 
                  {
                      id: 'DR1-T1-G1',
                      label: 'Equipe A',
                  },
                  {
                      id: 'DR1-T1-G2',
                      label: 'Equipe B',
                  },
                  ]
              }, {
                id: 'DR1-T2',
                label: 'Territoire #2',
              } ],
          }, 
          { 
            id: 'DR2',
              label: 'Direction régionnale #2',
              children: [ {
                id: 'DR2-T1',
                label: 'Territoire #1',
                children: [ 
                  {
                      id: 'DR2-T1-G1',
                      label: 'Equipe A',
                  },
                  {
                      id: 'DR2-T1-G2',
                      label: 'Equipe B',
                  },
                  ]
              }, {
                id: 'DR2-T2',
                label: 'Territoire #2',
                 children: [ 
                  {
                      id: 'DR2-T2-G1',
                      label: 'Equipe A',
                  },
                  {
                      id: 'DR2-T2-G2',
                      label: 'Equipe B',
                  },
                  ]
              } ],
          }
        ],
      },
      kpi:{
        number_of_cases: {
          total : 0,
          by_type: [],
          by_status : [],
        },
        revenu : {
          total : 0,
          ytd: 0,
          ytd_by_type : [],
          remaining : 0,
        },
        margin : {
          total : 0,
          ytd: 0,
          ytd_by_type : [],
          remaining : 0,
        }
      },
      dashboardChartsOptions: dashboardChartsOptions,
      caseTypePieChart: caseTypePieChart,
      caseStatusHistogram : caseStatusHistogram,
    }
  },
  created() {
    this.load_case_list();
  },
  methods: {
    getKPIObject(){
      return {
        ready : false,
        number_of_cases: {
          total : 0,
          by_type: [0,0,0,0,0],
          by_status : [],
          by_status_and_type : [],
        },
        revenu : {
          total : 0,
          ytd: 0,
          ytd_by_type : [0,0,0,0,0],
          remaining : 0,
        },
        margin : {
          total : 0,
          ytd: 0,
          ytd_by_type : [0,0,0,0,0],
          remaining : 0,
        },
        finance : [new Array(),new Array()],
        histogram : [ 
          { name: "PE", data: [0,0,0,0,0,0,0,0], },
          { name: "PE", data: [0,0,0,0,0,0,0,0], },
          { name: "PE", data: [0,0,0,0,0,0,0,0], },
          { name: "PE", data: [0,0,0,0,0,0,0,0], },
          { name: "PE", data: [0,0,0,0,0,0,0,0], },
          { name: "PE", data: [0,0,0,0,0,0,0,0], }
        ]
      };
    },
    getAllLeaves(tree){
      var leaves = [];
      if (tree.children === undefined){
        leaves.push(tree.id);
      }else{
        tree.children.forEach((branch) => {        
          leaves = leaves.concat(this.getAllLeaves(branch));
        });
      }
    return leaves;    
    },
    exploreTree(selected, tree){
      var leaves = [];
      if (tree === undefined) return [];
      tree.forEach((branch) => {
        if (branch.id === selected){
          leaves = leaves.concat(this.getAllLeaves(branch));
        }else if (branch.children !== undefined){
          leaves = leaves.concat(this.exploreTree(selected,branch.children));
        }
      });
      return leaves;
    },

    getAllGroups(){
      var leaves = [];
      if(this.groups.selected.length === 0){
        this.groups.list.forEach((branch) => {         
          leaves = leaves.concat(this.getAllLeaves(branch));
        });
      }else{
        this.groups.selected.forEach((s) => {
          leaves = leaves.concat(this.exploreTree(s,this.groups.list));
        });
      }
      return leaves;
    },
    formatCurrency(amount, currency,maximumFractionDigits){
      if(currency === "KEUR"){
        if(amount === undefined) return "-";
        else return Math.round(amount/1000)+" k€"
      }
      return (Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency, maximumFractionDigits: maximumFractionDigits }).format(amount));
    },
    async load_case_list(){
      this.kpi = this.getKPIObject();
      this.dashboardChartsOptions.chartOptions.forecastDataPoints.count = 0;
      

      var db = getFirebaseBackend().getFirestore();
      var firestore = getFirebaseBackend().getFirestoreObj();
      var groups = this.getAllGroups();
      db.collection("case").where(firestore.FieldPath.documentId(), 'in', groups).get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
          const list = doc.data().list;
          list.forEach((c) => {
            this.kpi.number_of_cases.total++;
            var type;
            switch (c.type) {
              case 'PE' :     type = 0; break;
              case 'TC' :     type = 1; break;
              case 'TLE' :    type = 2; break;
              case 'CCO' :    type = 3; break;
              default :       type = 4; break;
            }   

            var stat;
            switch (c.status) {
              case 'qualify' :    stat = 0; break;
              case 'planify' :    stat = 1; break;
              case 'prepare' :    stat = 2; break;
              case 'execute' :    stat = 3; break;
              case 'wip' :        stat = 5; break;
              case 'closing' :    stat = 6; break;
              case 'closed' :     stat = 7; break;
              default :           stat = 8; break;
            }
            this.kpi.histogram[type].data[stat]++;


            const revenu_produced = (c.revenu*c.progress)/100;
            this.kpi.number_of_cases.by_type[type]++;
            this.kpi.revenu.ytd += c.ytd_revenu;
            this.kpi.margin.ytd += c.ytd_margin;
            this.kpi.revenu.ytd_by_type[type] += c.ytd_revenu;
            this.kpi.margin.ytd_by_type[type] += c.ytd_margin;
            this.kpi.revenu.remaining += (c.revenu-revenu_produced);
            }); // End of forEach List
          const records = doc.data().records;       
          let startTs = new Date(2021,0,1).getTime();
          let todayTs =  Date.now();
          records.forEach((r) => {
            if (r.ts > startTs && r.ts < todayTs){
              const index = this.kpi.finance[0].findIndex( v => v[0] === r.ts);
              if (index === -1){
                this.kpi.finance[0].push([r.ts, r.revenu]);
                this.kpi.finance[1].push([r.ts, r.margin]);
              }else{
                this.kpi.finance[0][index][1] += r.revenu;
                this.kpi.finance[1][index][1] += r.margin;
              }   
            }         
          });

          doc.data().previsions.forEach((r) => {
            if (r.ts >= todayTs){
              const index = this.kpi.finance[0].findIndex( v => v[0] === r.ts);
              if (index === -1){
                this.kpi.finance[0].push([r.ts, r.revenu]);
                this.kpi.finance[1].push([r.ts, r.margin]);
                this.dashboardChartsOptions.chartOptions.forecastDataPoints.count++;
              }else{
                this.kpi.finance[0][index][1] += r.revenu;
                this.kpi.finance[1][index][1] += r.margin;
              }   
            }
          });   
        }); // End of QuerySnapshot
        var revenu = 0, margin = 0;
        this.dashboardChartsOptions.series[0].data = []; 
        this.dashboardChartsOptions.series[1].data = []; 
        this.kpi.finance[0].sort((a,b) => {return a[0] - b[0]; }) 
        this.kpi.finance[1].sort((a,b) => {return a[0] - b[0]; }) 

        for (var i in this.kpi.finance[0]){
          revenu += this.kpi.finance[0][i][1];
          margin += this.kpi.finance[1][i][1];
          this.dashboardChartsOptions.series[0].data.push([this.kpi.finance[0][i][0], Math.round(revenu)]);
          this.dashboardChartsOptions.series[1].data.push([this.kpi.finance[1][i][0], Math.round(margin)]);
        }
        this.kpi.ready = true;
      }); // end of db Read
    }
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="card">
      <div class="card-body">
        <div class="row">
          <treeselect v-model="groups.selected" :multiple="true" :options="groups.list" :append-to-body="true" :show-count="true" @input=" load_case_list()"/>
        </div>
      </div>
     </div>
    <div class="row">
      <div class="col-md-4">
        <Stat 
          icon="bx bx-archive-in"
          title="Chiffre d'affaires"  
          :value="this.formatCurrency(this.kpi.revenu.ytd, 'EUR',0)"
          evol_value="+100k€"
          evol_label='depuis le 1er Jan.'
          />
      </div>
      <div class="col-md-4">
        <Stat 
          icon="bx bx-purchase-tag-alt"
          title="Marge"
          :value="this.formatCurrency(this.kpi.margin.ytd, 'EUR',0)"
          evol_value="+100k€"
          evol_label='depuis le 1er Jan.'
          />
      </div>
      <div class="col-md-4">
        <Stat icon="bx bx-purchase-tag-alt"
          title="Marge"
          :value="(100*this.kpi.margin.ytd/this.kpi.revenu.ytd,3).toFixed(1)+'%'"
          evol_value="+100k€"
          evol_label='depuis le 1er Jan.'
          />
      </div>
      <div class="col-md-12">
        <div class="card">
          <div class="card-body">
            <apexchart v-if="this.kpi.ready"
              class="apex-charts"
              height="380"
              dir="ltr"
              :series="this.dashboardChartsOptions.series"
              :options="this.dashboardChartsOptions.chartOptions"
            ></apexchart>
          </div>      
        </div>      
      </div>      
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title mb-4">{{ kpi.number_of_cases.total.toString() }} chantiers par Type</h4>
            <div>
              <apexchart v-if="this.kpi.ready"
                class="apex-charts"
                dir="ltr"
                height="240"
                :series="kpi.number_of_cases.by_type"
                :options="caseTypePieChart.chartOptions"
              ></apexchart>
            </div>
            <div class="text-center text-muted">
              <div class="row">
                <div class="col-3">
                  <div class="mt-4">
                    <p class="mb-2 text-truncate">
                      <i class="mdi mdi-circle text-primary me-1"></i>
                      PE
                    </p>
                    <h5>{{this.formatCurrency(kpi.revenu.ytd_by_type[0], 'KEUR',0)}}</h5>
                  </div>
                </div>
                <div class="col-3">
                  <div class="mt-4">
                    <p class="mb-2 text-truncate">
                      <i class="mdi mdi-circle text-warning me-1"></i>
                      TC
                    </p>
                    <h5>{{this.formatCurrency(this.kpi.revenu.ytd_by_type[1], 'KEUR',0)}}</h5>
                  </div>
                </div>
                <div class="col-3">
                  <div class="mt-4">
                    <p class="mb-2 text-truncate">
                      <i class="mdi mdi-circle text-pink me-1"></i>
                      CCO
                    </p>
                    <h5>{{this.formatCurrency(this.kpi.revenu.ytd_by_type[2], 'KEUR',0)}}</h5>
                  </div>
                </div>
                <div class="col-3">
                  <div class="mt-4">
                    <p class="mb-2 text-truncate">
                      <i class="mdi mdi-circle text-danger me-1"></i>
                      TLE
                    </p>
                    <h5>{{this.formatCurrency(this.kpi.revenu.ytd_by_type[3], 'KEUR',0)}}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
       <div class="col-md-6">
          <div class="card">
            <div class="card-body">
            <h4 class="card-title mb-4">Statuts</h4>
            <apexchart v-if="this.kpi.ready"
              class="apex-charts"
              type="bar"
              dir="ltr"
              height="305"
              :series="this.kpi.histogram"
              :options="this.caseStatusHistogram.chartOptions"
            ></apexchart>
          </div> 
        </div>
      </div>
    </div> <!-- End Row -->
  </Layout>
</template>

