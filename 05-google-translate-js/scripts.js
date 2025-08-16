import { $ } from './doom.js'

class GoogleTranslator {
  static SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja']

  static FULL_LANGUAGES_CODES = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    it: 'it-IT',
    pt: 'pt-PT',
    ru: 'ru-RU',
    ja: 'ja-JP',
  }

  static DEFAULT_SOURCE_LANGUAGE = 'es'
  static DEFAULT_TARGET_LANGUAGE = 'en'

  constructor() {
    this.init()
    this.setupEventListeners()

    this.translationTimeout = null
    this.currentTranslator = null
    this.currentTranslatorKey = null
    this.currentDetector = null
  }

  init() {
    // Recuperamos todos los elementos del DOM que necesitamos
    this.inputText = $('#inputText')
    this.outputText = $('#outputText')

    this.sourceLanguage = $('#sourceLanguage')
    this.targetLanguage = $('#targetLanguage')
    this.swapLanguages = $('#swapLanguages')

    this.micButton = $('#micButton')
    this.copyButton = $('#copyButton')
    this.speakerButton = $('#speakerButton')

    // configuracion inicial
    this.targetLanguage.value = GoogleTranslator.DEFAULT_TARGET_LANGUAGE

    // Verificar el soporte para la API
    this.checkAPISupport()
  }

  checkAPISupport() {
    this.hasNativeTranslator = 'Translator' in window
    this.hasNativeDetector = 'LanguageDetector' in window

    if (!this.hasNativeTranslator || !this.hasNativeDetector) {
      console.warrm(
        'APIS nativas de traduccion y deteccion no soportadas en tu navegador'
      )
      // thi.showWarning()
    } else {
      console.log('Apis Nativas de IA Disponibles')
    }
  }

  setupEventListeners() {
    this.inputText.addEventListener('input', () => {
      // Actualizar el contador de letras
      this.debounceTranslate()
    })

    this.sourceLanguage.addEventListener('change', () => this.translate())
    this.targetLanguage.addEventListener('change', () => this.translate())

    this.swapLanguages.addEventListener('click', () => this.swapLanguages())
  }

  debounceTranslate() {
    clearTimeout(this.translationTimeout)
    this.translationTimeout = setTimeout(() => {
      this.translate()
    }, 500)
  }

  async getTranslation(text) {
    const sourceLanguage = this.sourceLanguage.value
    const targetLanguage = this.targetLanguage.value

    if (sourceLanguage === targetLanguage) return text

    // revisar la disponibilidad de traduccion entre origen y target.
    try {
      const status = await window.Translator.availability({
        sourceLanguage,
        targetLanguage,
      })

      if (status === 'unavailable') {
        throw new Error(
          `Traduccion de ${sourceLanguage} a ${targetLanguage} no disponible`
        )
      }
    } catch (error) {
      console.error(error)
      throw new Error(
        `Traduccion de ${sourceLanguage} a ${targetLanguage} no disponible`
      )
    }

    // Realizar la traduccion
    const translatorkey = `${sourceLanguage}-${targetLanguage}`

    try {
      if (
        !this.currentTranslator ||
        this.currentTranslatorKey !== translatorkey
      ) {
        this.currentTranslator = await window.Translator.create({
          sourceLanguage,
          targetLanguage,
          monitor: (monitor) => {
            monitor.addEventListener('downloadprogress', (e) => {
              this.outputText.innerHTML = `<span class="loading">Descargando modelo: ${Math.floor(
                e.loaded * 100
              )}%</span>`
            })
          },
        })
      }
      this.currentTranslatorKey = translatorkey

      const translation = await this.currentTranslator.translate(text)
      return translation
    } catch (error) {
      console.error(error)
      return 'Error al traducir'
    }
  }

  async translate() {
    const text = this.inputText.value.trim()
    if (!text) {
      this.outputText.textContent = ''
      return
    }

    this.outputText.textContent = 'Traduciendo...'

    try {
      const translation = await this.getTranslation(text)
      this.outputText.textContent = translation
    } catch (error) {
      console.error(error)
      const hasSupport = this.checkAPISupport()
      if (!hasSupport) {
        this.outputText.textContent = '!Error no tienes soporte nativo a la API'
        return
      }
      this.outputText.textContent = 'Error al traducir'
    }
  }

  async swapLanguage() {
    // primero detectar si sourcelanguage es 'auto' para saber
    // que idioma pasar al output

    // intercambiar los valores
    const temporalLanguage = this.sourceLanguage.value
    this.sourceLanguage.value = this.targetLanguage.value
    this.targetLanguage.value = temporalLanguage

    // intercambiar los textos
    this.inputText.value = this.outputText.value
    this.outputText.value = ''

    if (this.inputText.value.trim()) {
      this.translate()
    }

    // restaurar la opcion de auto-detectar
  }

  async detecLanguage() {
    return 'es'
  }
}

const googleTranslator = new GoogleTranslator()
