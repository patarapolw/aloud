import url from 'url'

import Vue from 'vue'
import { User } from 'firebase/app'
import { nanoid } from 'nanoid'
import escapeStringRegexp from 'escape-string-regexp'
import { allowedUrls } from '~/aloud.config'

export interface IEntry {
  _id: string
  url: string
  content: string
  createdAt: Date
  createdBy: {
    displayName: string | null
    email: string | null
  }
  path: string
  like: {
    'thumb-up': string[] // email
  }
}

export const g: {
  stitch?: StitchOp
} = {}

export class StitchOp {
  client!: import('mongodb-stitch-browser-sdk').StitchAppClient
  db!: import('mongodb-stitch-browser-sdk').RemoteMongoDatabase
  auth: import('mongodb-stitch-browser-sdk').StitchUser | null = null

  constructor(private vm: Vue) {
    this.init()
  }

  get url() {
    const URL = typeof window === 'undefined' ? url.URL : window.URL

    const u = new URL(location.href).searchParams.get('url')
    if (!u) {
      throw new Error('URL is required')
    }

    if (!allowedUrls.some((re) => re.test(u))) {
      throw new Error('Unregistered URL')
    }

    return u
  }

  get user() {
    const u = this.vm.$store.state.user
    return u as User | null
  }

  get email() {
    return this.user ? this.user.email : null
  }

  get col() {
    return this.db.collection<IEntry>('comment')
  }

  init() {
    if (typeof window !== 'undefined') {
      const st = require('mongodb-stitch-browser-sdk') as typeof import('mongodb-stitch-browser-sdk')
      this.client = st.Stitch.initializeDefaultAppClient(
        process.env.MONGO_APP_ID!
      )
      this.db = this.client
        .getServiceClient(st.RemoteMongoClient.factory, 'mongodb-atlas')
        .db('aloud')
    }
  }

  async login(user?: User) {
    const st = require('mongodb-stitch-browser-sdk') as typeof import('mongodb-stitch-browser-sdk')
    const u = user || this.user

    if (u && u.email) {
      try {
        this.auth = await this.client.auth.loginWithCredential(
          new st.UserPasswordCredential(u.email, process.env.SECRET!)
        )
      } catch (_) {
        const provider = this.client.auth.getProviderClient(
          st.UserPasswordAuthProviderClient.factory
        )
        await provider.registerWithEmail(u.email, process.env.SECRET!)

        this.auth = await this.client.auth.loginWithCredential(
          new st.UserPasswordCredential(u.email, process.env.SECRET!)
        )
      }
    } else {
      this.auth = await this.client.auth.loginWithCredential(
        new st.AnonymousCredential()
      )
    }
  }

  async logout() {
    await this.client.auth.logout()
    this.auth = null
  }

  async create(entry: Omit<IEntry, '_id' | 'createdAt' | 'createdBy' | 'url'>) {
    const _id = nanoid()
    const it: IEntry = {
      ...entry,
      _id,
      createdAt: new Date(),
      createdBy: {
        displayName: this.user ? this.user.displayName : null,
        email: this.user ? this.user.email : null
      },
      url: this.url
    }

    await this.col.insertOne(it)
    return _id
  }

  async read(path: string, items: IEntry[] = []) {
    const data = await this.col
      .aggregate([
        {
          $match: {
            url: this.url,
            path
          }
        },
        {
          $sort: {
            createdAt: -1
          }
        },
        {
          $skip: items.length
        },
        {
          $limit: 5
        }
      ])
      .asArray()

    return {
      data: [...data, ...items],
      count: await this.col.count({
        url: this.url,
        path
      })
    }
  }

  async update(id: string, set: Partial<IEntry>) {
    await this.col.updateOne({ _id: id }, { $set: set })
  }

  async delete(entry: IEntry) {
    await this.col.deleteOne({ _id: entry._id })
    await this.col.deleteMany({
      url: this.url,
      path: {
        $regex: new RegExp(
          `(^${escapeStringRegexp(entry.path)}/|^${escapeStringRegexp(
            entry.path
          )}$)`
        )
      }
    })
  }
}
