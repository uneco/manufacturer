/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type SchemaToType<T> = (
  T extends { type: 'integer' } ? number
  : T extends { type: 'number' } ? number
  : T extends { type: 'string' } ? string
  : T extends { type: 'boolean' } ? boolean
  : T extends { type: 'null' } ? null
  : T extends { type: 'array' } ? (
    T extends { items: infer X } ? SchemaToType<X>[]
    : unknown[]
  )
  : T extends { type: 'object' } ? (
    T extends { properties: object } ? {
      [K in keyof T['properties']]: SchemaToType<T['properties'][K]>
    }
    : object
  )
  : never
)

export type EntitySchemaToType<T, EX, SYNC> = (T extends { properties: object } ? {
  id: string;
  data: {
    [P in keyof T['properties']]: SchemaToType<T['properties'][P]>
  };
} : {}) & (T extends { collections: object } ? {
  collections: {
    [C in keyof T['collections']]: EntitySchemaToResourceType<T['collections'][C], EX, SYNC>
  };
} : {})

export type EntitySchemaToFetchableCollectionType<T, EX, SYNC> = (SYNC extends true ? {
  read(): EntitySchemaToType<T, EX, SYNC>[];
} : {
  fetch(): Promise<EntitySchemaToType<T, EX, SYNC>[]>;
  subscribe(subscriber: (data: EntitySchemaToType<T, EX, SYNC>[]) => void): () => void;
}) & {
    [K in keyof EX]: EX[K] extends ((...a: any[]) => any)
    ? ((...args: Parameters<EX[K]>) => EntitySchemaToFetchableCollectionType<T, EX, SYNC>)
    : never;
  }

export type EntitySchemaToResourceType<T, EX, SYNC> = EntitySchemaToFetchableCollectionType<T, EX, SYNC> & {
  doc(id: string): (SYNC extends true ? {
    read(): EntitySchemaToType<T, EX, SYNC>;
  } : {
    fetch(): Promise<EntitySchemaToType<T, EX, SYNC>>;
    subscribe(subscriber: (data: EntitySchemaToType<T, EX, SYNC>) => void): () => void;
  });
}

export type EntitiesSchemaToStoreType<T, EX, SYNC = false> = {
  [P in keyof T]: EntitySchemaToResourceType<T[P], EX, SYNC>
}
/* eslint-enable */

export type SynchronizeType<T> = T extends EntitiesSchemaToStoreType<infer T1, infer EX, false>
  ? EntitiesSchemaToStoreType<T1, EX, true>
  : never
