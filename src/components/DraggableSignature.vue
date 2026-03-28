<script setup lang="ts">
import { ref } from 'vue'
import { useDraggable, useElementBounding } from '@vueuse/core'

interface Props {
  nome: string
  data: string
  cidadeEstado: string
}

const props = defineProps<Props>()
const el = ref<HTMLElement | null>(null)
const container = computed(() => el.value?.parentElement)
const { width: parentWidth, height: parentHeight } = useElementBounding(container)
const { width: elWidth, height: elHeight } = useElementBounding(el)

const { x, y, style } = useDraggable(el, {
  initialValue: { x: 50, y: 50 },
  preventDefault: true,
  exact: true,

  onMove(position) {
    if (!parentWidth.value || !parentHeight.value) return

    const maxX = parentWidth.value - elWidth.value
    const maxY = parentHeight.value - elHeight.value

    position.x = Math.max(0, Math.min(position.x, maxX))
    position.y = Math.max(0, Math.min(position.y, maxY))
  },
})

defineExpose({
  x,
  y,
})
</script>

<template>
  <div
    ref="el"
    :style="style"
    class="border-primary absolute z-50 min-w-[200px] cursor-grab rounded-r-md border-l-4 bg-white/95 p-3 shadow-2xl backdrop-blur-sm select-none active:cursor-grabbing"
  >
    <div class="pointer-events-none space-y-1.5">
      <div class="mb-1 flex items-center justify-between border-b border-slate-100 pb-1">
        <span class="text-primary text-[8px] font-bold tracking-wider uppercase"
          >Assinado Digitalmente</span
        >
        <div class="h-2 w-2 animate-pulse rounded-full bg-green-500 shadow-inner"></div>
      </div>

      <p class="truncate text-[12px] leading-tight font-bold text-slate-900">
        {{ props.nome || 'Nome Completo' }}
      </p>

      <div class="flex flex-col text-[9px] leading-tight font-medium text-slate-500">
        <span>Data: {{ props.data }}</span>
        <span>Local: {{ props.cidadeEstado }}</span>
      </div>
    </div>

    <div class="bg-primary absolute -right-1.5 -bottom-1.5 rounded-full p-1 text-white shadow-md">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="5 9 2 12 5 15" />
        <polyline points="9 5 12 2 15 5" />
        <polyline points="15 19 12 22 9 19" />
        <polyline points="19 9 22 12 19 15" />
      </svg>
    </div>
  </div>
</template>
