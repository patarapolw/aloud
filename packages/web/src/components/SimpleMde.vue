<template lang="pug">
.vue-simplemde
  textarea.vue-simplemde-textarea(:value="modelVal" @input="handleInput($event.target.value)")
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { MakeHtml } from '../assets/make-html'
import SimpleMDE from 'simplemde'
import firebase from 'firebase/app'
import 'firebase/storage'

@Component
export default class Mde extends Vue {
  @Prop({
    default: () =>
      Math.random()
        .toString(36)
        .substr(2)
  })
  id!: string

  @Prop()
  disabled?: boolean

  @Prop({ default: '' }) disabledHtml!: string
  @Prop({ default: '' }) value!: string
  modelVal = ''
  isValueUpdateFromInner = false
  simplemde!: SimpleMDE
  modelOptions: any = {}
  get savingEl () {
    /**
     * @type {HTMLDivElement}
     */
    const toolbarEl = this.$el.getElementsByClassName('editor-toolbar')[0]
    return Array.from(toolbarEl.children).filter((el0) =>
      ['fa-pencil', 'fa-save'].some((tag) => el0.classList.contains(tag))
    )[0]
  }

  mounted () {
    const makeHtml = new MakeHtml(this.id)
    this.$set(this, 'modelOptions', {
      autosave: {
        enabled: !!this.id,
        uniqueId: this.id,
        delay: 10000
      },
      toolbar: [
        {
          name: 'undo',
          action: SimpleMDE.undo,
          className: 'fa fa-undo no-disable',
          title: 'Undo'
        },
        {
          name: 'redo',
          action: SimpleMDE.redo,
          className: 'fa fa-repeat no-disable',
          title: 'Redo'
        },
        '|',
        'bold',
        'italic',
        'heading',
        '|',
        'quote',
        'unordered-list',
        'ordered-list',
        '|',
        'link',
        'image',
        '|',
        'preview',
        {
          action: () => {},
          className: 'fa fa-save'
        },
        '|',
        {
          name: 'guide',
          action: '/guide',
          className: 'fa fa-question-circle',
          title: 'Markdown Guide'
        }
      ],
      indentWithTabs: false,
      placeholder: 'Please type in markdown to comment.',
      previewRender: (plainText: string, preview: HTMLElement) => {
        makeHtml.parse(plainText).then((html) => {
          preview.innerHTML = `<div class="content">${html}</div>`
        })
        return ''
      },
      spellChecker: false,
      renderingConfig: {
        codeSyntaxHighlighting: true
      },
      status: false
    })
    this.$nextTick(() => {
      this.initialize()
    })
  }

  deactivated () {
    const editor = this.simplemde
    if (!editor) {
      return
    }
    const isFullScreen = editor.codemirror.getOption('fullScreen')
    if (isFullScreen) {
      ;(editor as any).toggleFullScreen()
    }
  }

  destroyed () {
    if (typeof document !== 'undefined' && this.simplemde) {
      document.removeEventListener('localStorage', this.storageListener)
    }
    ;(this as any).simplemde = null
  }

  initialize () {
    const originalSetItem = localStorage.setItem
    localStorage.setItem = function (key, value) {
      const event = new Event('localStorage')
      Object.assign(event, { key, value })
      document.dispatchEvent(event)
      // @ts-ignore
      originalSetItem.apply(this, arguments)
    }
    document.addEventListener('localStorage', this.storageListener)
    const configs = {
      element: this.$el.firstElementChild,
      ...this.modelOptions
    }
    // 实例化编辑器
    this.simplemde = new SimpleMDE(configs)
    if (!this.simplemde) {
      return
    }
    this.simplemde.codemirror.setSize('100%', '100%')
    this.simplemde.codemirror.addKeyMap({
      'Cmd-S': () => {
        this.doAutosave(true)
      },
      'Ctrl-S': () => {
        this.doAutosave(true)
      }
    })
    this.simplemde.codemirror.on(
      'paste',
      async (ins: any, evt: ClipboardEvent) => {
        const { items } = evt.clipboardData || {}
        if (items) {
          for (const k of Object.keys(items)) {
            const item = items[k as any]
            if (item.kind === 'file') {
              evt.preventDefault()
              /**
               * @type {File}
               */
              const blob = item.getAsFile()
              if (blob && /^image\//.test(blob.type)) {
                const start = ins.getCursor()
                ins.getDoc().replaceRange('Uploading from clipboard...', start)
                const end = ins.getCursor()
                try {
                  const filename = new Date().toISOString()
                  const r = await firebase.storage().ref(filename).put(blob)
                  ins
                    .getDoc()
                    .replaceRange(
                      `![${filename}](${r.downloadURL})`,
                      start,
                      end
                    )
                } catch (e) {
                  ins.getDoc().replaceRange('', start, end)
                }
              }
            }
          }
        }
      }
    )
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
  }

  @Watch('value')
  watchValue (val: string) {
    if (this.isValueUpdateFromInner) {
      this.isValueUpdateFromInner = false
      return
    }
    if (this.simplemde) {
      this.simplemde.value(val)
    }
    this.modelVal = val
  }

  bindingEvents () {
    this.simplemde.codemirror.on('change', () => {
      const val = this.simplemde.value()
      this.handleInput(val)
    })
  }

  handleInput (val: string) {
    this.unAutosave()
    this.isValueUpdateFromInner = true
    this.$emit('input', val)
    this.$nextTick(() => {
      this.isValueUpdateFromInner = false
    })
  }

  setDisabled () {
    if (this.disabled) {
      if (!this.simplemde.isPreviewActive()) {
        SimpleMDE.togglePreview(this.simplemde)
      }
      const toolbarEl = this.$el.getElementsByClassName(
        'editor-toolbar'
      )[0] as HTMLDivElement
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
      const toolbarEl = this.$el.getElementsByClassName(
        'editor-toolbar'
      )[0] as HTMLDivElement
      if (toolbarEl) {
        toolbarEl.style.display = 'block'
      }
    }
  }

  storageListener (evt: any) {
    if (evt.key === `smde_${this.id}`) {
      this.doAutosave(false)
    }
  }

  doAutosave (commit: boolean) {
    const el = this.savingEl
    if (el instanceof HTMLAnchorElement) {
      el.classList.remove('fa-save')
      el.classList.add('fa', 'fa-check')
      el.title = 'Saved'
      el.tabIndex = -1
      el.onclick = () => {}
      if (commit !== false) {
        ;(this.simplemde as any).autosave()
      }
    }
  }

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
  }

  clearAutosave () {
    this.unAutosave()
    this.simplemde.clearAutosavedValue()
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
