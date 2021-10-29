<script>
import Layout from "../../layouts/main";
import appConfig from "@/app.config";
import PageHeader from "@/components/page-header";

import { getFirebaseBackend } from "@/firebaseUtils";
import "firebase/firestore";

/**
 * Dashboard Component
 */

export default {
   page: {
    title: "Dashboard",
    meta: [{ name: "description", content: appConfig.description }],
  },

  components: {
    Layout,
    PageHeader,
  },
  data() {
    return {
      data : "sdf",
      title: "Tableau de bord"
     };
  },
  created(){
    console.log("created")
    var db = getFirebaseBackend().getFirestore();
    db.collection("case")
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
          });
         })
        .catch((error) => {
          console.log("Error getting documents: ", error);
        });   
  }
};
</script>

<template>
  <Layout>
    <PageHeader :title="title"/> 
    <h1> {{ data }} </h1> 
  </Layout>
</template>
