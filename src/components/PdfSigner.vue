<script setup lang="ts">
import { ref } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FileUp, AlertCircle } from 'lucide-vue-next'
import SignatureModal, { type SignatureData } from '@/components/SignatureModal.vue'
import DraggableSignature from '@/components/DraggableSignature.vue'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

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

const canvasRef = ref<HTMLCanvasElement | null>(null)
const isLoaded = ref<boolean>(false)
const error = ref<string | null>(null)
const fileName = ref<string>('')
const activeSignature = ref<SignatureData | null>(null)
const signatureRef = ref<any>(null)
const originalArrayBuffer = ref<ArrayBuffer | null>(null)

const loadPdf = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  error.value = null
  isLoaded.value = false
  fileName.value = file.name

  try {
    const arrayBuffer = await file.arrayBuffer()
    originalArrayBuffer.value = arrayBuffer
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer.slice(0),
    })
    const pdf = await loadingTask.promise
    const page = await pdf.getPage(1)

    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = canvasRef.value

    if (canvas) {
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Contexto 2D não encontrado')

      canvas.height = viewport.height
      canvas.width = viewport.width

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      }

      await page.render(renderContext).promise
      isLoaded.value = true
    }
  } catch (err) {
    console.error(err)
    error.value = 'Não foi possível renderizar o PDF. Tente outro arquivo.'
  }
}

const handleConfirmSignature = (data: SignatureData) => {
  console.log('Dados recebidos do modal:', data)
  activeSignature.value = data
}

const gerarPdfAssinado = async () => {
  if (
    !activeSignature.value ||
    !canvasRef.value ||
    !signatureRef.value ||
    !originalArrayBuffer.value
  ) {
    console.error('Faltam dados para gerar o PDF')
    return
  }

  try {
    const pdfDoc = await PDFDocument.load(originalArrayBuffer.value)
    const pages = pdfDoc.getPages()
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()

    const xPdf = (parseFloat(signatureRef.value.x) / canvasRef.value.width) * width

    const yPdf = height - (parseFloat(signatureRef.value.y) / canvasRef.value.height) * height - 60

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

    firstPage.drawRectangle({
      x: xPdf,
      y: yPdf,
      width: 180,
      height: 55,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.1, 0.4, 0.8),
      borderWidth: 1,
    })

    firstPage.drawText('ASSINADO DIGITALMENTE', {
      x: xPdf + 10,
      y: yPdf + 40,
      size: 7,
      font: fontBold,
      color: rgb(0.1, 0.4, 0.8),
    })

    firstPage.drawText(activeSignature.value.nome, {
      x: xPdf + 10,
      y: yPdf + 25,
      size: 10,
      font: fontBold,
    })

    const info = `${activeSignature.value.data} | ${activeSignature.value.cidadeEstado}`
    firstPage.drawText(info, {
      x: xPdf + 10,
      y: yPdf + 10,
      size: 7,
      font: fontItalic,
      color: rgb(0.4, 0.4, 0.4),
    })

    const pdfBytes = await pdfDoc.save()
    const cleanBytes = new Uint8Array(pdfBytes)
    const blob = new Blob([cleanBytes], { type: 'application/pdf' })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `assinado_${fileName.value}`
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 100)
  } catch (err) {
    console.error('Erro ao gerar PDF:', err)
  }
}
</script>

<template>
  <div class="flex min-h-[600px] flex-col items-center justify-center space-y-8 p-6">
    <div v-if="!isLoaded" class="w-full max-w-xl">
      <div
        class="bg-card hover:bg-accent/50 relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all"
      >
        <Input
          type="file"
          accept="application/pdf"
          @change="loadPdf"
          class="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
        />
        <div class="flex flex-col items-center gap-4 text-center">
          <div class="bg-primary/10 text-primary rounded-full p-4">
            <FileUp :size="32" />
          </div>
          <div>
            <h3 class="text-lg font-semibold">Importar Documento</h3>
            <p class="text-muted-foreground text-sm leading-relaxed">
              Arraste o PDF aqui ou clique para selecionar.<br />
              O documento será processado localmente no seu navegador.
            </p>
          </div>
          <Button variant="secondary" class="pointer-events-none mt-2">Selecionar Arquivo</Button>
        </div>
      </div>
    </div>

    <Alert v-if="error" variant="destructive" class="max-w-xl">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Erro no Processamento</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <div v-show="isLoaded" class="flex flex-col items-center gap-6">
      <div class="relative overflow-hidden rounded-md border bg-white shadow-2xl">
        <canvas ref="canvasRef"></canvas>

        <div class="absolute inset-0 z-10">
          <DraggableSignature v-if="activeSignature" ref="signatureRef" v-bind="activeSignature" />
        </div>
      </div>

      <div class="mt-6 flex gap-4">
        <SignatureModal
          @confirm="handleConfirmSignature"
          :nome="nome"
          :data="data"
          :cidadeEstado="cidadeEstado"
        />

        <Button
          v-if="activeSignature"
          variant="default"
          class="bg-green-600 hover:bg-green-700"
          @click="gerarPdfAssinado"
        >
          Finalizar e Gerar JSON
        </Button>

        <Button v-if="activeSignature" variant="outline" @click="activeSignature = null">
          Remover
        </Button>
      </div>
    </div>
  </div>
</template>
