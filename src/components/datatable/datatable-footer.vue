<template>
  <tfoot v-show="dataDisplayed.length > 0">
    <td>Total</td>
    <td></td>
    <td></td> 
    <td>{{ totalAge }}</td> 
    <td></td> 
    <td></td> 
  </tfoot>  
</template>
<script>
export default {
  name: "TableFooter",
  computed: {
    totalAge() {
      let s = 0;
      for (let f of this.dataDisplayed)
        s += f.age;
      return s;
    }, 
    totalSalary() {
      let s = 0;
      for (let f of this.dataDisplayed)
        s += f.salary;
      return s;
    }
  },
  props: {
    data: Array,
    dataDisplayed: Array,
    dataFiltered: Array,
  }
}
</script>