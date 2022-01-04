<template>
    <div>
        <div v-show="!editing">            
            {{ item }}%
               <span style="float:right;">
                <i class="mdi mdi-pencil" @click="setEditing()"></i>
                </span>
        </div>
        <div v-focus="editing" v-show="editing" >
            <a  id="inline-username"    
                data-type="text" 
                data-pk="1" 
                data-title="Enter username" 
                class="editable editable-click editable-open" 
                style="display: none;">
            </a>         
            <div>
                <div class="hstack"  >
                    <div style="">
                        <input type="text" v-model="val" class="form-control form-control-sm" style="padding-right: 24px;" v-on:keyup.enter="update()" v-on:keyup.esc="cancelEditing()">
                    </div>
                    <button type="button" class="btn btn-success btn-xs " @click="update()">
                        <i class="mdi mdi-check"></i>
                    </button>
                    <button type="button" class="btn btn-dark btn-xs" @click="cancelEditing()">
                        <i class="mdi mdi-close"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
label {
    width: 100%;
    font-weight: 600;
    color: #495057

    /* otherwise empty cell click event does not fire */
}
div {
    width: 100%;
    height: 100%;
    border: 1px solid transparent;
}
#container {
  height: 100%;
  width: 100%;
  display: flex;
}
.btn {
    border-radius: 1rem;
    margin: 1px;
    font-size: 0.5rem;
    opacity: 0.8;
}
</style>

<script>
import {
    focus
} from 'vue-focus';
export default {
    data: () => ({
        val: '',
        editing: false
    }),
    props: ['item'],
    model: {
        prop: 'item',
        event: 'updated'
    },
    directives: {
        focus: focus
    },
    methods: {
        setEditing() {
            this.val =this.item + "%"
            this.editing = true;
        },
        update(){
            this.editing = false;
            var value = parseInt(this.val.replace('%','').replaceAll(/\s/g,'').replace(",","."));
            value = (value > 100) ? 100 : ((value <0 ) ? 0 : value);
            this.$emit('updated', value); 
        },
        cancelEditing(){
            this.val = this.item;
            this.editing = false;
        },
    }
    
    
}
</script>