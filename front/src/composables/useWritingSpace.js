import { ref, computed } from 'vue'

export const SPACES = {
  paper: {
    id: 'paper',
    name: 'Paper',
    label: '纸张',
    bg: '#F6F3EE',
    accent: '#C4956A',
    class: 'space-paper'
  },
  mist: {
    id: 'mist',
    name: 'Mist',
    label: '薄雾',
    bg: '#F5F7FA',
    accent: '#4F7CFF',
    class: 'space-mist'
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    label: '午夜',
    bg: '#111315',
    accent: '#A5B4FC',
    class: 'space-midnight'
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    label: '森林',
    bg: '#EEF2EC',
    accent: '#6B8F71',
    class: 'space-forest'
  }
}

const SPACE_ORDER = ['paper', 'mist', 'midnight', 'forest']
const globalFallback = localStorage.getItem('writingSpace') || 'mist'

const currentSpaceId = ref(globalFallback)
let currentNoteId = null

function noteKey(id) {
  return `writingSpace/${id}`
}

export function useWritingSpace() {
  const currentSpace = computed(() => SPACES[currentSpaceId.value] || SPACES.mist)

  function syncNoteSpace(noteId) {
    currentNoteId = noteId
    const saved = noteId ? localStorage.getItem(noteKey(noteId)) : null
    currentSpaceId.value = saved || globalFallback || 'mist'
  }

  function applySpace(id) {
    if (!SPACES[id]) return
    currentSpaceId.value = id
    localStorage.setItem('writingSpace', id)
    if (currentNoteId) {
      localStorage.setItem(noteKey(currentNoteId), id)
    }
  }

  function cycleSpace() {
    const idx = SPACE_ORDER.indexOf(currentSpaceId.value)
    const next = SPACE_ORDER[(idx + 1) % SPACE_ORDER.length]
    applySpace(next)
  }

  return { currentSpace, syncNoteSpace, cycleSpace, setSpace: applySpace }
}
