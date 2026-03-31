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

const { x, y, style, isDragging } = useDraggable(el, {
  initialValue: { x: 50, y: 50 },
  preventDefault: true,
  exact: true,
  containerElement: container,

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
  elWidth,
  elHeight,
})
</script>

<template>
  <div
    ref="el"
    :style="style"
    class="absolute z-50 flex min-w-[220px] items-center gap-3 rounded-lg border-2 border-double border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-sm transition-transform duration-200 select-none"
    :class="isDragging ? 'scale-105 cursor-grabbing opacity-90' : 'cursor-grab'"
  >
    <div
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-inner"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    </div>

    <div class="pointer-events-none flex-1 space-y-0.5">
      <div class="flex items-center justify-between border-b border-slate-100 pb-1">
        <span class="text-[9px] font-bold tracking-widest text-blue-600 uppercase"
          >Autenticado</span
        >
        <div class="h-1.5 w-1.5 rounded-full bg-green-500 shadow-sm"></div>
      </div>

      <p class="truncate text-[12px] leading-tight font-bold text-slate-900">
        {{ props.nome || 'Assinante' }}
      </p>

      <div class="flex flex-col text-[9px] leading-tight font-medium text-slate-500">
        <span>Data: {{ props.data }}</span>
        <span class="truncate">{{ props.cidadeEstado }}</span>
      </div>
    </div>
  </div>
</template>
