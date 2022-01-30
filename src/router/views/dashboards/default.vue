<script>
import Layout from "../../layouts/main";
import appConfig from "@/app.config";
import PageHeader from "@/components/page-header";
import Stat from "@/components/widgets/stat";
import { dashboardChartsOptions, caseTypePieChart, caseStatusHistogram } from "./dashboardChartsOptions";
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
    Stat
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
    formatCurrency(amount, currency,maximumFractionDigits){
      if(currency === "KEUR"){
        if(amount === undefined) return "-";
        else return Math.round(amount/1000)+" k€"
      }
      return (Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency, maximumFractionDigits: maximumFractionDigits }).format(amount));
    },
    load_case_list(){
      var db = getFirebaseBackend().getFirestore();
      db.collection("case")
      .get()
      .then((querySnapshot) => {
        this.kpi.number_of_cases.by_type = [0,0,0,0,0];
        this.kpi.revenu.ytd_by_type = [0,0,0,0,0];
        this.kpi.margin.ytd_by_type = [0,0,0,0,0];
        querySnapshot.forEach((doc) => { 

          const list = doc.data().list;
          list.forEach((c) => {
            this.kpi.number_of_cases.total++;
            var type;
            switch (c.type) {
              case 'PE' :     type = 0; break;
              case 'TC' :     type = 1; break;
              case 'CCO' :    type = 2; break;
              case 'TLE' :    type = 3; break;
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
            this.caseStatusHistogram.series[type].data[stat]++;
            //this.kpi.number_of_cases.by_status[type][stat]++
            this.caseStatusHistogram.ready = true;
            
            const revenu_produced = (c.revenu*c.progress)/100;
            this.kpi.number_of_cases.by_type[type]++;
            this.kpi.revenu.ytd += c.ytd_revenu;
            this.kpi.margin.ytd += c.ytd_margin;
            this.kpi.revenu.ytd_by_type[type] += c.ytd_revenu;
            this.kpi.margin.ytd_by_type[type] += c.ytd_margin;
            this.kpi.revenu.remaining += (c.revenu-revenu_produced);
            }); // End of forEach List

          const records = doc.data().records;
          var revenu =  0;
          var margin = 0;
         
         let startTs = new Date(2021,0,1).getTime()
          records.forEach((r) => {
            if (r.ts > startTs ){
              revenu += r.revenu;
              margin += r.margin
              this.dashboardChartsOptions.series[0].data.push([r.ts, Math.round(revenu)]);
              this.dashboardChartsOptions.series[1].data.push([r.ts, Math.round(margin)]);
            }            
          });
          
          this.dashboardChartsOptions.options.forecastDataPoints.count = 0; 
          doc.data().previsions.forEach((r) => {
            revenu += r.revenu;
            margin += r.margin
            this.dashboardChartsOptions.options.forecastDataPoints.count++;
            this.dashboardChartsOptions.series[0].data.push([r.ts, Math.round(revenu)]);
            this.dashboardChartsOptions.series[1].data.push([r.ts, Math.round(margin)]);
          });         
        });
      });
    }

  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
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
            <apexchart v-if="this.dashboardChartsOptions.series[0].data[0] !== undefined"
              class="apex-charts"
              height="380"
              type="line"
              dir="ltr"
              :series="this.dashboardChartsOptions.series"
              :options="this.dashboardChartsOptions.options"
            ></apexchart>
          </div>      
        </div>      
      </div>      
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title mb-4">{{ kpi.number_of_cases.total.toString() }} chantiers par Type</h4>
            <div>
              <apexchart
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
            <apexchart v-if="this.caseStatusHistogram.ready"
              class="apex-charts"
              type="bar"
              dir="ltr"
              height="305"
              :series="this.caseStatusHistogram.series"
              :options="this.caseStatusHistogram.chartOptions"
            ></apexchart>
          </div> 
        </div>
      </div>
    </div> <!-- End Row -->
  </Layout>
</template>

