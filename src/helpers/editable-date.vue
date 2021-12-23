<template>
    <b-form-input id="date" v-model="val" type="date" class="no-border" @change="update()"></b-form-input>
</template>

<style scoped>
.no-border{
    border: 0px;
}
</style>

<script>
export default {
    data: () => ({
        val:  null,
    }),
    props: ['item'],
    model: {
        prop: 'item',
        event: 'updated'
    },
    methods: {
        update(){
            this.$emit('updated', this.val);
        },
    },
     created(){
         this.val = this.item;
     }
}
</script>