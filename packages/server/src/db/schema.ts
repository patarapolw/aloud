import { prop, getModelForClass, setGlobalOptions, Severity } from '@typegoose/typegoose'
import { nanoid } from 'nanoid'
import mongoose from 'mongoose'

setGlobalOptions({ options: { allowMixed: Severity.ALLOW } })

class Entry {
  @prop({ default: () => nanoid() }) _id!: string
  @prop({ index: true, required: true }) url!: string
  @prop({ default: '' }) content!: string
  @prop({ index: true, default: () => new Date() }) createdAt!: Date
  @prop({ default: () => ({}) }) createdBy!: {
    displayName?: string
    email?: string
  }

  @prop({ index: true, required: true }) path!: string
  @prop({
    default: () => ({
      'thumb-up': []
    })
  }) like!: {
    'thumb-up': string[] // email
  }
}

export const EntryModel = getModelForClass(Entry, { schemaOptions: { collection: 'entry' } })

export async function initDatabase (mongoUri: string) {
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
}
