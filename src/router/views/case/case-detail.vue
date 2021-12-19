<script>
// import axios from "axios";

import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { getFirebaseBackend } from "@/firebaseUtils";
import dataBox from '@/helpers/data-box';
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
  components: { Layout, PageHeader, dataBox},
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
      callMethod(name) {
        console.log(name)
        console.log(this[name])
        
        return this[name];
        //this.clickShowDeleteAcceptForm()

    },
  }
}
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <template v-if="caseDoc !== null">
      <h5>{{caseDoc.contract}}</h5>
      <h1>{{ (caseDoc !== null) ? caseDoc.contract.name  : ""}}</h1> 
      <div class="card">
        <div class="card-body">
          <h4 class="card-title mb-4">Description du chantier</h4>
          <div class="row">
            <dataBox  label="Revenu"            v-model=caseDoc.contract.revenu         />
            <dataBox  label="Date de signature" v-model=caseDoc.contract.start_date     />
            <dataBox  label="Nom du chantier"   v-model=caseDoc.contract.name           />
            <dataBox  label="client"            v-model=caseDoc.contract.client         />
          </div>
        </div>
      </div>
    </template>
  </Layout>
</template>


<style scoped>
.databox{
  border-bottom: solid 1px grey ; 
}

</style>
