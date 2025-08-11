import { $ } from './doom.js'

class GoogleTranslator {
  static SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja']

  static FULL_LANGUAGES_CODE = {
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

  consturctor() {
    this.init()
    this.setupEventListeners()

    this.translationTimeout = null
    this.currentTranslator = null
    this.currentTranslator = null
    this.currentDetector = null
  }

  init() {
    // recuperamos todos los elementos del DOM
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

    // verificar que el usuario tenga soporte para la API
    this.checkAPISupport()
  }

  checkAPISupport() {
    this.hasNativeTranslator = 'Translator' in window
    this.hasNativeDetector = 'LanguageDetector' in window

    if (!this.hasNativeTranslator || !this.hasNativeDetector) {
      console.warm(
        'APIs Nativas de traduccion y deteccion de idiomas no soportadas en tu navegador'
      )
      //this.showWarning()
    } else {
      console.log('Apis Nativas disponibles')
    }
  }

  setupEventListeners() {
    this.inputText.addEventListener('input', () => {
      // actualizar contador de letras
      // traducir texto con un debounce
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

    // verificar si tenemos disponibilidad entre lenguajes
    try {
      const status = await window.Translator.availability({
        sourceLanguage,
        targetLanguage,
      })

      if (status === 'unavailable') {
        throw new Error(
          `Traduccion no disponible entre ${sourceLanguage} y ${targetLanguage}`
        )
      }
    } catch (error) {
      console.log(error)
    }

    // realizar la traduccion
    const translatorKey = `${sourceLanguage}-${targetLanguage}`
    if (
      !this.currentTranslator ||
      !this.currentTranslatorKey !== translatorKey
    ) {
      this.currentTranslator = await window.Translator.create({
        sourceLanguage,
        targetLanguage,
      })
    }
  }

  async translate() {
    const text = this.inputText.value.trim()
    if (!text) {
      this.outputText.textContent = ''
      return
    }

    this.outputText.textContent = 'Traduciendo....'

    try {
      const translation = await this.getTranslation(text)
      this.outputText.textContent = translation
      // Aqui se llama a la API de traduccion
    } catch (error) {
      console.log(error)
      this.outputText.textContent = 'Error al traducir'
    }
  }

  swapLanguages() {
    // TODO!
  }
}

const GoogleTranslator = new GoogleTranslator()
