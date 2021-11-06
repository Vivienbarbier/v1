<script>
// import axios from "axios";

import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";


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
  components: {
    Layout,
    PageHeader,
  },
  data() {
    return {
      title: 'Liste de chantiers',
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

    };
  },
  computed: {
    datatableParameters() {
        return {
            columns: [
              {
                key: "name",
                sortable: true,
              },
              {
                key: "position",
                sortable: true,
              },
              {
                key: "office",
                sortable: true,
              },
              {
                key: "age",
                sortable: true,
              },
              {
                key: "date",
                sortable: true,
              },
              {
                key: "salary",
                sortable: true,
              },
            ],
            data:  [
              {
                name: 'Lucinda Stickley',
                position: 'Data Coordiator',
                office: 'Sirnarasa',
                age: 31,
                date: '2018/07/29',
                salary: '$13600'
              }, {
                name: 'Henrietta Carsberg',
                position: 'Data Coordiator',
                office: 'Paninggaran',
                age: 59,
                date: '2019/07/13',
                salary: '$13700'
              }
            ],
            text : {

              perPageText	: "Afficher :entries chantiers",
              infoText	: "Chantiers de :first a :last sur :total",
              infoTextFiltered	: "Afficher :first à :last de :filtered (Total :total entries)",
              nextButtonText	: "Suivant",
              previousButtonText	: "Précédent",
              paginationSearchText	: "Aller à la page",
              paginationSearchButtonText	: "Aller",
              searchText	: "Rechercher:",
              downloadText	: "Format d'export :",
              downloadButtonText	: "TELECHARGER",
              emptyTableText : "Aucun chantier ...",
            },
            sortingMode : "single",
            allowedExports : ["xls", "csv", "txt"],
            /* other props...*/
        }
    }   
  },
  mounted() {
   
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
            <h4 class="card-title">Liste des chantiers</h4>
            <div>
              <data-table class="data-table" v-bind="datatableParameters"/>
            </div>  
          </div>
        </div>
      </div>       
    </div>   
  </Layout>
</template>
<style lang="scss" scoped>
.data-table {
    display: grid;
    width: 100%;
    grid-template-columns: 25% 25% 25% 25%;
    &> div {
        margin-top: 1rem;
        max-width: 100%;
    }
    & > .data-table-search-filter, .data-table-pagination, .data-table-export-data {
        margin-left: auto;
        border-radius: 30px;
    }
    @media (min-width: 1401px) {
        grid-template-areas:
            "perPage search search search"
            "table table table table"
            "info pagination pagination download";
    }
    @media (min-width: 1051px) AND (max-width: 1400px) {
        grid-template-areas:
            "perPage search search search"
            "table table table table"
            "info pagination pagination pagination"
            ". . download download";
    }
    @media (min-width: 851px) AND (max-width: 1050px) {
        grid-template-areas:
            "perPage search search search"
            "table table table table"
            "pagination pagination pagination pagination"
            "info info download download";
    }
    @media (max-width: 800px) {
        & > .data-table-pagination {
            flex-wrap: wrap;
        }
    }
    @media (min-width: 651px) AND (max-width: 850px) {
        grid-template-areas:
            "perPage search search search"
            "table table table table"
            "pagination pagination pagination pagination"
            "info info info info"
            "download download download download";
    }
    @media (max-width: 650px) {
        grid-template-areas:
            "search search search search"
            "perPage perPage perPage perPage "
            "table table table table"
            "pagination pagination pagination pagination"
            "info info info info"
            "download download download download";
        & > .data-table-per-page {
            margin-left: auto
        }
    }
}

</style>