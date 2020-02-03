<template>
  <div class="vue-simplemde">
    <textarea
      :value="modelVal"
      @input="handleInput($event.target.value)"
      class="vue-simplemde-textarea"
    />
  </div>
</template>

<script>
import { getMdeOptions } from '@/assets/simplemde'

export default {
  props: {
    id: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    disabledHtml: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      modelVal: '',
      options: {},
      simplemde: null
    }
  },
  computed: {
    savingEl () {
      /**
       * @type {HTMLDivElement}
       */
      const toolbarEl = this.$el.getElementsByClassName('editor-toolbar')[0]
      return Array.from(toolbarEl.children).filter(el0 => [
        'fa-pencil',
        'fa-save'
      ].some(tag => el0.classList.contains(tag)))[0]
    }
  },
  watch: {
    value (val) {
      if (this.isValueUpdateFromInner) {
        this.isValueUpdateFromInner = false
        return
      }

      this.simplemde.value(val)
      this.modelVal = val
    },
    disabled () {
      this.setDisabled()
    }
  },
  mounted () {
    this.$set(this, 'options', getMdeOptions(this.id))
    this.$nextTick(() => {
      this.initialize()
    })
  },
  deactivated () {
    const editor = this.simplemde
    if (!editor) { return }
    const isFullScreen = editor.codemirror.getOption('fullScreen')
    if (isFullScreen) { editor.toggleFullScreen() }
  },
  destroyed () {
    if (typeof document !== 'undefined' && this.simplemde) {
      document.removeEventListener('localStorage', this.storageListener)
    }
    this.simplemde = null
  },
  methods: {
    initialize () {
      const SimpleMDE = require('simplemde')

      const originalSetItem = localStorage.setItem
      localStorage.setItem = function (key, value) {
        const event = new Event('localStorage')
        event.value = value
        event.key = key
        document.dispatchEvent(event)
        originalSetItem.apply(this, arguments)
      }
      document.addEventListener('localStorage', this.storageListener)

      const configs = Object.assign({
        element: this.$el.firstElementChild
      }, this.options)

      // 实例化编辑器
      this.simplemde = new SimpleMDE(configs)
      this.simplemde.codemirror.setSize('100%', '100%')

      // 绑定事件
      this.bindingEvents()
      this.setDisabled()
      this.doAutosave(false)

      if (!this.disabled) {
        this.$emit('input', this.simplemde.value())
      }

      this.$emit('init', this.simplemde)
    },
    bindingEvents () {
      this.simplemde.codemirror.on('change', () => {
        const val = this.simplemde.value()
        this.handleInput(val)
      })
    },
    handleInput (val) {
      this.unAutosave()

      this.isValueUpdateFromInner = true
      this.$emit('input', val)
    },
    setDisabled () {
      const SimpleMDE = require('simplemde')
      if (this.disabled) {
        if (!this.simplemde.isPreviewActive()) {
          SimpleMDE.togglePreview(this.simplemde)
        }

        const toolbarEl = this.$el.getElementsByClassName('editor-toolbar')[0]
        if (toolbarEl) {
          toolbarEl.style.display = 'none'
        }

        const previewEl = this.$el.getElementsByClassName('editor-preview')[0]
        if (previewEl) {
          previewEl.innerHTML = previewEl.innerHTML || this.disabledHtml
        }
      } else {
        if (this.simplemde.isPreviewActive()) {
          SimpleMDE.togglePreview(this.simplemde)
        }

        const toolbarEl = this.$el.getElementsByClassName('editor-toolbar')[0]
        if (toolbarEl) {
          toolbarEl.style.display = 'block'
        }
      }
    },
    storageListener (evt) {
      if (evt.key === `smde_${this.id}`) {
        this.doAutosave(false)
      }
    },
    /**
     * @param {boolean} [commit]
     */
    doAutosave (commit) {
      const el = this.savingEl

      if (el instanceof HTMLAnchorElement) {
        el.classList.remove('fa-save')
        el.classList.add('fa', 'fa-check')
        el.title = 'Saved'
        el.tabIndex = -1
        el.onclick = undefined

        if (commit !== false) {
          this.simplemde.autosave()
        }
      }
    },
    unAutosave () {
      const el = this.savingEl

      if (el instanceof HTMLAnchorElement) {
        el.classList.remove('fa-check')
        el.classList.add('fa', 'fa-save')
        el.title = 'Click to commit autosave'
        el.tabIndex = -1
        el.onclick = () => {
          this.doAutosave(true)
        }
      }
    },
    clearAutosave () {
      this.unAutosave()
      this.simplemde.clearAutosavedValue()
    }
  }
}
</script>

<style>
.vue-simplemde {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.CodeMirror {
  min-height: none;
  flex-grow: 1;
  min-height: auto;
}
</style>
