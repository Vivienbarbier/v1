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
      if (this.currentSort === "start_date"){
      
        this.table.sort((a,b) => {
          let modifier = 1;
          if(this.currentSortDir === 'desc') modifier = -1;        
          if (a[this.currentSort] === null || a[this.currentSort] ==="-" ) return -1 * modifier;
          if (b[this.currentSort] === null || b[this.currentSort] ==="-" ) return 1 * modifier;

          var dateAParts = a[this.currentSort].split("/");
          var dateBParts = b[this.currentSort].split("/");
          if (dateAParts[2] === undefined ) return -1 * modifier;
          if (dateBParts[2] === undefined ) return 1 * modifier;

          // month is 0-based, that's why we need dataParts[1] - 1       
          var dateAObject = new Date(+dateAParts[2], dateAParts[1] - 1, +dateAParts[0]); 
          var dateBObject = new Date(+dateBParts[2], dateBParts[1] - 1, +dateBParts[0]); 
          if(dateAObject < dateBObject) return -1 * modifier;
          if(dateAObject > dateBObject) return 1 * modifier;
          return 0;
        });        
      }else if (typeof this.table[0][this.currentSort] === "string"){
        this.table.sort((a,b) => {
          let modifier = 1;
          if(this.currentSortDir === 'desc') modifier = -1;
          return (a[this.currentSort].localeCompare(b[this.currentSort]) * modifier);
        });
      }else{
        this.table.sort((a,b) => {
          let modifier = 1;
          if(this.currentSortDir === 'desc') modifier = -1;
          if(a[this.currentSort] < b[this.currentSort]) return -1 * modifier;
          if(a[this.currentSort] > b[this.currentSort]) return 1 * modifier;
          return 0;
        });
      }
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
            <template v-for="head in headers" >
              <template v-if="head.sortable">
                <th @click="sort(head.name)" :key="head.name" :style="head.style">
                  {{head.label}}
                  <span style="float:right;">
                    <i :class="[((currentSort == head.name) ? (currentSortDir == 'asc' ? 'fa-arrow-up' : 'fa-arrow-down') : ''), 'fa']">
                    </i>
                  </span>
                </th>
              </template>  
              <template v-else>
               <th :key="head.name" :style="head.style"></th>
              </template>
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
            <td>{{ data.work_order_number }}</td>
            <td>{{ data.owner }}</td>
            <td>{{ data.client }}</td>
            <td>{{ data.name }}</td>
            <td align="right">{{ Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(data.revenu) }}</td>
            <td align="center">{{ data.start_date }}</td>
            <td align="center">{{ (data.progress*100) }}%</td>
            <td align="center">
              <span class=" badge badge-pill badge-done" 
              :class="{
                  'badge-qualify':      `${data.status}` === 'qualify',
                  'badge-planify':      `${data.status}` === 'planify',
                  'badge-prepare':      `${data.status}` === 'prepare',
                  'badge-execute':      `${data.status}` === 'execute',
                  'badge-wip':          `${data.status}` === 'wip',
                  'badge-closing':      `${data.status}` === 'closing',
                  'badge-closed':       `${data.status}` === 'closed',

                }"
              >{{ $t("casestatus."+data.status) }}</span
              >
            </td> 
            <td align="center">
              <router-link :to="{ name: 'case-detail', params: { bu:data.business_unit, caseId: data.id }}">
                <i class="mdi mdi-dots-horizontal font-size-18"></i>           
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- end table -->
  </Loader>
</template>

<style scoped>
.badge-qualify {
  width: 80px;
  color: #5f6462;
  background-color: rgba(196, 35, 35, 0.18); }
  .badge-qualify:hover, .badge-qualify:focus {
  color: #ffffff;
  background-color: rgba(196, 35, 35, 1); }
  
.badge-planify {
  width: 80px;
  color: #5f6462;
  background-color: rgba(48, 70, 192, 0.18); }
  .badge-planify:hover, .badge-planify:focus {
  color: #ffffff;
  background-color:  rgba(48, 70, 192, 1); }

.badge-prepare {
  width: 80px;
  color: #5f6462;
  background-color: rgba(197, 181, 38, 0.18); }
  .badge-prepare:hover, .badge-prepare:focus {
  color: #ffffff;
  background-color: rgba(52, 195, 143, 1); }


.badge-execute {
  width: 80px;
  color: #5f6462;
  background-color: rgba(74, 52, 195, 0.18); }
  .badge-execute:hover, .badge-execute:focus {
  color: #ffffff;
  background-color: rgba(74, 52, 195, 1); }

.badge-wip {
  width: 80px;
  color: #5f6462;
  background-color: rgba(109, 221, 5, 0.50); }
  .badge-wip:hover, .badge-wip:focus {
  color: #ffffff;
  background-color: rgba(109, 221, 5, 1); }

.badge-closing {
  width: 80px;
  color: #5f6462;
  background-color: rgba(157, 195, 52, 0.18); }
  .badge-closing:hover, .badge-closing:focus {
  color: #ffffff;
  background-color: rgba(157, 195, 52, 1); }

.badge-closed {
  width: 80px;
  color: #5f6462;
  background-color: rgba(57, 58, 57, 0.18); }
  .badge-closed:hover, .badge-closed:focus {
  color: #ffffff;
  background-color: rgba(57, 58, 57, 1); }





table {
  width: 100%;
  table-layout: fixed;
}
th {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background-color: rgb(228, 228, 228); 
}
td {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

}
tr:nth-child(even) {background-color: #f2f2f2;}
</style>