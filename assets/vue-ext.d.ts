import Vue from 'vue'
import { auth, storage } from 'firebase/app'
import { AxiosInstance } from 'axios'

declare module 'vue/types/vue' {
  interface Vue {
    $axios: AxiosInstance
    $fireAuth: auth.Auth
    $fireAuthObj: typeof auth
    $fireStorage: storage.Storage
  }
}
