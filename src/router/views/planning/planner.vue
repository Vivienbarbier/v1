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
    title: "Planning",
    meta: [
      {
        name: "Planning",
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
      title: "Planification des chantiers",
      items: [
        {
          text: "Planification",
          href: "/planning",
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

