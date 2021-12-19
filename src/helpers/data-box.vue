<script>
import editable from '@/helpers/editable';


export default {
    components: {editable},
    data: () => ({
        val : ''
    }),
    props: ['label','item'],
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
    mounted: function () {
        this.val = this.item
    }
}
</script>


<template>
    <div class="col-md-6 hstack gap-1 databox">
        <label style="width : 20em" class="root">{{this.label}}</Label>
        <!--<editable class="form-control me-auto" :item="this.item" @updated="update()"></editable> -->
        <editable class="form-control me-auto" v-model="val" @updated="update()"></editable>
    </div>
</template>

<style>
</style>

