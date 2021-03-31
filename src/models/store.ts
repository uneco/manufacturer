import type firebase from 'firebase'
import type { EntitiesSchemaToStoreType } from '@models/document-store-types'
import serializableFirestore, { CollectionReference, DocumentReference, Query } from './firestore-serializable'

export const identifier = Symbol('resource')

interface Firestore {
  FieldPath: {
    documentId(): firebase.firestore.FieldPath;
  };
  (): firebase.firestore.Firestore;
}
export interface QueryOperators {
  where(
    fieldPath: string | firebase.firestore.FieldPath,
    opStr: firebase.firestore.WhereFilterOp,
    value: unknown
  ): unknown;
  orderBy(
    fieldPath: string | firebase.firestore.FieldPath,
    directionStr?: firebase.firestore.OrderByDirection
  ): unknown;
}

export type FirebaseStoreType<S> = EntitiesSchemaToStoreType<S, QueryOperators>

function createFirebaseDocumentProxy (firestore: Firestore, document: DocumentReference) {
  return {
    collection: (path: string) => {
      return createFirebaseCollectionProxy(firestore, serializableFirestore.collection(path))
    },
    fetch: (...args: Parameters<firebase.firestore.DocumentReference['get']>) => {
      return serializableFirestore.instantiate(firestore(), {
        document,
      }).get(...args)
    },
    subscribe: (...args: Parameters<firebase.firestore.DocumentReference['onSnapshot']>) => {
      return serializableFirestore.instantiate(firestore(), {
        document,
      }).onSnapshot(...args)
    },
    [identifier]: serializableFirestore.getIdentifier(document),
  }
}

function createFirebaseCollectionProxy (firestore: Firestore, collection: CollectionReference) {
  return {
    doc: (path?: string) => {
      return createFirebaseDocumentProxy(firestore, serializableFirestore.document(collection, path))
    },
    orderBy: (...[fieldPath, direction]: Parameters<QueryOperators['orderBy']>) => {
      return createFirebaseQueryProxy(firestore, serializableFirestore.orderBy(collection, {
        fieldPath,
        direction,
      }))
    },
    where: (...[fieldPath, operator, value]: Parameters<QueryOperators['where']>) => {
      return createFirebaseQueryProxy(firestore, serializableFirestore.where(collection, {
        fieldPath,
        operator,
        value,
      }))
    },
    fetch: (...args: Parameters<firebase.firestore.CollectionReference['get']>) => {
      return serializableFirestore.instantiate(firestore(), {
        collection,
      }).get(...args)
    },
    subscribe: (...args: Parameters<firebase.firestore.CollectionReference['onSnapshot']>) => {
      return serializableFirestore.instantiate(firestore(), {
        collection,
      }).onSnapshot(...args)
    },
    [identifier]: serializableFirestore.getIdentifier(collection),
  }
}

function createFirebaseQueryProxy (firestore: Firestore, query: Query) {
  return {
    orderBy: (...[fieldPath, direction]: Parameters<QueryOperators['orderBy']>) => {
      return createFirebaseQueryProxy(firestore, serializableFirestore.orderBy(query, {
        fieldPath,
        direction,
      }))
    },
    where: (...[fieldPath, operator, value]: Parameters<QueryOperators['where']>) => {
      return createFirebaseQueryProxy(firestore, serializableFirestore.where(query, {
        fieldPath,
        operator,
        value,
      }))
    },
    fetch: (...args: Parameters<firebase.firestore.Query['get']>) => {
      return serializableFirestore.instantiate(firestore(), {
        query,
      }).get(...args)
    },
    subscribe: (...args: Parameters<firebase.firestore.Query['onSnapshot']>) => {
      return serializableFirestore.instantiate(firestore(), {
        query,
      }).onSnapshot(...args)
    },
    [identifier]: serializableFirestore.getIdentifier(query),
  }
}

interface StoreInput <T> {
  entities: T;
  firestore: Firestore;
}

export function createStore <T> (input: StoreInput<T>): FirebaseStoreType<T> {
  const entityNames = Object.keys(input.entities)
  const store: Record<string, unknown> = {}

  for (const path of entityNames) {
    store[path] = createFirebaseCollectionProxy(input.firestore, {
      path,
    })
  }

  return store as FirebaseStoreType<T>
}

export function unmarshall (snapshot: firebase.firestore.DocumentSnapshot): { id: string; data: unknown }
export function unmarshall (snapshot: firebase.firestore.QuerySnapshot | firebase.firestore.QueryDocumentSnapshot): { id: string; data: unknown }[]
export function unmarshall (snapshot: firebase.firestore.DocumentSnapshot | firebase.firestore.QuerySnapshot | firebase.firestore.QueryDocumentSnapshot): unknown {
  if ('data' in snapshot) {
    return {
      id: snapshot.id,
      data: snapshot.data(),
    }
  }

  return snapshot.docs.map((doc) => {
    return {
      id: doc.id,
      data: doc.data(),
    }
  })
}
