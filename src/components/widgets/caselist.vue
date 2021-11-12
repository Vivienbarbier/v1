<script>
import Loader from "./loader";

/**
 * caselist component
 */
export default {
  components: {
    Loader,
  },
  props: {
    filter: {
      type: String,
      default: function () {
        return null;
      },
    },
    headers: {
      type: Array,
      default: function () {
        return null;
      },
    },
    caselist: {
      type: Array,
      default: function () {
        return [];
      },
    },
    updating: {
      type: Boolean,
    },
  },
  watch : {
    filter : function() { // watch it
        this.updateTable();
    }
  },
  data() {
    return {
      table : [],
      currentSort:'name',
      currentSortDir:'asc',
      showModal: false,
    };
  },
  mounted(){
     this.table = this.caselist;
  },
  methods: {
    updateTable(){
      if (this.filter === null || this.filter === ""){
        this.table = this.caselist;
      }else{
        this.table = [];
        const filter =  this.filter.toLowerCase();
        for (const i in this.caselist) {
          const c = this.caselist[i];
          for( const h in this.headers) {
            const head = this.headers[h]
            if (head.filtrable){
              if (c[head.name] !== null){
                if(typeof c[head.name] === "string"){
                  if (c[head.name].toLowerCase().includes(filter)){
                    this.table.push(c);
                    break;
                  }
                }else if(typeof c[head.name] === "number"){
                  if (c[head.name].toString().includes(filter)){
                    this.table.push(c);
                    break;
                  }
                }             
              }
            }
          }
        }
      }
    },
    sort(s) {
      if(s === this.currentSort) {
        this.currentSortDir = this.currentSortDir==='asc'?'desc':'asc';
      }
      this.currentSort = s;
      this.table.sort((a,b) => {
        let modifier = 1;
        if(this.currentSortDir === 'desc') modifier = -1;
        if(a[this.currentSort] < b[this.currentSort]) return -1 * modifier;
        if(a[this.currentSort] > b[this.currentSort]) return 1 * modifier;
        return 0;
      });
    }
  }
};
</script>

<template>
  <Loader :loading="updating">
    <div class="table-responsive mb-0">
      <table class="table align-middle table-nowrap">
        <thead class="table-light">          
          <tr>
            <th style="width: 30px">
              <div class="form-check font-size-16 align-middle">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="transactionCheck01"
                />
              </div>
            </th>
            <template v-for="head in headers" >
              <th @click="sort(head.name)" :key="head.name" :style="head.style">
                {{head.label}}
                <span style="float:right;">
                  <i :class="[((currentSort == head.name) ? (currentSortDir == 'asc' ? 'fa-arrow-up' : 'fa-arrow-down') : ''), 'fa']">
                  </i>
                </span>
              </th>
            </template>            
            <!--<th v-for="head in headers" :key="head.name" :class="head.class">{{head.label}}</th> -->
            <!--<th @click="sort('work_order_number')" class="width:100px">N° Cmd<span style="float:right;"><i :class="[((this.currentSort == 'work_order_number') ? (this.currentSortDir == 'asc' ? 'fa-arrow-up' : 'fa-arrow-down') : ''), 'fa']"></i></span></th>
            <th @click="sort('owner')" >Resp.<span style="float:right;"><i :class="[((this.currentSort == 'owner') ? (this.currentSortDir == 'asc' ? 'fa-arrow-up' : 'fa-arrow-down') : ''), 'fa']"></i></span></th>
            <th @click="sort('client')">Client<span style="float:right;"><i :class="[((this.currentSort == 'client') ? (this.currentSortDir == 'asc' ? 'fa-arrow-up' : 'fa-arrow-down') : ''), 'fa']"></i></span></th>
            <th @click="sort('name')"  style="width:400px">Nom du chantier<span style="float:right;"><i :class="[((this.currentSort == 'name') ? (this.currentSortDir == 'asc' ? 'fa-arrow-up' : 'fa-arrow-down') : ''), 'fa']"></i></span></th>
            <th @click="sort('revenu')">Chiffre d'affaires<span style="float:right;"><i :class="[((this.currentSort == 'revenu') ? (this.currentSortDir == 'asc' ? 'fa-arrow-up' : 'fa-arrow-down') : ''), 'fa']"></i></span></th>
            <th @click="sort('start_date')" align="center">Début<span style="float:right;"><i :class="[((this.currentSort == 'start_date') ? (this.currentSortDir == 'asc' ? 'fa-arrow-up' : 'fa-arrow-down') : ''), 'fa']"></i></span></th>
            <th @click="sort('progress')">Avancement<span style="float:right;"><i :class="[((this.currentSort == 'progress') ? (this.currentSortDir == 'asc' ? 'fa-arrow-up' : 'fa-arrow-down') : ''), 'fa']"></i></span></th>
            <th @click="sort('status')">Status<span style="float:right;"><i :class="[((this.currentSort == 'status') ? (this.currentSortDir == 'asc' ? 'fa-arrow-up' : 'fa-arrow-down') : ''), 'fa']"></i></span></th>
            <th></th> 
            -->
          </tr>
        </thead>
        <tbody>
          <tr v-for="data in table" :key="data.index">
            <template v-if="data.progress=1">
            <td>
              <div class="form-check font-size-16">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="`transactionCheck${data.index}`"
                />
                <label
                  class="form-check-label"
                  :for="`transactionCheck${data.index}`"
                ></label>
              </div>
            </td>
            <td>{{ data.work_order_number }}</td>
            <td>{{ data.owner }}</td>
            <td>{{ data.client }}</td>
            <td>{{ data.name }}</td>
            <td align="right">{{ Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(data.revenu) }}</td>
            <td align="center">{{ data.start_date }}</td>
            <td>{{ data.progress }}</td>
            <td class>
              <span class=" badge badge-pill badge-done"
              :class="{
                  'badge-progress': `${data.status}` === 'En cours',
                  'badge-waiting': `${data.status}` === 'A preparer',
                }"
              >{{ data.status }}</span
              >
            </td> 
            <td>
              <router-link :to="{ name: 'case-detail', params: { bu:'OCPL', caseId: data.id }}">
                <i class="mdi mdi-dots-horizontal font-size-18"></i>           
              </router-link>
            </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- end table -->
  </Loader>
</template>

<style scoped>
.badge-done {
  width: 80px;
  color: #34c38f;
  background-color: rgba(52, 195, 143, 0.18); }
  .badge-done:hover, .badge-done:focus {
  color: #ffffff;
  background-color: rgba(52, 195, 143, 1); }
  
  .badge-progress {
  color: #0084f7;
  background-color: rgba(80, 165, 241, 0.18); }
  .badge-progress:hover, .badge-progress:focus {
    color: #ffffff;
    background-color: rgb(0, 132, 248,0.80); }

.badge-waiting {
  color: rgb(128, 128, 128);
  background-color: rgba(241, 180, 76, 0.4); }
  .badge-waiting:hover, .badge-waiting:focus {
    color: #ffffff;
    text-decoration: none;
    background-color: rgba(241, 180, 76, 0.4); }

.badge-soft-success {
  color: #34c38f;
  background-color: rgba(52, 195, 143, 0.18); }
  .badge-soft-success[href]:hover, .badge-soft-success[href]:focus {
    color: #ffffff;
    text-decoration: none;
    background-color: rgba(52, 195, 143, 0.4); }



table {
  width: 100%;
  table-layout: fixed;
}
th {
   overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
td {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

</style>