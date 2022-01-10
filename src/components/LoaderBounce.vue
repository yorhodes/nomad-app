<template>
  <div class="flex flex-row justify-end items-center translate-y-3">
    <div class="shape shape1"></div>
    <div class="shape shape2"></div>
    <div class="shape shape3"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
</script>

<style scoped lang="stylus">
@keyframes bounce {
  40% {
    transform translateY(-3px)
  } 70% {
    transform translateY(0)
  }
}

.shape
  animation gravity 1s infinite
  width 5px
  height 5px
  background-color white
  border-radius 50%
  margin 0 3px

.shape1
  animation bounce 1s infinite
.shape2
  animation bounce 1s infinite 0.2s
.shape3
  animation bounce 1s infinite 0.4s

</style>
