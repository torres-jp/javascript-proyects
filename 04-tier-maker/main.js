const $ = (el) => document.querySelector(el)
const $$ = (el) => document.querySelectorAll(el)

const imageInput = $('#image-input')
const itemsSection = $('#selector-items')

imageInput.addEventListener('change', (event) => {
  const [file] = event.target.files

  if (file) {
    const reader = new FileReader()

    reader.onload = (eventReader) => {
      const imgElement = document.createElement('img')
      imgElement.draggable = true
      imgElement.src = eventReader.target.result
      imgElement.className = 'item-image'

      imgElement.addEventListener('dragstart', handleDragStart)
      imgElement.addEventListener('dragend', handleDragEnd)

      itemsSection.appendChild(imgElement)
    }

    reader.readAsDataURL(file)
  }
})

let draggedElement = null
let sourceContainer = null

function handleDragStart(event) {
  console.log('drag start', event.target)
  draggedElement = event.target
  const sourceContainer = draggedElement.parentNode
}
