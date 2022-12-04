<template>
  <div class="root" @click.stop :style="{ width }">
    <div ref="input" class="input" @click.stop="open()">
      <div v-if="!value.length && !isOpen" class="placeholder">
        {{ placeholder }}
      </div>
      <div v-if="!value.length && isOpen" class="placeholder">
        Choisir une entrée ci-dessous...
      </div>
      <spinner class="spinner" :size="20" v-if="opening"></spinner>
      <div
        v-for="itemValue in value"
        :key="getKey(itemValue)"
        class="item-container"
      >
        <div class="label">
          {{ getLabel(itemValue) }}
        </div>
        <div class="delete" @click.stop="deleteTag(itemValue)">
          <em class="fas fa-trash"></em>
        </div>
      </div>
    </div>
    <transition name="fade">
      <div class="container" v-if="isOpen">
        <input
          type="text"
          ref="filterRef"
          placeholder="Rechercher..."
          @input="filter()"
        />
        <div
          class="categories"
          v-if="categories && option.values && option.values.length"
        >
          <div
            @click="changeCategory(option)"
            class="category"
            :class="{
              active:
                option.name === currentCateg.name && option.name !== undefined,
            }"
            v-for="option of options"
            :key="option.name"
          >
            {{ option.name }}
          </div>
        </div>
        <div class="options-container">
          <div
            v-for="option in filteredOptions"
            :key="getKey(option)"
            class="item"
            :id="'multiselect-item-' + getLabel(option)"
            @click="select(option)"
          >
            <span>{{ getLabel(option) }}</span>
            <span v-if="option.additionnal">{{ option.additionnal }}</span>
          </div>
        </div>
        <div class="count" v-if="filteredOptions && filteredOptions.length">
          {{ filteredOptions.length }} entrée
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { some,cloneDeep } from "lodash-es";
import Spinner from "./Spinner.vue";
import { ref, onMounted, nextTick, watch, getCurrentInstance} from 'vue';

export default {
  name: "multiselect",
  $_veeValidate: {
    // fetch the current value from the innerValue defined in the component data.
    value () {
      return this.value;
    },
    name () {
      return this.name;
    }
  },
  props: {
    options: { default: () => [] },
    value: { default: () => [] },
    customLabel: { default: null },
    customKey: { default: null },
    width: { default: "auto" },
    single: { default: false },
    categories: { default: false },
    name: { default: 'name' },
    placeholder: { default: "Cliquez pour choisir..." },
    max: { default: Infinity }
  },
  components: {
    spinner: Spinner,
  },
  setup(props, comp) {
    const instance = getCurrentInstance().proxy;
    const isOpen = ref(false)
    const filteredOptions = ref([])
    const currentCateg = ref(null)
    const count = ref(0)
    const opening = ref(false)
    const filterRef = ref(null)
    const localValue = ref(props.value)
    watch(() => cloneDeep(props.value), () => localValue.value = props.value, { deep: true })
    watch(() => cloneDeep(localValue), () => comp.emit('update:value', localValue.value), { deep: true })

    const getLabel = (option) => {
      return currentCateg.value && currentCateg.value.customLabel
        ? option[currentCateg.value.customLabel]
        : option[props.customLabel] || option
    }
    const getKey = (option) => {
      return currentCateg.value?.customKey
        ? option[currentCateg.value.customKey]
        : option[props.customKey] ||  option
    }
    const filter =  () => {
      const value = filterRef.value?.value
        ? filterRef.value.value.toUpperCase()
        : ''
      let options = props.options
      if (props.categories && currentCateg.value) {
        options = props.options
          .filter((opt) => opt.name === currentCateg.value.name)
          .pop().values
      }
      filteredOptions.value = options.filter((option) => {
        // @ts-ignore
        if (some(props.value, option) || props.value.includes(option)) {
          return false
        }
        const label = getLabel(option)
        const key = getKey(option)
        return (
          (label && typeof label === 'string' && label.toUpperCase().includes(value)) ||
          (key && typeof key === 'string' && key.toUpperCase().includes(value))
        )
      })
    }
    onMounted(() => {
      filteredOptions.value = props.options
      if (props.categories) {
        currentCateg.value = props.options[0]
      }
      filter()
    })
    return {
      isOpen,
      filteredOptions,
      currentCateg,
      count,
      opening,
      filterRef,

      getKey,
      getLabel,
      filter,
      changeCategory(category) {
        currentCateg.value = category
        filter()
      },
      async open() {
        opening.value = true
        await nextTick()
        isOpen.value = true
        filter()
        await nextTick()
        await nextTick()
        if (filterRef.value) {
          filterRef.value.focus()
        }
        const cb = () => {
          isOpen.value = false
          document.removeEventListener("click", cb)
        }
        document.addEventListener("click", cb)
        opening.value = false
      },
      select(value) {
        if(localValue.value.length >= props.max) return
        const index = filteredOptions.value.indexOf(value)
        filteredOptions.value.splice(index, 1)
        if (props.single) {
          localValue.value.pop()
          isOpen.value = false
        }
        localValue.value.push(value)
        filter()
        instance.$forceUpdate()
      },
      deleteTag(value) {
        const index = props.value.indexOf(value)
        localValue.value.splice(index, 1)
        filteredOptions.value.push(value)
        filter()
        instance.$forceUpdate()
      },
    };
  },
};
</script>

<style scoped lang="scss" >
.input {
  background-color: #fff;
  width: auto;
  cursor: pointer;
  min-height: 30px;
  border: 1px solid lightgrey;
  padding-right: 5px;
  padding-left: 5px;
  padding-top: 5px;
  padding-bottom: 5px;
  position: relative;
  border-radius: 15px;
  .spinner {
    position: absolute;
    top: -10px;
    right: -10px;
    height: 100%;
  }

  .placeholder {
    color: #a1a1a1;
    padding-top: 4px;
  }

  .item-container {
    border: 1px solid lightgrey;
    display: inline-block;
    border-radius: 15px;
    overflow: hidden;
    background-color: var(--primary-color);
    max-width: 100%;
    padding: 5px;
    box-sizing: border-box;
    position: relative;
    opacity: 1;
    transition: 200ms;
    transition-property: opacity, transform;

    & > div {
      color: white;
      // height 1.2em
      padding: 5px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      opacity: 1;
    }

    .delete {
      transition: 200ms;
      transition-property: opacity;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      opacity: 0;
    }

    &:hover {
      transform: scale(1.05);

      .delete {
        background-color: rgba(0, 0, 0, 0.3);
        opacity: 1;
      }

      & > div {
        opacity: 0;
      }
    }
  }
}

.container {
  width: 100%;
  position: absolute;
  z-index: 1;
  max-height: 300px;
  opacity: 1;
  overflow: hidden;
  box-sizing: border-box;
  background-color: #fff;
  border: 1px solid lightgrey;
  border-top: none;
  display: flex;
  flex-direction: column;

  input {
    width: auto;
    margin: 10px;
    margin-bottom: 10px;
  }

  .categories {
    display: flex;
    align-items: flex-end;
    padding-left: 10px;
    border-bottom: 1px solid #c8c8c8;
    flex-shrink: 0;

    & > div {
      padding-left: 10px;
      padding-right: 10px;
      padding-top: 2px;
      padding-bottom: 2px;
      bottom: -1px;
      position: relative;
      font-size: 0.9em;
      cursor: pointer;
      color: #777;

      &:hover {
        color: black;
      }

      &.active {
        border-top: 1px solid #c8c8c8;
        border-left: 1px solid #c8c8c8;
        border-right: 1px solid #c8c8c8;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        background-color: white;
        color: black;
      }
    }
  }

  .item {
    cursor: pointer;
    padding: 7px;
    padding-left: 10px;
    padding-right: 10px;
    font-size: 0.9em;
    display: flex;
    justify-content: space-between;

    &:hover,
    &.selected {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }

  .options-container {
    overflow-y: auto;
    overflow-x: hidden;
    background-color: #fff;
  }
}

.count {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
  border-top: 1px solid #c8c8c8;
  color: #717171;
  padding-right: 5px;
  font-size: 0.7em;
}

.root {
  position: relative;
}

.fade-enter-active,
.fade-leave-active {
  transition: max-height 0.2s, opacity 0.2s;
}

.fade-enter,
.fade-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>