import { useContext } from 'react'
import context from '@app/context'
import { useRemoteStore } from '@models/view-adapters/hooks'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useStore () {
  const { store } = useContext(context)

  return useRemoteStore(store)
}
