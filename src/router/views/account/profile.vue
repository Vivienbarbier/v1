<script>
import Layout from "../../layouts/main";
import appConfig from "@/app.config";
import form_entry from "../case/module/form-entry.vue";
import "firebase/firestore";
import store from '@/state/store'
import { getFirebaseBackend } from './../../../firebaseUtils'


  // import Treeselect component & Style
  import Treeselect from '@riophae/vue-treeselect'
  import '@riophae/vue-treeselect/dist/vue-treeselect.css'

import {
  required,
} from "vuelidate/lib/validators";

/**
 * Form validation component
 */
export default {
  page: {
    title: "Profile Utilisateur",
    meta: [{ name: "Profile Utilisateur", content: appConfig.description }],
  },
  components: { Layout, form_entry, Treeselect },
  data() {
    return {
      users : store.getters['auth/getCurrentUser'],
      content: 'Profile Utilisateur',
      title: 'Profile', 

      userData: {
        displayName : "-",
        bu :"-",
        email : "vide",
        phoneNumber : "-",
        groups : [],
      },
      submitform: false,
      bu_datalist : {
        OCPL : "Centre Pays de Loire",
        OAURA : "Auvergne-Rhône-Alpes"
      },
      group_datalist : [ "Aura(tous)","Montélimar", "TH"],
        // define options
        options: [ 
            {
                id: 'DR1',
                label: 'Direction régionnale #1',
                children: [ {
                  id: 'DR1-T1',
                  label: 'Territoire #1',
                  children: [ 
                    {
                        id: 'DR1-T1-G1',
                        label: 'Equipe A',
                    },
                    {
                        id: 'DR1-T1-G2',
                        label: 'Equipe B',
                    },
                    ]
                }, {
                  id: 'DR1-T2',
                  label: 'Territoire #2',
                } ],
            }, 
            { 
              id: 'DR2',
                label: 'Direction régionnale #2',
                children: [ {
                  id: 'DR2-T1',
                  label: 'Territoire #1',
                  children: [ 
                    {
                        id: 'DR2-T1-G1',
                        label: 'Equipe A',
                    },
                    {
                        id: 'DR2-T1-G2',
                        label: 'Equipe B',
                    },
                    ]
                }, {
                  id: 'DR2-T2',
                  label: 'Territoire #2',
                   children: [ 
                    {
                        id: 'DR2-T2-G1',
                        label: 'Equipe A',
                    },
                    {
                        id: 'DR2-T2-G2',
                        label: 'Equipe B',
                    },
                    ]
                } ],
            }
        ],


    };   
  },
  validations: {   
    userData: {
      displayName : { required },
      business_unit : { required },
      email : { required },
      groups : { required },  
    }
  }, 
  mounted(){
    this.load_profile_data();
  },
  methods: {  
    load_profile_data(){
      const uid = store.getters['auth/getCurrentUser'].uid;    
      var db = getFirebaseBackend().getFirestore();
      db.collection("Users").doc(uid)
      .get().then((document) => {  
          this.userData = {
            displayName :   document.data().displayName,
            business_unit : document.data().business_unit,
            email :         document.data().email,
            phoneNumber :   document.data().phoneNumber,
            groups : document.data().groups, 
          }
      });
    }, 
    submitForm() {
      this.submitform = true;
      this.$v.$touch();
      if (!this.$v.$invalid) {
        getFirebaseBackend().updateProfile({
          displayName   : (this.userData.displayName === undefined ?    "" : this.userData.displayName),
          business_unit : (this.userData.business_unit === undefined ?  "" : this.userData.business_unit),
          phoneNumber   : (this.userData.phoneNumber === undefined ?    "" : this.userData.phoneNumber),
          groups        : (this.userData.groups === undefined ?         "" : this.userData.groups),
        }).then(() => {
        }).catch((error) => {
          console.log("Error : Unable to updathe User information.",error)
        });
      }
    },
  },
};
</script>

<template>
  <Layout>
    <form class="needs-validation" @submit.prevent="submitForm">
      <div class="row">
        <div class="col-lg-12">
          <div class="card">
            <div class="card-body">
              <h4 class="card-title font-size-16">Information utilisateur</h4>
              <!--<p class="card-title-desc">----</p> -->
                <div class="row">
                  <form_entry type='text'     label="Nom utilisateur"    v-model="userData.displayName"    size="6"  :check="$v.userData.firstname   "   tooltip="Champs obligatoire" :submitform="submitform"/>
                  <form_entry type='datalist' label="Business Unit"      v-model="userData.business_unit"  size="6"  :check="$v.userData.business_unit"  tooltip="Champs obligatoire" :submitform="submitform"  :list="bu_datalist"/>
                  <form_entry type='label'     label="E-mail"            v-model="userData.email    "      size="6"  :check="$v.userData.email       "   tooltip="Champs obligatoire" :submitform="submitform" /> 
                  <form_entry type='text'     label="Téléphone"          v-model="userData.phoneNumber"    size="6"  :check="$v.userData.phoneNumber   " tooltip="Champs obligatoire" :submitform="submitform"/>
                  </div>
            </div>
          </div>           
        </div>
        <!-- end col -->
        <div class="col-lg-12">
          <div class="card">
            <div class="card-body">
              <h4 class="card-title font-size-16">Droits</h4>
              <!--<p class="card-title-desc">----</p> -->
                <div class="row">
                    <treeselect v-model="userData.groups" :multiple="true" :options="options" :append-to-body="true" :show-count="true"/>     
                </div>
            </div>
          </div>           
        </div>
        <!-- end col -->
      </div>
      <!-- end row -->
      <p align="right">
        <button type="submit" class="pill btn btn-success btn-rounded mb-2 me-2 ">Enregister</button>
      </p>
    </form>
  </Layout>
</template>

<style>
.pill {
  border-radius: 30px;
  color: #fff;
  background-color: #34c38f;
  border-color: #34c38f;
}
</style>