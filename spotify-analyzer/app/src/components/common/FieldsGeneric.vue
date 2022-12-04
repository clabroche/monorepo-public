<template>
  <div class="fields-container" v-if="!initialFold" key="unfold">
    <div v-for="(field, name) of schemaComputed" :key="name" class="field-container">
      <template v-if="!field.as || field.as === 'input'">
        <div :class="{ icon: field.icon }" class="input-container" style="display: flex; align-items: center"
          :style="field.style">
          <i v-if="field.icon" :class="field.icon"></i>
          <input v-model="field.binding" v-bind="field" :name="name"
            @input="field?.input ? field.input($event.target.value) : ''">
        </div>
        <div v-if="field.errorMessage" class="error-message">{{ field.errorMessage }}</div>
        <label>{{ field.label }}</label>
      </template>

      <template v-if="field.as === 'upload'">
        <div :class="{ icon: field.icon }" class="input-container" style="display: flex; align-items: center"
          :style="field.style">
          <i v-if="field.icon" :class="field.icon"></i>
          <input type="file" v-bind="field" :name="name" @input="setUploadField($event, field)">
        </div>
        <div class="preview" v-if="field.initialValue">
          <button v-if="field.initialValue" @click="deleteUploadField(field)">
            <i class="delete fas fa-times"></i>
          </button>
          <img :src="field.initialValue" alt="">
        </div>
        <div v-if="field.errorMessage" class="error-message">{{ field.errorMessage }}</div>
        <label>{{ field.label }}</label>
      </template>

      <template v-else-if="field.as === 'select'">
        <select v-model="field.binding" v-bind="field" :name="name">
          <template v-if="field.children?.length || field.children?.value?.length">
            <component v-for="({ tag, text, ...childAttrs }, idx) in field.children?.value || field.children" :key="idx"
              :is="tag" v-bind="childAttrs">
              {{ text }}
            </component>
          </template>
        </select>
        <div v-if="field.errorMessage" class="error-message">{{ field.errorMessage }}</div>
        <label>{{ field.label }}</label>
      </template>

      <template v-else-if="field.as === 'multiselect'">
        <multiselect :options="field.children" v-bind="field" v-model:value="field.binding" />
        <div v-if="field.errorMessage" class="error-message">{{ field.errorMessage }}</div>
        <label>{{ field.label }}</label>
      </template>

      <template v-else-if="field.as === 'group'">
        <h4>{{ field.label }}</h4>
        <div class="foreach-line">
          <i class="group-icon" :class="field.icon" aria-hidden="true" v-if="field.icon" @click="field.fold = true"></i>
          <div class="foreach-line-form">
            <fields-generic class="" :base-name="name" :onSubmit="onSubmit" :fold="field.fold"
              :schema="field.getSchema(unref(field.initialValue))" @update:value="field.binding = $event; onSubmit()" />
          </div>
        </div>
      </template>

      <template v-else-if="field.as === 'foreach'">
        <h4>{{ field.label }}</h4>
        <div v-for="(line, index) of unref(field.initialValue)" :key="'line-' + index">
          <div class="foreach-line">
            <i class="group-icon" :class="field.icon" aria-hidden="true" v-if="field.icon"
              @click="field.fold = true"></i>
            <div class="foreach-line-form">
              <fields-generic :base-name="`${name}[${index}]`" :onSubmit="onSubmit" :fold="field.fold"
                :schema="field.getSchema(unref(line), index)" @update:value="field.initialValue = $event; onSubmit()" />
              <div class="delete-container">
                <button class="delete" @click="remove($event, field, index)">
                  <i class="fas fa-trash" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <button class="add" @click="add($event, field)"
          v-if="unref(field.initialValue).filter(a => a).length < (field.max || Infinity)">
          <i class="fas fa-plus" aria-hidden="true"></i>
        </button>
      </template>

    </div>
  </div>
  <div v-else class="fold" @click="initialFold = false" key="fold">
    <!-- <div>{{Object.keys(schema).length}} champs ({{Object.keys(schema).map(a => schema[a].label).slice(0, 3).join(', ') + '...'}})</div> -->
    <template v-for="(field, key) of schema" :key="'preview-' + key">
      <div class="description" v-if="!field.hide">
        <span class="key">{{ field.label }}:</span>
        <span class="value" v-if="unref(field.initialValue) == null">
          Inconnu
        </span>
        <span class="value" v-else-if="unref(field.initialValue) === true">
          Oui
        </span>
        <span class="value" v-else-if="unref(field.initialValue) === false">
          Non
        </span>
        <span class="value" v-else-if="field.type === 'date'">
          {{ dayjs(unref(field.initialValue)).format('DD/MM/YYYY') }}
        </span>
        <span class="value" v-else-if="field.as === 'select' && field.children">
          {{ field.children.find((child => child?.value === unref(field.initialValue)))?.text || 'Inconnu' }}
        </span>
        <span class="value" v-else>
          {{ unref(field.initialValue) }}
        </span>
      </div>
    </template>
    <!-- <div class="description">{{Object.keys(schema).map(a => unref(schema[a].initialValue)).filter(a=>a).slice(0, 3).join(', ') + '...'}}</div> -->
    <div class="unfold">
      <i class="fas fa-chevron-down" aria-hidden="true"></i>
      Déplier pour éditer...
    </div>
  </div>
</template>

<script>
import Multiselect from './Multiselect.vue'
import { unref, onMounted, ref, watch, getCurrentInstance } from 'vue'
import { useField, } from 'vee-validate'
import { cloneDeep } from 'lodash-es'
import dayjs from 'dayjs'
export default {
  components: { Multiselect },
  name: "FieldsGeneric",
  props: {
    baseName: { default: '' },
    schema: { default: null },
    value: { default: null },
    onSubmit: { default: null },
    fold: { default: false },
    values: { default: null },
    setFieldValue: { default: null }
  },
  setup(props) {
    let schemaComputed = ref()
    const initialFold = ref(props.fold)
    const instance = getCurrentInstance().proxy
    onMounted(() => {
      const schema = {}
      for (const key in props.schema) {
        const computeKey = [props.baseName, key].filter(a => a).join('.')
        const conf = cloneDeep(props.schema[key])
        const isHidden = conf?.hide?.value != null
          ? conf?.hide?.value
          : conf?.hide
        if (isHidden) continue
        if (conf) {
          const { value, errorMessage } = useField(computeKey, conf.validation);
          watch(() => errorMessage, () => {
            if (errorMessage.value) {
              initialFold.value = false
            }
          }, { deep: true })
          value.value = conf.as === 'foreach'
            ? cloneDeep(unref(conf?.initialValue))
            : cloneDeep(unref(conf?.initialValue))
          conf.binding = ref(value)
          conf.name = computeKey
          conf.errorMessage = errorMessage
          schema[computeKey] = conf
        } else {
          console.warn(key, 'not found')
        }
      }
      schemaComputed.value = schema
    })
    function getBase64(file) {
      const reader = new FileReader();
      if (!file) return ''
      reader.readAsDataURL(file);
      return new Promise((res, rej) => {
        reader.onload = function () {
          res(reader.result);
        };
        reader.onerror = function (error) {
          rej(error)
        };
      })
    }
    const fieldRefs = ref([])
    return {
      dayjs,
      unref,
      initialFold,
      schemaComputed,
      fieldRefs,
      add($event, field) {
        $event.stopPropagation()
        $event.preventDefault()
        field.initialValue.push('')
        if (!field.binding) field.binding = []
        field.binding.push()
        if (field.input) field.input(field.binding)
        instance.$forceUpdate()
      },
      remove($event, field, index) {
        $event.stopPropagation()
        $event.preventDefault()
        field.initialValue.splice(index, 1)
        if (!field.binding) field.binding = []
        field.binding.splice(index, 1)
        if (field.input) field.input(field.binding)
        instance.$forceUpdate()
      },
      async setUploadField($event, field) {
        const b64 = await getBase64($event.target.files[0])
        if (field.input) field.input(b64)
        field.initialValue = b64
      },
      async deleteUploadField(field) {
        if (field.input) field.input('')
        field.initialValue = ''
      },
    }
  }
}
</script>

<style lang="scss" scoped>
.fields-container {
  display: flex;
  flex-direction: column;

  .foreach-line {
    display: flex;
    align-items: center;
    margin-bottom: 15px;

    .group-icon {
      color: white;
      background-color: var(--primary-color);
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .foreach-line-form {
      margin-left: 20px;
      position: relative;
      box-sizing: border-box;
      border-left: 2px solid var(--primary-color);
      flex-grow: 1;
      border-radius: 5px;
      overflow: hidden;

      .fields-container,
      .fold {
        padding-left: 20px;
      }
    }

    .description {
      font-size: 0.9em;
      color: #aaa;
      margin-bottom: 5px;

      .value {
        font-weight: bold;
        width: 140px;
        display: block;
        color: #888;
      }
    }

    .form {
      padding: 0 20px;

    }

    .fold {
      cursor: pointer;
      transition: 300ms;
      padding: 10px 0;

      &+.delete-container {
        position: absolute;
        bottom: 0;
        right: 0;
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }

      .unfold {
        display: flex;
        align-items: center;
        color: var(--primary-color);
        margin-top: 10px;
        font-size: 0.8em;
        font-weight: bold;

        i {
          margin-right: 10px;
        }
      }
    }
  }

  .field-container {
    display: flex;
    flex-direction: column;
    margin-bottom: 25px;

    h4 {
      margin-bottom: 10px;
    }

    label {
      margin-top: 8px;
      font-size: 0.9em;
      color: #757575;
    }

    .error-message {
      color: rgb(243, 71, 71);
      font-size: 0.7em;
      font-weight: bold;
      margin-top: 5px;
    }
  }
}

.delete-container {
  display: flex;
  justify-content: flex-end;

  .delete {
    width: 30px;
    height: 30px;
    font-size: 0.8em;
    padding: 0;
  }
}

.add {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: white;
  color: white;
  padding: 5px;
}

.preview {
  height: 100px;
  margin-top: 5px;
  display: flex;

  button {
    flex: 0;
  }

  img {
    max-width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: left;
    border-radius: 10px;
  }
}
input[type="checkbox"] {
  width: max-content;
}
</style>