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

    this.micButton = $('#micButton')
    this.copyButton = $('#copyButton')
    this.speakerButton = $('#speakerButton')
    this.swapLanguagesButton = $('#swapLanguages')

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

    this.swapLanguagesButton.addEventListener('click', () =>
      this.swapLanguages()
    )
    this.micButton.addEventListener('click', () => this.startVoiceRecognition())
    this.speakerButton.addEventListener('click', () => this.speakTranslation())
  }

  debounceTranslate() {
    clearTimeout(this.translationTimeout)
    this.translationTimeout = setTimeout(() => {
      this.translate()
    }, 500)
  }

  updatedDetectedLanguage(detectedLanguage) {
    // Actualizar visualmente el idioma detectado
    const option = this.sourceLanguage.querySelector(
      `option[value="${detectedLanguage}"]`
    )

    if (option) {
      const autoOption =
        this.sourceLanguage.querySelector(`option[value="auto"]`)
      autoOption.textContent = `Detectar idioma (${option.textContent})`
    }
  }

  async getTranslation(text) {
    const sourceLanguage =
      this.sourceLanguage.value === 'auto'
        ? await this.detectLanguage(text)
        : this.sourceLanguage.value

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

    if (this.sourceLanguage.value === 'auto') {
      const detectedLanguage = await this.detectLanguage(text)
      this.updatedDetectedLanguage(detectedLanguage)
    }

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

  getFullLangageCode(languageCode) {
    return (
      GoogleTranslator.FULL_LANGUAGES_CODES[languageCode] ??
      GoogleTranslator.DEFAULT_SOURCE_LANGUAGE
    )
  }

  async startVoiceRecognition() {
    const hasNativeRecognitionSupport =
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    if (!hasNativeRecognitionSupport) return

    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false

    const language =
      this.sourceLanguage.value === 'auto'
        ? await this.detectLanguage(this.inputText.value)
        : this.sourceLanguage.value

    recognition.lang = this.getFullLangageCode(language)

    recognition.onstart = () => {
      this.micButton.style.backgroundColor = 'var(--google-red)'
      this.micButton.style.color = 'white'
    }

    recognition.onend = () => {
      this.micButton.style.backgroundColor = ''
      this.micButton.style.color = ''
    }

    recognition.onresult = (event) => {
      console.log(event.results)

      const [{ transcript }] = event.results[0]
      this.inputText.value = transcript
      this.translate()
    }

    recognition.onerror = (event) => {
      console.error('Error de reconocimiento de voz: ', event.error)
    }

    recognition.start()
  }

  speakTranslation() {
    const hasNativeSupportSynthesis = 'SpeechSynthesis' in window
    if (!hasNativeSupportSynthesis) return

    const text = this.outputText.textContent
    if (!text) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lan = this.getFullLangageCode(this.targetLanguage.value)
    utterance.rate = 0.8

    utterance.onstart = () => {
      this.speakerButton.style.backgroundColor = 'var(--google-green)'
      this.speakerButton.style.color = 'white'
    }

    utterance.onend = () => {
      this.speakerButton.style.backgroundColor = ''
      this.speakerButton.style.color = ''
    }

    window.speechSynthesis.speak(utterance)
  }

  async swapLanguages() {
    // primero detectar si sourcelanguage es 'auto' para saber
    // que idioma pasar al output
    if (this.sourceLanguage.value === 'auto') {
      const detectedLanguage = await this.detectLanguage(this.inputText.value)
      this.sourceLanguage.value = detectedLanguage
    }

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

  async detectLanguage(text) {
    try {
      if (!this.currentDetector) {
        this.currentDetector = await window.LanguageDetector.create({
          expectedInputLanguages: GoogleTranslator.SUPPORTED_LANGUAGES,
        })
      }
      const results = await this.currentDetector.detect(text)
      const detectedLanguage = results[0]?.detectedLanguage

      return detectedLanguage === 'und'
        ? GoogleTranslator.DEFAULT_SOURCE_LANGUAGE
        : detectedLanguage
    } catch (error) {
      console.error('No se pudo identificar el idioma: ', error)
      return GoogleTranslator.DEFAULT_SOURCE_LANGUAGE
    }
  }
}

const googleTranslator = new GoogleTranslator()
