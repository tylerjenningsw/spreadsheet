<template>
  <input
    ref="inputRef"
    type="text"
    class="cell-editor"
    :value="modelValue"
    @input="handleInput"
    @keydown="handleKeydown"
    @blur="handleBlur"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { NavigationDirection } from '../types/navigation'

interface Props {
  value: string
}

interface Emits {
  (e: 'update', value: string): void
  (e: 'cancel'): void
  (e: 'navigate', direction: NavigationDirection): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const modelValue = ref(props.value)
const inputRef = ref<HTMLInputElement>()

onMounted(() => {
  inputRef.value?.focus()
  inputRef.value?.select()
})

function handleInput(event: Event) {
  modelValue.value = (event.target as HTMLInputElement).value
}

function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'Enter':
      if (!event.shiftKey) {
        event.preventDefault()
        emit('update', modelValue.value)
        emit('navigate', 'down')
      } else {
        event.preventDefault()
        emit('update', modelValue.value)
        emit('navigate', 'up')
      }
      break
    case 'Tab':
      event.preventDefault()
      emit('update', modelValue.value)
      emit('navigate', event.shiftKey ? 'left' : 'right')
      break
    case 'Escape':
      event.preventDefault()
      emit('cancel')
      break
    case 'ArrowUp':
      if (!event.altKey && !event.ctrlKey) {
        event.preventDefault()
        emit('update', modelValue.value)
        emit('navigate', 'up')
      }
      break
    case 'ArrowDown':
      if (!event.altKey && !event.ctrlKey) {
        event.preventDefault()
        emit('update', modelValue.value)
        emit('navigate', 'down')
      }
      break
  }
}

function handleBlur() {
  emit('update', modelValue.value)
}
</script>

<style scoped>
.cell-editor {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  padding: 2px 4px;
  font-size: inherit;
  font-family: inherit;
  background: white;
}
</style>
