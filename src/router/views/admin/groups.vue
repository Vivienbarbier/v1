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
    title: "Administration des groupes",
    meta: [
      {
        name: "Groupes",
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
      title: "Administration des groupes",
      items: [
        {
          text: "Administration",
          href: "/",
        },
        {
          text: "Groupes",
          active: true,
        },
      ], 
      columns: [
          {
              property: 'firstName',
              title: 'First Name',
              sortable: true,
              filterable: true,
          },
          {
              property: 'lastName',
              title: 'Last Name',
              filterable: true,
              sortable: true,
          },
      ],
      rows: [
          {
              firstName: 'Albert',
              lastName: 'Einstein',
          },
          {
              firstName: 'Barack',
              lastName: 'Obama',
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

