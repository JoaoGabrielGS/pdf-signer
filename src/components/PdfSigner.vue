<script setup lang="ts">
import { ref, markRaw } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FileUp, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-vue-next'
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

const pdfInstance = ref<any>(null)
const currentPage = ref(1)
const totalPages = ref(0)

const renderPage = async (pageNumber: number) => {
  const doc = pdfInstance.value
  if (!doc || !canvasRef.value) return

  isLoaded.value = false
  try {
    const page = await doc.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = canvasRef.value
    const context = canvas.getContext('2d')

    if (context) {
      canvas.height = viewport.height
      canvas.width = viewport.width
      await page.render({ canvasContext: context, viewport }).promise
      isLoaded.value = true
    }
  } catch (err) {
    console.error('Erro ao renderizar página:', err)
    error.value = 'Erro ao carregar a página selecionada.'
  }
}

const loadPdf = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  error.value = null
  isLoaded.value = false
  fileName.value = file.name
  currentPage.value = 1

  try {
    const arrayBuffer = await file.arrayBuffer()
    originalArrayBuffer.value = arrayBuffer

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) })
    const pdf = await loadingTask.promise
    pdfInstance.value = markRaw(pdf)
    totalPages.value = pdf.numPages

    await renderPage(currentPage.value)
  } catch (err) {
    console.error(err)
    error.value = 'Não foi possível renderizar o PDF. Tente outro arquivo.'
  }
}

const changePage = (offset: number) => {
  const newPage = currentPage.value + offset
  if (newPage >= 1 && newPage <= totalPages.value) {
    currentPage.value = newPage
    renderPage(newPage)
  }
}

const handleConfirmSignature = (data: SignatureData) => {
  activeSignature.value = data
}

const gerarPdfAssinado = async () => {
  if (
    !activeSignature.value ||
    !canvasRef.value ||
    !signatureRef.value ||
    !originalArrayBuffer.value
  ) {
    return
  }

  try {
    const pdfDoc = await PDFDocument.load(originalArrayBuffer.value)
    const pages = pdfDoc.getPages()
    const targetPage = pages[currentPage.value - 1]
    const { width, height } = targetPage.getSize()

    const xScale = width / canvasRef.value.width
    const yScale = height / canvasRef.value.height

    const xPdf = parseFloat(signatureRef.value.x) * xScale

    const seloHeightPdf = 65
    const yPdf = height - parseFloat(signatureRef.value.y) * yScale - seloHeightPdf

    const colorWhite = rgb(1, 1, 1)
    const colorPrimary = rgb(0.15, 0.4, 0.85)
    const colorGreen = rgb(0.13, 0.77, 0.36)
    const colorBorder = rgb(0.85, 0.88, 0.92)
    const colorTextMain = rgb(0.1, 0.1, 0.1)
    const colorTextSub = rgb(0.4, 0.4, 0.5)

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

    const seloWidth = 200
    const padding = 12

    targetPage.drawRectangle({
      x: xPdf + 1,
      y: yPdf - 1,
      width: seloWidth,
      height: seloHeightPdf,
      color: rgb(0.95, 0.95, 0.95),
    })

    targetPage.drawRectangle({
      x: xPdf,
      y: yPdf,
      width: seloWidth,
      height: seloHeightPdf,
      color: colorWhite,
      borderColor: colorBorder,
      borderWidth: 1,
    })

    targetPage.drawRectangle({
      x: xPdf + 3,
      y: yPdf + 3,
      width: seloWidth - 6,
      height: seloHeightPdf - 6,
      borderColor: colorBorder,
      borderWidth: 0.5,
    })

    targetPage.drawText('AUTENTICADO', {
      x: xPdf + padding,
      y: yPdf + seloHeightPdf - padding - 5,
      size: 7,
      font: fontBold,
      color: colorPrimary,
    })

    targetPage.drawCircle({
      x: xPdf + seloWidth - padding - 4,
      y: yPdf + seloHeightPdf - padding - 2,
      size: 4,
      color: colorGreen,
    })

    targetPage.drawLine({
      start: { x: xPdf + padding, y: yPdf + seloHeightPdf - 22 },
      end: { x: xPdf + seloWidth - padding, y: yPdf + seloHeightPdf - 22 },
      thickness: 0.5,
      color: colorBorder,
    })

    targetPage.drawText(activeSignature.value.nome.toUpperCase(), {
      x: xPdf + padding,
      y: yPdf + 25,
      size: 10,
      font: fontBold,
      color: colorTextMain,
    })

    const infoText = `Data: ${activeSignature.value.data}`
    targetPage.drawText(infoText, {
      x: xPdf + padding,
      y: yPdf + padding,
      size: 7,
      font: fontRegular,
      color: colorTextSub,
    })

    targetPage.drawText(activeSignature.value.cidadeEstado, {
      x: xPdf + padding + 75,
      y: yPdf + padding,
      size: 7,
      font: fontItalic,
      color: colorTextSub,
    })

    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
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
    <div v-if="!isLoaded && !pdfInstance" class="w-full max-w-xl">
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
          <div class="bg-primary/10 text-primary rounded-full p-4"><FileUp :size="32" /></div>
          <div>
            <h3 class="text-lg font-semibold">Importar Documento</h3>
            <p class="text-muted-foreground text-sm">O documento será processado localmente.</p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="totalPages > 1 && isLoaded"
      class="flex items-center gap-4 rounded-full border bg-slate-50 px-4 py-2 shadow-sm"
    >
      <Button size="icon" :disabled="currentPage === 1" @click="changePage(-1)">
        <ChevronLeft class="h-4 w-4" />
      </Button>
      <span class="min-w-[100px] text-center text-sm font-bold">
        Página {{ currentPage }} de {{ totalPages }}
      </span>
      <Button size="icon" :disabled="currentPage === totalPages" @click="changePage(1)">
        <ChevronRight class="h-4 w-4" />
      </Button>
    </div>

    <Alert v-if="error" variant="destructive" class="max-w-xl">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Erro</AlertTitle>
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
          Finalizar e Baixar PDF
        </Button>
        <Button v-if="activeSignature" variant="outline" @click="activeSignature = null"
          >Remover</Button
        >
      </div>
    </div>
  </div>
</template>
