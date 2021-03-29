/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect } from 'react'
import type { EntitiesSchemaToStoreType, SynchronizeType } from '@models/document-store-types'

const subscriptionCounter: Record<string, number> = {}
const createSubscription = (counter: Record<string, number>) => {
  const paths = new Set<string>()

  return {
    unsubscribe: () => {
      for (const path of Array.from(paths)) {
        if (counter[path] <= 0) {
          throw new Error('invalid unsubscribe')
        }
        counter[path] -= 1
        if (counter[path] === 0) {
          Reflect.deleteProperty(counter, path)
        }
      }
      console.log('unsubscribed')
      console.log(JSON.stringify(subscriptionCounter, null, 2))
    },
  }
}

export function useRemoteStore <
  T extends EntitiesSchemaToStoreType<unknown, unknown, false>
> (store: T): SynchronizeType<T> {
  const sub = createSubscription(subscriptionCounter)

  useEffect(() => {
    return () => sub.unsubscribe()
  }, [])

  return new Proxy<T>(store, {
    get (target, p, receiver) {
      console.log(target, p, receiver)
    },
  }) as unknown as SynchronizeType<T>
}
