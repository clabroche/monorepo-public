<template>
  <div class="form-root">
    <form @submit="onSubmit" ref="refForm">
      <fields-generic :schema="schema" :onSubmit="onSubmit" :values="values" :setFieldValue="setFieldValue"/>
      <div class="actions" v-if="submitShow || cancelShow">
        <button type="submit" :disabled="(!Object.keys(values).length) || (Object.keys(errors).length)" v-if="submitShow">{{ submitText }}</button>
        <button class="delete" v-if="cancelShow" @click="cancel">{{ cancelText }}</button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useForm } from 'vee-validate';
import FieldsGeneric from './FieldsGeneric.vue';
import { cloneDeep } from 'lodash-es';
export default {
  components: {
    FieldsGeneric
  },
  name: "FormGeneric",
  props: {
    submitText: {default: 'Enregistrer', type: String},
    cancelText: {default: 'Annuler', type: String},
    cancelShow: {default: false, type: Boolean},
    schema: { default: ()=>({})},
    line: { default: false },
    submitShow: {default: true},
    fold: {default: false},
    baseName: {default: ''},
    index: {default: null}
  },
  setup(props, component) {
    const { handleSubmit, values, setFieldValue,errors } = useForm();
    const refForm = ref(null)
    const onSubmit = handleSubmit(values => {
      castResult(values, refForm.value)
      cleanValues(values)
      component.emit('submit', cloneDeep(values))
    });
    const cleanValues = (values) => {
      Object.keys(values).forEach((key) => { 
        if(values[key] === undefined) {
          values[key] = null
        }
      });
      return values
    }
    const castResult = (object, evtForm) => {
      [
        ...evtForm.querySelectorAll(`select`),
        ...evtForm.querySelectorAll(`input`)
      ]
        .forEach(element => {
          const isCastNumber = [element.type, element.getAttribute('cast')].includes('number')
          if(!isCastNumber) return
          const keys = element.name.split('.')
          let obj = object
          while(keys.length) {
            const key = keys.shift()
            if(!keys.length && isCastNumber) {
              obj[key] = +obj[key]
            }
            obj = obj[key]
          }
        });
    }
    return {
      values,
      setFieldValue,
      refForm,
      errors,
      initialFold: ref(props.fold),
      cancel(ev) {
        ev.stopPropagation()
        ev.preventDefault()
        component.emit('cancel')
      },
      async submit(object, evtForm) {
        let form = {}
        castResult(object, evtForm)
        if((await form.value.validate()).valid) {
          component.emit('submit', object)
        }
      },
      onSubmit,
    }
  }
}
</script>

<style lang="scss" scoped>
.form-root {

  .actions {
    display: flex;
    gap: 10px;
  }
}
</style>