<script>
import editable_string from '@/helpers/editable-string';
import editable_currency from '@/helpers/editable-currency';
import editable_date from '@/helpers/editable-date';
import editable_percentage from '@/helpers/editable-percentage';
import editable_datalist from '@/helpers/editable-datalist';


export default {
    components: {editable_string,editable_currency,editable_date, editable_percentage,editable_datalist},
    data: () => ({
        val : ''
    }),
    props: ['label','item','type','datalist'],
    model: {
        prop: 'item',
        event: 'updated'
    },
    methods: {
        update(){
           this.editing = false;
           this.$emit('updated', this.val);
        },
    },
    created: function () {
        this.val = this.item
        if (this.type==="Date"){
            console.log("Display date here : ", this.item, this.val)
        }
    }
}
</script>


<template>
    <div class="col-md-6 hstack gap-1 databox">
        <label style="width : 20em" class="root">{{this.label}}</Label>
        <editable_string        v-if="type ==='String'"                         class="form-control me-auto"  v-model="val" @updated="update()"></editable_string>
        <editable_currency      v-else-if="type ==='Currency'"                  class="form-control me-auto"  v-model="val" @updated="update()"></editable_currency>
        <editable_date          v-else-if="type ==='Date'"                      class="form-control me-auto"  v-model="val" @updated="update()"></editable_date>
        <editable_percentage    v-else-if="type ==='Percent'"                   class="form-control me-auto"  v-model="val" @updated="update()"></editable_percentage>
        <editable_datalist      v-else-if="type ==='Datalist'"  :list="datalist" class="form-control me-auto" v-model="val" @updated="update()"></editable_datalist>
    </div>
</template>

<style>
</style>

