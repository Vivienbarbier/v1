<script>
import Layout from "../../layouts/main";
import appConfig from "@/app.config";
import PageHeader from "@/components/page-header";

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
    
  }
};
</script>

<template>
  <Layout>
    <PageHeader :title="title"/> 
    <h1> {{ data }} </h1> 
  </Layout>
</template>
