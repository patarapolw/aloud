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
import dayjs from 'dayjs'

import { deepMerge } from '@/assets/utils'
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
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      modelVal: '',
      modelOptions: {},
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
    this.$set(this, 'modelOptions', getMdeOptions(this.id))
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

      deepMerge(this.modelOptions, this.options)
      const configs = {
        element: this.$el.firstElementChild,
        ...this.modelOptions
      }

      // 实例化编辑器
      this.simplemde = new SimpleMDE(configs)
      this.simplemde.codemirror.setSize('100%', '100%')
      this.simplemde.codemirror.addKeyMap({
        'Cmd-S': () => { this.doAutosave(true) },
        'Ctrl-S': () => { this.doAutosave(true) }
      })

      this.simplemde.codemirror.on('paste', async (ins, evt) => {
        const { items } = evt.clipboardData || {}
        if (items) {
          for (const k of Object.keys(items)) {
            const item = items[k]
            if (item.kind === 'file') {
              evt.preventDefault()
              const blob = item.getAsFile()
              const formData = new FormData()
              formData.append('file', blob)
              formData.append('user', this.$store.state.auth.user.email)

              const start = ins.getCursor()
              ins.getDoc().replaceRange(`Uploading from clipboard...`, start)
              const end = ins.getCursor()

              const r = await this.$axios.$post('/api/media/upload', formData)

              ins.getDoc().replaceRange(`![${dayjs().format()}](${r.secure_url})`, start, end)
            }
          }
        }
      })

      if (this.value) {
        this.simplemde.value(this.value)
      }

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
      this.$nextTick(() => {
        this.isValueUpdateFromInner = false
      })
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

        const previewEl = this.$el.querySelector('.editor-preview .content')
        if (previewEl) {
          previewEl.innerHTML = this.disabledHtml
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
  flex-grow: 1;
  min-height: auto;
}

.CodeMirror-scroll {
  min-height: unset;
}
</style>
