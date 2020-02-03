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
    },
    initialValue: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      modelVal: '',
      options: {},
      simplemde: null
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
  created () {
    this.$set(this, 'options', getMdeOptions(this.id))
  },
  mounted () {
    this.initialize()
  },
  deactivated () {
    const editor = this.simplemde
    if (!editor) { return }
    const isFullScreen = editor.codemirror.getOption('fullScreen')
    if (isFullScreen) { editor.toggleFullScreen() }
  },
  destroyed () {
    this.simplemde = null
  },
  methods: {
    initialize () {
      const SimpleMDE = require('simplemde')

      const configs = Object.assign({
        element: this.$el.firstElementChild,
        initialValue: this.value
      }, this.options)
      // 同步 value 和 initialValue 的值
      if (configs.initialValue) {
        this.$emit('input', configs.initialValue)
      }
      // 实例化编辑器
      this.simplemde = new SimpleMDE(configs)
      this.simplemde.codemirror.setSize('100%', '100%')

      // 绑定事件
      this.bindingEvents()

      this.setDisabled()

      this.$emit('init', this.simplemde)
    },
    bindingEvents () {
      this.simplemde.codemirror.on('change', () => {
        const val = this.simplemde.value()
        this.handleInput(val)
      })
    },
    handleInput (val) {
      this.isValueUpdateFromInner = true
      this.$emit('input', val)
    },
    setDisabled () {
      const SimpleMDE = require('simplemde')
      if (this.disabled) {
        if (!this.simplemde.isPreviewActive()) {
          SimpleMDE.togglePreview(this.simplemde)
        }

        const toolbarEl = document.getElementsByClassName('editor-toolbar')[0]
        if (toolbarEl) {
          toolbarEl.style.display = 'none'
        }

        const previewEl = document.getElementsByClassName('editor-preview')[0]
        if (previewEl) {
          previewEl.innerHTML = previewEl.innerHTML || this.disabledHtml
        }
      } else {
        if (this.simplemde.isPreviewActive()) {
          SimpleMDE.togglePreview(this.simplemde)
        }

        const toolbarEl = document.getElementsByClassName('editor-toolbar')[0]
        if (toolbarEl) {
          toolbarEl.style.display = 'block'
        }
      }
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
