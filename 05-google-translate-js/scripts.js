import { $, $$ } from './doom.js'

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

    this.currentTranslator = null
    this.currentDetector = null
  }

  init() {
    // Recuperamos todos los elementos del DOM que necesitamos
    this.inputText = $('#inputText')
    this.outputText = $('#outputText')

    this.sourceLanguage = $('#sourceLanguage')
    this.targetLanguage = $('#targetLanguage')
    this.swapLanguage = $('#swapLanguages')

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
      // Traducir el texto con un debounce
    })

    this.sourceLanguage.addEventListener('change', () => this.translate())
    this.targetLanguage.addEventListener('change', () => this.translate())

    this.swapLanguage.addEventListener('click', () => this.swapLanguage())
  }

  translate() {
    // TODO!
  }

  swapLanguage() {
    // intercambiar idiomas entre el sourceLanguage y el targetlanguage
  }
}

const googleTranslator = new GoogleTranslator()
