<script>
// import axios from "axios";

import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import CaselistView from '@/router/views/case/case-list'

import appConfig from "@/app.config";
import { getFirebaseBackend } from "@/firebaseUtils";
import "firebase/firestore";


/**
 * Advanced table component
 */
export default {
  page: {
    title: "Liste de chantiers",
    meta: [
      {
        name: "description",
        content: appConfig.description,
      },
    ],
  },
  components: { Layout, PageHeader, CaselistView },
  data() {
    return {
      title: 'Liste de chantiers',
      filter: null,
      items: [
        {
          text: "Liste des chantiers",
          href: "/case",
          active: true,
        }
      ],
      updating : true,     
      caselist: [],
      headers : [
            { name: "work_order_number",  label : "WO",                 sortable : true,  filtrable : true,  align: "center", style :"width:9em" }, 
            { name: "owner",              label : "Responsable",        sortable : true,  filtrable : true,  align: "center", style :"" },
            { name: "client",             label : "Client",             sortable : true,  filtrable : true,  align: "right",  style :"" },
            { name: "name",               label : "Nom du chantier",    sortable : true,  filtrable : true,  align: "right",  style :"width:25em" },
            { name: "revenu",             label : "Chiffre d'affaires", sortable : true,  filtrable : true,  align: "center", style :"" },
            { name: "start_date",         label : "Début",              sortable : true,  filtrable : true,  align: "center", style :"width:8em" },
            { name: "progress",           label : "Avancement",         sortable : true,  filtrable : true,  align: "left",   style :"width:8em" },
            { name: "status",             label : "Status",             sortable : true,  filtrable : true,  align: "center", style :"width:7em" },
            { name: "action",             label : "",                   sortable : false, filtrable : false, align: "center", style :"width:3em" }
      ],
    }
  },
  created() {
    this.load_case_list();
  },
  methods: {
    load_case_list(){
      var count = 0;
      var db = getFirebaseBackend().getFirestore();
      db.collection("case")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const list = doc.data().list;
          list.forEach((c) => {
            this.caselist.push({
              id : c.id,
              business_unit: doc.id,
              index : ++count,
              work_order_number : c.work_order_number,
              imputation_code   : c.imputation_code,
              owner : c.owner,
              name : c.name,
              client: c.client,
              start_date: c.start_date,
              revenu : c.revenu,
              progress : c.progress,
              status : c.status
            })
          });
        });
        this.updating = false;
       })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      }); 
    }
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="row mb-2">
              <div class="col-sm-4">
                <div class="search-box me-2 mb-2 d-inline-block">
                  <div class="position-relative">
                    <input type="text" class="form-control" v-model="filter" placeholder="Rechercher..." />
                    <i class="bx bx-search-alt search-icon"></i>
                  </div>
                </div>
              </div>
              <div class="col-sm-8">
                <div class="text-sm-end">
                  <button type="button" class="pill btn btn-success btn-rounded mb-2 me-2 ">
                    <i class="mdi mdi-plus me-1"></i> Add New Order
                  </button>
                </div>
              </div>
              <!-- end col-->
            </div>            
            <CaselistView  :caselist="caselist" :headers="headers" :filter="filter" :updating="updating" />
            <!-- Pagination 
            <ul class="pagination pagination-rounded justify-content-end mb-2">
              <li class="page-item disabled">
                <a class="page-link" href="javascript: void(0);" aria-label="Previous">
                  <i class="mdi mdi-chevron-left"></i>
                </a>
              </li>
              <li class="page-item active">
                <a class="page-link" href="javascript: void(0);">1</a>
              </li>
              <li class="page-item">
                <a class="page-link" href="javascript: void(0);">2</a>
              </li>
              <li class="page-item">
                <a class="page-link" href="javascript: void(0);">3</a>
              </li>
              <li class="page-item">
                <a class="page-link" href="javascript: void(0);">4</a>
              </li>
              <li class="page-item">
                <a class="page-link" href="javascript: void(0);">5</a>
              </li>
              <li class="page-item">
                <a class="page-link" href="javascript: void(0);" aria-label="Next">
                  <i class="mdi mdi-chevron-right"></i>
                </a>
              </li>
            </ul>
            End Pagination-->
          </div>
          <!-- end card-body -->
        </div>
        <!-- end card -->
      </div>
      <!-- end col -->
    </div>
    <!-- end row -->
  </Layout>
</template>

<style scoped>
.pill {
  border-radius: 30px;
  color: #fff;
  background-color: #34c38f;
  border-color: #34c38f;
}
</style>
