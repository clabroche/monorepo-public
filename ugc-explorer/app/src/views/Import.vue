<template>
  <div>
    <input type="file" multiple @change="onchange">
  </div>
</template>

<script setup>
import { apis } from '@clabroche-org/ugc-explorer-models'

const onchange = (ev) => {
  var formData = new FormData();
  ;[...ev.target.files].forEach(file => {
    console.log(file)
    formData.append(file.name, file);
  });
  apis.coreAPI.instance.post('/api/histories/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
</script>

<style lang="scss" scoped>

</style>