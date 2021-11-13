<template>
    <div>
        <div v-show="!editing" @dblclick="setEditing()">
            <label> {{item}} </label>
        </div>
        <div v-focus="editing" v-show="editing" >
            <a  id="inline-username"    
                data-type="text" 
                data-pk="1" 
                data-title="Enter username" 
                class="editable editable-click editable-open" 
                style="display: none;">
            </a>
            <span class="editable-container editable-inline" style="">
                <div>
                    <form class="form-inline editableform" style="">
                        <div class="control-group form-group">
                            <div id="container">
                                <div id="inputLeft">
                                    <div class="editable-input">
                                        <input type="text" v-model="val" class="form-control form-control-sm" style="padding-right: 24px;">
                                    </div>
                                </div>
                                <div id="buttonsRight">
                                    <div class="editable-buttons">
                                        <button type="button" class="btn btn-success btn-xs" @click="update()">
                                            <i class="mdi mdi-check"></i>
                                        </button>
                                        <button type="button" class="btn btn-danger btn-xs" @click="cancelEditing()">
                                            <i class="mdi mdi-close"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </span>
        </div>
    </div>
</template>

<style scoped>
label {
    width: 100%;
    border: 1px solid grey
    

    /* otherwise empty cell click event does not fire */
}
div {
    height: 100%;
    border: 1px solid transparent;
}
#container {
  height: 100%;
  width: 100%;
  display: flex;
}
#inputLeft {
  width: 100%;
}
#buttonsRight {
  width: 6em;
}
.btn {
    border-radius: 0.20rem;
    margin: 3px;
    font-size: 0.5rem;
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
            console.log("setEditing");
            this.val = this.item;
            this.editing = true;
        },
        update(){
            console.log("update");
            this.editing = false;
            this.$emit('updated', this.val);
        },
        cancelEditing(){
            console.log("cancelEditing");
            this.val = this.item;
            this.editing = false;
        },
    }
    
    
}
</script>