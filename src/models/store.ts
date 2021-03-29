import type firebase from 'firebase'
import type { EntitiesSchemaToStoreType } from '@models/document-store-types'

export type FirebaseStoreType<S> = EntitiesSchemaToStoreType<S, {
  where(
    fieldPath: string | firebase.firestore.FieldPath,
    opStr: firebase.firestore.WhereFilterOp,
    value: unknown
  ): unknown;
  orderBy(
    fieldPath: string | firebase.firestore.FieldPath,
    directionStr?: firebase.firestore.OrderByDirection
  ): unknown;
}>

function createFirebaseDocumentProxy (ref: firebase.firestore.DocumentReference) {
  return {
    collection: (...args: Parameters<firebase.firestore.DocumentReference['collection']>) => createFirebaseCollectionProxy(ref.collection(...args)),
    fetch: (...args: Parameters<firebase.firestore.DocumentReference['get']>) => ref.get(...args),
  }
}

function createFirebaseCollectionProxy (ref: firebase.firestore.CollectionReference) {
  return {
    doc: (documentPath: string) => createFirebaseDocumentProxy(ref.doc(documentPath)),
    fetch: (...args: Parameters<firebase.firestore.CollectionReference['get']>) => ref.get(...args),
    orderBy: (...args: Parameters<firebase.firestore.CollectionReference['orderBy']>) => createFirebaseQueryProxy(ref.orderBy(...args)),
    where: (...args: Parameters<firebase.firestore.CollectionReference['where']>) => createFirebaseQueryProxy(ref.where(...args)),
  }
}

function createFirebaseQueryProxy (ref: firebase.firestore.Query) {
  return {
    fetch: (...args: Parameters<firebase.firestore.Query['get']>) => ref.get(...args),
    orderBy: (...args: Parameters<firebase.firestore.Query['orderBy']>) => createFirebaseQueryProxy(ref.orderBy(...args)),
    where: (...args: Parameters<firebase.firestore.Query['where']>) => createFirebaseQueryProxy(ref.where(...args)),
  }
}

interface StoreInput <T> {
  entities: T;
  firestore: firebase.firestore.Firestore;
}

export function createStore <T> (input: StoreInput<T>): FirebaseStoreType<T> {
  const entityNames = Object.keys(input.entities)
  const store: Record<string, unknown> = {}

  for (const name of entityNames) {
    store[name] = createFirebaseCollectionProxy(input.firestore.collection(name))
  }

  return store as FirebaseStoreType<T>
}