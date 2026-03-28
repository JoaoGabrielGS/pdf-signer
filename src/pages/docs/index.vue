<script setup lang="ts">
import ThemeToggle from '../../components/ThemeToggle.vue'
import PdfSigner from '@/components/PdfSigner.vue'
</script>

<template>
  <main class="bg-primary min-h-screen px-4 py-12">
    <ThemeToggle />
    <div class="mx-auto max-w-6xl">
      <header class="mb-10 text-center">
        <span
          class="text-primary bg-primary/10 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase"
        >
          Ambiente de Homologação
        </span>
        <h1 class="mt-4 text-4xl font-extrabold tracking-tight text-slate-900">
          Assinatura de Documentos
        </h1>
        <p class="mt-2 text-slate-600">
          Teste o fluxo completo: Upload -> Preenchimento -> Posicionamento.
        </p>
      </header>

      <section class="rounded-2xl border bg-white p-2 shadow-sm md:p-8">
        <PdfSigner />
      </section>
    </div>
  </main>
</template>
