import { createStore } from '@models/store'
import { createContext } from 'react'
import schema from './store.json'
import firebase from 'firebase/app'

export const store = createStore({
  entities: schema.entities,
  firestore: firebase.firestore,
})

export default createContext({
  store,
})
