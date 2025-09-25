<template>
  <div id="app">
    <div class="container-fluid p-0">
      <nav class="navbar navbar-dark bg-primary mb-0">
        <div class="container-fluid">
          <span class="navbar-brand mb-0 h1">Vue Spreadsheet Component</span>
          <div class="d-flex gap-2">
            <button
              class="btn btn-light btn-sm"
              :disabled="!canUndo"
              title="Undo (Ctrl+Z)"
              @click="handleUndo"
            >
              ↶ Undo
            </button>
            <button
              class="btn btn-light btn-sm"
              :disabled="!canRedo"
              title="Redo (Ctrl+Y)"
              @click="handleRedo"
            >
              ↷ Redo
            </button>
            <div class="vr"></div>
            <button class="btn btn-light btn-sm" @click="exportCSV">Export CSV</button>
            <label class="btn btn-light btn-sm mb-0">
              Import CSV
              <input type="file" accept=".csv" style="display: none" @change="importCSV" />
            </label>
          </div>
        </div>
      </nav>
      <SpreadsheetGrid ref="spreadsheetRef" />
      <div v-if="showDemo" class="demo-overlay">
        <div class="demo-card">
          <h5>Welcome to Vue Spreadsheet Component!</h5>
          <p>Key Features:</p>
          <ul class="text-start">
            <li><strong>Navigation:</strong> Arrow keys, Tab, Home, End, PageUp/Down</li>
            <li><strong>Editing:</strong> Double-click, Enter, F2, or start typing</li>
            <li><strong>Copy/Paste:</strong> Ctrl+C/V for cell ranges</li>
            <li><strong>Undo/Redo:</strong> Ctrl+Z/Y to undo/redo changes</li>
            <li><strong>Auto-expand:</strong> Drag selection beyond grid to add rows/columns</li>
            <li><strong>Formulas:</strong> =A1+B1, =SUM(A1:A10), basic arithmetic</li>
            <li><strong>Resize:</strong> Drag column borders to resize</li>
            <li><strong>CSV:</strong> Import/Export via toolbar buttons</li>
          </ul>
          <button class="btn btn-primary me-2" @click="loadDemoData">Load Demo Data</button>
          <button class="btn btn-secondary" @click="showDemo = false">Start Fresh</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import SpreadsheetGrid from './components/SpreadsheetGrid.vue'
import { CsvService } from './services/CsvService'
import { GridCell } from './types/grid'

const spreadsheetRef = ref<InstanceType<typeof SpreadsheetGrid>>()
const showDemo = ref(true)
const canUndo = ref(false)
const canRedo = ref(false)

// Watch for changes in undo/redo state
watchEffect(() => {
  if (spreadsheetRef.value) {
    canUndo.value = spreadsheetRef.value.canUndo || false
    canRedo.value = spreadsheetRef.value.canRedo || false
  }
})

function exportCSV() {
  if (!spreadsheetRef.value) return
  const data = spreadsheetRef.value.exportData()
  CsvService.downloadCSV(data, 'spreadsheet.csv')
}

function importCSV(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !spreadsheetRef.value) return

  const reader = new FileReader()
  reader.onload = e => {
    const text = e.target?.result as string
    const data = CsvService.parse(text)
    spreadsheetRef.value!.importData(data)
  }
  reader.readAsText(file)
  ;(event.target as HTMLInputElement).value = ''
}

function loadDemoData() {
  if (!spreadsheetRef.value) return

  const demoData: GridCell[][] = [
    [
      { value: 'Product', display: 'Product' },
      { value: 'Q1', display: 'Q1' },
      { value: 'Q2', display: 'Q2' },
      { value: 'Q3', display: 'Q3' },
      { value: 'Q4', display: 'Q4' },
      { value: 'Total', display: 'Total' }
    ],
    [
      { value: 'Laptops', display: 'Laptops' },
      { value: 1200, display: '1200' },
      { value: 1350, display: '1350' },
      { value: 1450, display: '1450' },
      { value: 1600, display: '1600' },
      { value: '=B2+C2+D2+E2', formula: '=B2+C2+D2+E2', display: '5600' }
    ],
    [
      { value: 'Tablets', display: 'Tablets' },
      { value: 800, display: '800' },
      { value: 850, display: '850' },
      { value: 900, display: '900' },
      { value: 950, display: '950' },
      { value: '=B3+C3+D3+E3', formula: '=B3+C3+D3+E3', display: '3500' }
    ],
    [
      { value: 'Phones', display: 'Phones' },
      { value: 2000, display: '2000' },
      { value: 2200, display: '2200' },
      { value: 2100, display: '2100' },
      { value: 2300, display: '2300' },
      { value: '=B4+C4+D4+E4', formula: '=B4+C4+D4+E4', display: '8600' }
    ],
    [
      { value: 'Accessories', display: 'Accessories' },
      { value: 500, display: '500' },
      { value: 550, display: '550' },
      { value: 600, display: '600' },
      { value: 650, display: '650' },
      { value: '=B5+C5+D5+E5', formula: '=B5+C5+D5+E5', display: '2300' }
    ],
    [
      { value: '', display: '' },
      { value: '', display: '' },
      { value: '', display: '' },
      { value: '', display: '' },
      { value: '', display: '' },
      { value: '', display: '' }
    ],
    [
      { value: 'Total', display: 'Total' },
      { value: '=B2+B3+B4+B5', formula: '=B2+B3+B4+B5', display: '4500' },
      { value: '=C2+C3+C4+C5', formula: '=C2+C3+C4+C5', display: '4950' },
      { value: '=D2+D3+D4+D5', formula: '=D2+D3+D4+D5', display: '5050' },
      { value: '=E2+E3+E4+E5', formula: '=E2+E3+E4+E5', display: '5500' },
      { value: '=F2+F3+F4+F5', formula: '=F2+F3+F4+F5', display: '20000' }
    ]
  ]

  spreadsheetRef.value.importData(demoData)
  showDemo.value = false
}

function handleUndo() {
  if (!spreadsheetRef.value) return
  spreadsheetRef.value.performUndo()
}

function handleRedo() {
  if (!spreadsheetRef.value) return
  spreadsheetRef.value.performRedo()
}
</script>

<style>
#app {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.container-fluid {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.navbar {
  flex-shrink: 0;
}

.demo-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.demo-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.demo-card h5 {
  margin-bottom: 1rem;
  color: #0d6efd;
}

.demo-card ul {
  margin-bottom: 1.5rem;
}

.demo-card li {
  margin-bottom: 0.5rem;
}
</style>
