/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useRef, useState } from 'react'
import type { EntitiesSchemaToStoreType, SynchronizeType } from '@models/document-store-types'
import { identifier, unmarshall } from '@models/store'

interface Resource {
  identifier: string;
  subscribe: (subscriber: (data: unknown) => void) => (() => void);
}

class ResourceReference<T> {
  public referenceCount = 0
  public readonly disposers: Set<() => void> = new Set()
  public data: T | undefined
  public awaiter: Promise<void>
  public resolver!: () => void
  public hasData = false
  private subscribers: ((data: T) => void)[] = []

  constructor (
    public resource: Resource,
  ) {
    this.awaiter = new Promise((resolve) => {
      this.resolver = resolve
    })
  }

  public connect (): void {
    this.registerDisposer(this.resource.subscribe((snapshot) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = unmarshall(snapshot as any) as unknown as T

      this.data = data
      if (!this.hasData) {
        this.hasData = true
        this.resolver()
      }
      for (const subscriber of this.subscribers) {
        subscriber(data)
      }
    }))
  }

  public subscribe (subscriber: (data: T) => void) {
    this.subscribers.push(subscriber)
  }

  public registerDisposer (disposer: () => void) {
    this.disposers.add(disposer)
  }

  public dispose () {
    for (const disposer of this.disposers) {
      disposer()
    }
  }

  public getData (): T {
    if (this.data) {
      return this.data
    }
    throw this.awaiter
  }
}

interface Subscription {
  getReference: (resource: Resource) => ResourceReference<unknown> | undefined;
  getOrCreateReference: (resource: Resource) => ResourceReference<unknown>;
  subscribe: (reference: ResourceReference<unknown>, updater: (data: unknown) => void) => void;
  unsubscribe: () => void;
}

const referenceRegistry: Set<[unknown, Set<ResourceReference<unknown>>]> = new Set()
const subscriptions: Set<[unknown, Subscription]> = new Set()

const createSubscription = (store: unknown, registry: Set<[unknown, Set<ResourceReference<unknown>>]>, reuseTag: unknown): Subscription => {
  const [, exists] = Array.from(subscriptions).find(([tag]) => tag === reuseTag) ?? []

  if (exists) {
    return exists
  }

  const resources = new Set<Resource>()

  function getRegistryByStore (index: unknown): Set<ResourceReference<unknown>> {
    const [, registryByStore] = Array.from(registry).find(([i]) => i === index) ?? []

    if (registryByStore) {
      return registryByStore
    }

    registry.add([index, new Set()])

    return getRegistryByStore(index)
  }

  const registryByStore = getRegistryByStore(store)

  function getReference (resource: Resource) {
    return Array.from(registryByStore ?? []).find((ref) => ref.resource.identifier === resource.identifier)
  }

  function getOrCreateReference (resource: Resource) {
    return getReference(resource) ?? (() => {
      const subscription = new ResourceReference(resource)

      registryByStore.add(subscription)

      return subscription
    })()
  }

  const subscription: Subscription = {
    getReference,
    getOrCreateReference,
    subscribe: (reference, updater) => {
      if (Array.from(resources).find((resource) => resource.identifier === reference.resource.identifier)) {
        return
      }
      resources.add(reference.resource)

      reference.subscribe((data) => {
        updater(data)
      })

      reference.referenceCount++
    },
    unsubscribe: () => {
      for (const resource of Array.from(resources)) {
        const reference = getReference(resource)

        if (!reference) {
          continue
        }

        reference.referenceCount--

        if (reference.referenceCount <= 0) {
          reference.dispose()
          registryByStore.delete(reference)
        }

        resources.delete(resource)
      }
    },
  }

  subscriptions.add([reuseTag, subscription])

  return subscription
}

function injectRead <T extends object> (injectionTarget: T, sub: Subscription, references: ResourceReference<unknown>[]): T {
  function wrapResource (target: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resource = target as any

    if (!resource) {
      return resource
    }
    const resourceId = resource[identifier]

    if (!resourceId) {
      return resource
    }

    return {
      ...resource,
      where: (...args: unknown[]) => {
        return wrapResource(resource.where(...args))
      },
      orderBy: (...args: unknown[]) => {
        return wrapResource(resource.orderBy(...args))
      },
      read: () => {
        const reference = sub.getOrCreateReference({
          identifier: resourceId,
          ...resource,
        })

        references.push(reference)
        reference.connect()

        return reference.getData()
      },
    }
  }

  return new Proxy<T>(injectionTarget, {
    get (target, propertyKey) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resource = (target as any)[propertyKey]

      return wrapResource(resource)
    },
  })
}

export function useRemoteStore <
  T extends EntitiesSchemaToStoreType<unknown, unknown, false>
> (store: T): SynchronizeType<T> {
  const subscriptionReuseTag = useRef({})
  const sub = createSubscription(store, referenceRegistry, subscriptionReuseTag)
  const references: ResourceReference<unknown>[] = []
  const [, setState] = useState<string>('[]')

  useEffect(() => {
    for (const reference of references) {
      sub.subscribe(reference, (data) => {
        setState((previousString) => {
          const previous = JSON.parse(previousString) as [string, string][]
          let replaced = false

          return JSON.stringify(previous.map<[string, string]>(([id, oldData]) => {
            if (id === reference.resource.identifier) {
              replaced = true

              return [id, JSON.stringify(data)]
            }

            return [id, oldData]
          }).concat(replaced ? [] : [[reference.resource.identifier, JSON.stringify(data)]]))
        })
      })
    }

    return () => {
      sub.unsubscribe()
    }
  }, [])

  return injectRead(store, sub, references) as unknown as SynchronizeType<T>
}
