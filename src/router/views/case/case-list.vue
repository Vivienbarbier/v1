<script>
import Loader from "@/components/widgets/loader"

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
          var modifier = 1;
         
          if(this.currentSortDir === 'desc') modifier = -1;        
          if (a[this.currentSort] === null || a[this.currentSort] ==="-" ) return -1 * modifier;
          if (b[this.currentSort] === null || b[this.currentSort] ==="-" ) return 1 * modifier;

          //var dateAParts = a[this.currentSort].split("-");
          //var dateBParts = b[this.currentSort].split("-");
          //if (dateAParts[2] === undefined ) return -1 * modifier;
          //if (dateBParts[2] === undefined ) return 1 * modifier;
          //// month is 0-based, that's why we need dataParts[1] - 1       
          //var dateAObject = new Date(+dateAParts[2], dateAParts[1] - 1, +dateAParts[0]); 
          //var dateBObject = new Date(+dateBParts[2], dateBParts[1] - 1, +dateBParts[0]); 
          var dateAObject = new Date(a[this.currentSort]);
          var dateBObject = new Date(b[this.currentSort]);

          if(dateAObject < dateBObject) return -1 * modifier;
          if(dateAObject > dateBObject) return 1 * modifier;
          return 0;
        });        
      }else if (typeof this.table[0][this.currentSort] === "string"){
        this.table.sort((a,b) => {
          var modifier = 1;
          if(this.currentSortDir === 'desc') modifier = -1;
          if(a[this.currentSort] === null ) a[this.currentSort]="";
          return (a[this.currentSort].localeCompare(b[this.currentSort]) * modifier);
        });
      }else{
        this.table.sort((a,b) => {
          var modifier = 1;
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
                <th @click="sort(head.name)" :key="head.name" :style="head.style" class="font-size-14">
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
          </tr>
        </thead>
        <tbody>
          <tr v-for="data in table" :key="data.index">
            <td class="font-size-14 font-weight-bold" aligne="center">
              <router-link :to="{ name: 'case-detail', params: { bu: data.business_unit, caseId: data.id }}" class="color-black">
              {{data.work_order_number}}
              </router-link>
            </td>
            <td class="font-size-14" aligne="center">{{ data.type }}</td>
            <td class="font-size-14" aligne="center">{{ data.owner }}</td>
            <td class="font-size-14" aligne="center">{{ data.client }}</td>
            <td class="font-size-14" aligne="center">{{ data.name }}</td>
            <td class="font-size-14" align="right"  >{{ Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(data.revenu) }}</td>
            <td class="font-size-14" align="center" >{{ data.start_date }}</td>
            <td class="font-size-14" align="center" >{{ (data.progress) }}%</td>
            <td class="font-size-14" align="center" >
              <span class="badge badge-pill badge-done" 
              :class="{
                  'pill badge-qualify':      `${data.status}` === 'qualify',
                  'pill badge-planify':      `${data.status}` === 'planify',
                  'pill badge-prepare':      `${data.status}` === 'prepare',
                  'pill badge-execute':      `${data.status}` === 'execute',
                  'pill badge-wip':          `${data.status}` === 'wip',
                  'pill badge-closing':      `${data.status}` === 'closing',
                  'pill badge-closed':       `${data.status}` === 'closed',
                }"
              >{{ $t("casestatus."+data.status) }}</span
              >
            </td> 
            <td align="center">
              <router-link :to="{ name: 'case-detail', params: { bu: data.business_unit, caseId: data.id }}">
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
.pill {
  border-radius: 30px;
}

.color-black{
  color: #000000;
}

.font-weight-bold{
  font-weight: bold;
}
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
  font-weight: bold;
  background-color: #eff2f7; 
}
td {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

}
tr:nth-child(even) {background-color: #f2f2f2;}
</style>