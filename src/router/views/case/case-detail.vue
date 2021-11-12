<script>
// import axios from "axios";

import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { getFirebaseBackend } from "@/firebaseUtils";

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
  components: { Layout, PageHeader},
  data() {
    return {
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
    db.collection("case").doc('OCPL').collection("2021").doc(this.$route.params.caseId)
        .get().then((document) => {          
          this.caseDoc = document.data();
        });
    //db.collection('case').document("OCPL").collection("2021").doc(this.$route.params.caseId).get().then((doc) => {
    //  console.log(JSON.stringify(doc.data()));
    //})
  }
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />  
    <h1>{{ (caseDoc !== null) ? caseDoc.contract.name  : ""}}</h1>  
    <!-- end row -->
  </Layout>
</template>
