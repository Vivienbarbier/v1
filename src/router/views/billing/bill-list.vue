<script>
import Layout from "../../layouts/main";
import appConfig from "@/app.config";
import PageHeader from "@/components/page-header";
//import { getFirebaseBackend } from "@/firebaseUtils";



/**
 * Saas Dashboard Component
 */
export default {
  page: {
    title: "Facturation",
    meta: [
      {
        name: "Facturation",
        content: appConfig.description,
      },
    ],
  },
  components: {
    Layout,
    PageHeader,

  },
  data() {
    return {
      title: "Gestion de la facturation",
      items: [
        {
          text: "Facturation",
          href: "/billing",
        },
      ],     
    }
  },
  created() {
    this.load();
  },
  methods: {  
    load(){
      console.log("TODO LOAD")        
    }
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <h1>En Construction</h1>
  </Layout>
</template>

