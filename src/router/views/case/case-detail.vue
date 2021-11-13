<script>
// import axios from "axios";

import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { getFirebaseBackend } from "@/firebaseUtils";
import Editable from '@/helpers/Editable';

import appConfig from "@/app.config";
import "firebase/firestore";


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
  components: { Layout, PageHeader, Editable},
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
     }
  },
  mounted(){
    var db = getFirebaseBackend().getFirestore();
    db.collection("case").doc(this.$route.params.bu).collection("2021").doc(this.$route.params.caseId)
        .get().then((document) => {          
          this.caseDoc = document.data();
        });
    //db.collection('case').document("OCPL").collection("2021").doc(this.$route.params.caseId).get().then((doc) => {
    //  console.log(JSON.stringify(doc.data()));
    //})
  },
  methods: {
    onUpdate: function(row, col, newValue) {
            console.log('update', row, this.rows[row][col], newValue);
            this.rows[row][col] = newValue;
            this.updated = true;
        },
        onAdd: function() {
            console.log('add');

            var newRow = {
                nl: '',
                en: '',
            }
            console.log(newRow);
        },
        onDelete: function(index, event) {
          console.lof(index, event)
            // ... implement your delete function
        },
      }
    }
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <editable v-model="content"></editable>
    <h1>{{ (caseDoc !== null) ? caseDoc.contract.name  : ""}}</h1> 
    <div class="card">
      <div class="card-body">
        <h4 class="card-title mb-4">Description du chantier</h4>
        <div class="row">
          <div class="col-md-6">1</div>
          <div class=" col-md-6 hstack gap-1">
            <label>sdkjflsdjf</Label>
            <editable class="form-control me-auto" v-model="content"></editable>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">3</div>
          <div class="col-md-6">4</div>
        </div>
        <div class="row">
          <div class="col-md-6">5</div>
          <div class="col-md-6">.col-md-6</div>
        </div>
      </div>
    </div>
  </Layout>
</template>


<style scoped>
#boxContainer {
  height: 100%;
  width: 50%;
  display: flex;
      background: red;
}
#nameLeft {
  width: 12em;
  background: blue;
}
#dataRight {
  width: 100%;
    background: green;
}
</style>
