import firebase from 'firebase/app'
import stringify from 'json-stable-stringify'

export interface CollectionReference {
  path: string;
}

export interface DocumentReference {
  path: string;
}

export interface QueryPredicate {
  fieldPath: string | firebase.firestore.FieldPath;
  operator: firebase.firestore.WhereFilterOp;
  value: unknown;
}

export interface OrderClause {
  fieldPath: string | firebase.firestore.FieldPath;
  direction?: firebase.firestore.OrderByDirection;
}

export interface Query {
  collection: CollectionReference;
  orderBy?: OrderClause;
  predicates?: QueryPredicate[];
}

export type InstantiateInput = {
  collection: CollectionReference;
} | {
  document: DocumentReference;
} | {
  query: Query;
}

const cacheSpace: Record<string, unknown> = {}

function getIdentifier (input: unknown): string {
  return btoa(stringify(input))
}

function memo <T> (source: T): T {
  const key = stringify(source)

  if (cacheSpace[key]) {
    return cacheSpace[key] as T
  }
  const obj = JSON.parse(key)

  cacheSpace[key] = obj

  return obj
}

function instantiate (firestore: firebase.firestore.Firestore, input: { collection: CollectionReference }): firebase.firestore.CollectionReference
function instantiate (firestore: firebase.firestore.Firestore, input: { document: DocumentReference }): firebase.firestore.DocumentReference
function instantiate (firestore: firebase.firestore.Firestore, input: { query: Query }): firebase.firestore.Query
function instantiate (firestore: firebase.firestore.Firestore, input: InstantiateInput): firebase.firestore.CollectionReference | firebase.firestore.DocumentReference | firebase.firestore.Query {
  if ('collection' in input) {
    return firestore.collection(input.collection.path)
  }
  if ('document' in input) {
    return firestore.doc(input.document.path)
  }
  if ('query' in input) {
    let ref: firebase.firestore.CollectionReference | firebase.firestore.Query = firestore.collection(input.query.collection.path)

    if (input.query.orderBy) {
      ref = ref.orderBy(input.query.orderBy.fieldPath, input.query.orderBy.direction)
    }

    for (const predicate of input.query.predicates ?? []) {
      ref = ref.where(predicate.fieldPath, predicate.operator, predicate.value)
    }

    return ref
  }
  throw new Error('unsupported input')
}

const operators = {
  collection (path: string): CollectionReference {
    return memo({
      path,
    })
  },
  document (collection: CollectionReference, path?: string): DocumentReference {
    return memo({
      path: [
        collection.path,
        path ?? firebase.firestore().collection(collection.path).doc().id,
      ].join('/').replace(/\/+/g, '/'),
    })
  },
  where (source: CollectionReference | Query, predicate: QueryPredicate): Query {
    return memo({
      collection: ('collection' in source) ? source.collection : source,
      orderBy: ('orderBy' in source) ? source.orderBy : undefined,
      predicates: [
        ...(('predicates' in source) ? (source.predicates ?? []) : []),
        predicate,
      ],
    })
  },
  orderBy (source: CollectionReference | Query, orderBy: OrderClause): Query {
    return memo({
      collection: ('collection' in source) ? source.collection : source,
      orderBy,
      predicates: ('predicates' in source) ? (source.predicates ?? []) : [],
    })
  },
  instantiate,
  getIdentifier,
}

export default operators
