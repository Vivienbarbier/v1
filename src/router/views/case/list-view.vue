<script>
// import axios from "axios";

import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import CaselistView from '@/components/widgets/caselist'

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
          text: "Chantiers",
          href: "/cases",
        },
        {
          text: "Liste",
          active: true,
        },
      ],     
      caselist: [],
    }
  },
  created() {
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
                index : ++count,
                work_order_number : c.work_order_number,
                imputation_code   : c.imputation_code,
                owner : c.owner,
                name : c.name,
                client: c.client,
                start_date: c.start_date,
                revenu : c.revenu,
                progress : (c.progress)*100+"%",
                status : c.status
              })
            });
          });
         })
        .catch((error) => {
          console.log("Error getting documents: ", error);
        });   
  },
  methods: {
   
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
                  <button type="button" class="btn btn-success btn-rounded mb-2 me-2">
                    <i class="mdi mdi-plus me-1"></i> Add New Order
                  </button>
                </div>
              </div>
              <!-- end col-->
            </div>            
            <CaselistView  :caselist="caselist" :filter="filter" />
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
