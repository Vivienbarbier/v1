<template>
    <div :class="'col-md-'+size">
      <div class='mb-3 position-relative'>
        <label class="font-size-13">{{label + (check != undefined ? '*':'')}}</label>
        <template v-if="type == 'label'"> 
            <input v-model="item" type="text" class="form-control" :disabled="true"/>
        </template>
        <template v-else-if="type == 'datalist'"> 
            <select v-model="val" class="form-control" :class="{'is-invalid': submitform && check!= null && check.$error}" @change="update()">
                <option value="" disabled selected>{{label}}</option>
                <template v-for="(value, propertyName, index) in list">
                    <option :key="index" :value="propertyName">{{value}}</option>
                </template>
            </select>
            <template v-if="check != undefined">
                <div v-if="submitform && check.$error" class="invalid-tooltip">
                    <span v-if="!check.required" >{{tooltip}}</span>
                </div>
            </template>
        </template> <!-- Enf of If datalist -->
        <template v-else>
            <template v-if="check != undefined">
                <input v-model="val" :type="(type == 'currency' ? 'text' : type)" class="form-control" :placeholder="label" :class="{'is-invalid': submitform && check.$error}" @change="update()"/>
                <div v-if="submitform && check.$error" class="invalid-tooltip">
                    <span v-if="!check.required" >{{tooltip}}</span>
                </div>
            </template>   
            <template v-else>
                <input v-model="val" :type="type" class="form-control" :placeholder="placeholder" @change="update()"/>
            </template>
        </template>
      </div>
    </div>
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
    props: ['label', 'type', 'size','item', 'submitform', 'check','placeholder', 'tooltip','list','disabled'],
    model: {
        prop: 'item',
        event: 'updated'
    },
    watch: { 
        item: function(newVal) { // watch it
            this.val = newVal;   
        }
    },
    methods: {
        update(){
            if(this.type === "currency"){
                this.$emit('updated',  this.val.replace('€','').replaceAll(/\s/g,'').replace(",","."));

            }else {
                this.$emit('updated', this.val);
            }

        },
        updated(){
          
        }
    },
     created(){
        if(this.type === "currency" && this.val !== null){
            this.val = Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(this.item);
        }else{
            this.val = this.item;   
        }     
     }
}
</script>