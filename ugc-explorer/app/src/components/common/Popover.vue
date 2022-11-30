<template>
  <div class="popover-root">
    <div ref="refTrigger" class="trigger">
      <slot name="trigger" ></slot>
    </div>
    <div ref="refContent" class="content" :style="{maxHeight, overflow: maxHeight !== 'auto' ? 'auto' : 'inherit'}">
      <slot name="content"/>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import tippy, {animateFill} from 'tippy.js'
import 'tippy.js/dist/tippy.css'; // optional for styling
import 'tippy.js/themes/light-border.css';
import 'tippy.js/dist/backdrop.css';
import 'tippy.js/animations/shift-away.css';
export default {
  props: {
    maxHeight: {default: 'auto'},
    trigger: { default: 'click' },
    placement: { default: 'bottom' },
  },
  setup(props) {
    const refTrigger = ref(null)
    const refContent = ref(null)
    const tippyInstance = ref()
    onMounted(() => {
      tippyInstance.value = tippy(refTrigger.value, {
        placement: props.placement,
        interactive: true,
        content: refContent.value,
        trigger: props.trigger,
        hideOnClick: true,
        allowHTML: true,
        animateFill: true,
        theme: 'light-border',
        plugins: [animateFill],
        appendTo: document.body
      })
    })
    return {
      refTrigger,
      refContent,
      tippy
    }
  }
}
</script>

<style>
.popover-root {
  height: 100%;
  width: 100%;
}
.trigger {
  height: 100%;
  width: 100%;
  z-index: -1;
}
</style>