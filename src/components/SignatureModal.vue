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
                <Calendar v-model="dateValue" initial-focus />
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
        <p class="text-muted-foreground mb-2 text-[10px] font-semibold uppercase">
          Pré-visualização do Selo:
        </p>
        <div class="border-primary rounded-r-md border-l-4 bg-white p-3 shadow-sm">
          <p
            class="text-primary mb-1 border-b pb-1 text-[10px] font-bold tracking-tighter uppercase"
          >
            Assinado Digitalmente
          </p>
          <p class="text-[11px] leading-tight font-bold text-slate-900">
            {{ form.nome || 'Nome Completo' }}
          </p>
          <div class="mt-1 flex justify-between text-[9px] text-slate-500 italic">
            <span>{{ form.data }}</span>
            <span>{{ form.cidadeEstado }}</span>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" @click="handleConfirm">Gerar Assinatura</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
