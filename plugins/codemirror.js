import Vue from 'vue'
import VueCodemirror from 'vue-codemirror'

import 'codemirror/lib/codemirror'
import 'codemirror/addon/edit/matchtags'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/edit/closetag'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/mode/xml/xml'
import 'codemirror/addon/fold/xml-fold'

import 'codemirror/lib/codemirror.css'

Vue.use(VueCodemirror)
