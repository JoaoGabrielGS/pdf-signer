<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { PenTool, ChevronDownIcon } from 'lucide-vue-next'

import { getLocalTimeZone, today, type DateValue } from '@internationalized/date'

export interface SignatureData {
  nome: string
  data: string
  cidadeEstado: string
}

const props = defineProps({
  nome: {
    type: String,
    default: '',
  },
  data: {
    type: String,
    default: new Date().toLocaleDateString('pt-BR'),
  },
  cidadeEstado: {
    type: String,
    default: 'Cidade, UF',
  },
})

const emit = defineEmits<{
  (name: 'confirm', data: SignatureData): void
}>()

const open = ref(false)

const dateValue = ref(today(getLocalTimeZone())) as Ref<DateValue>

const form = reactive<SignatureData>({
  nome: props.nome,
  data: props.data,
  cidadeEstado: props.cidadeEstado,
})

watch(dateValue, (newValue) => {
  if (newValue) {
    const nativeDate = newValue.toDate(getLocalTimeZone())
    form.data = nativeDate.toLocaleDateString('pt-BR')
  }
})
const handleConfirm = () => {
  if (form.nome && form.data && form.cidadeEstado) {
    emit('confirm', { ...form })
    open.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button variant="default" class="gap-2"> <PenTool :size="16" /> Criar Assinatura </Button>
    </DialogTrigger>

    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Dados da Assinatura</DialogTitle>
      </DialogHeader>

      <div class="grid gap-6 py-4">
        <div class="space-y-2">
          <Label for="name">Nome do Assinante</Label>
          <Input id="name" v-model="form.nome" placeholder="Ex: Gabriel Silva" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <Label for="date">Data da Assinatura</Label>
            <Popover>
              <PopoverTrigger as-child>
                <Button
                  id="date"
                  variant="outline"
                  class="w-full justify-between text-left font-normal"
                >
                  {{ form.data }}
                  <ChevronDownIcon class="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0" align="start">
                <Calendar v-model="dateValue" locale="pt-BR" initial-focus />
              </PopoverContent>
            </Popover>
          </div>

          <div class="space-y-2">
            <Label for="location">Cidade/UF</Label>
            <Input id="location" v-model="form.cidadeEstado" />
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-dashed bg-slate-50/50 p-4">
        <p class="text-muted-foreground mb-3 text-[10px] font-semibold tracking-wider uppercase">
          Pré-visualização do Selo:
        </p>

        <div
          class="flex items-center gap-3 rounded-lg border-2 border-double border-slate-200 bg-white p-3 shadow-sm"
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

          <div class="flex-1 space-y-0.5">
            <div class="flex items-center justify-between border-b border-slate-100 pb-1">
              <span class="text-[9px] font-bold tracking-widest text-blue-600 uppercase"
                >Autenticado</span
              >
              <div class="h-1.5 w-1.5 rounded-full bg-green-500 shadow-sm"></div>
            </div>

            <p class="truncate text-[12px] leading-tight font-bold text-slate-900">
              {{ form.nome || 'Nome Completo' }}
            </p>

            <div class="flex flex-col text-[9px] leading-tight font-medium text-slate-500">
              <span>Data: {{ form.data }}</span>
              <span class="truncate">{{ form.cidadeEstado }}</span>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" class="w-full" @click="handleConfirm">Gerar Assinatura</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
