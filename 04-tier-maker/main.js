const $ = (el) => document.querySelector(el)
const $$ = (el) => document.querySelectorAll(el)

const imageInput = $('#image-input')
const itemsSection = $('#selector-items')

function createItems(src) {
  const imgElement = document.createElement('img')
  imgElement.draggable = true
  imgElement.src = src
  imgElement.className = 'item-image'

  imgElement.addEventListener('dragstart', handleDragStart)
  imgElement.addEventListener('dragend', handleDragEnd)

  itemsSection.appendChild(imgElement)
  return imgElement
}

imageInput.addEventListener('change', (event) => {
  const [file] = event.target.files

  if (file) {
    const reader = new FileReader()

    reader.onload = (eventReader) => {
      createItems(eventReader.target.result)
    }

    reader.readAsDataURL(file)
  }
})

let draggedElement = null
let sourceContainer = null

const rows = $$('.tier .row')

rows.forEach((row) => {
  row.addEventListener('drop', handleDrop)
  row.addEventListener('dragover', handleOver)
  row.addEventListener('dragleave', handleDragLeave)
})

function handleDrop(event) {
  event.preventDefault()
  const { currtentTarget, dataTransfer } = event

  if (sourceContainer && draggedElement) {
    sourceContainer.removeChild(draggedElement)
  }

  if (draggedElement) {
    const src = dataTransfer.getData('text/plain')
    const imgElement = createItems()
    currtentTarget.appendChild(imgElement)
  }
}

function handleOver(event) {
  event.preventDefault()
  const { currentTarget, dataTransfer } = event
}

function handleDragLeave(event) {}

function handleDragStart(event) {
  draggedElement = event.target
  sourceContainer = draggedElement.parentNode
  event.dataTransfer.setData('text/plain', draggedElement.src)
}

function handleDragEnd(event) {
  console.log('drag end', event.target)
  draggedElement = null
  sourceContainer = null
}
