import React, { Suspense } from 'react'
import '@styles/App.scss'
import { BrowserRouter as Router } from 'react-router-dom'
import Routes from './Routes'
import NavigationArea from '@partials/NavigationArea'
import context, { store } from '@app/context'

const Root: React.FC = () => {
  return (
    <div className="App">
      <context.Provider value={{
        store,
      }}>
        <Router>
          <NavigationArea />
          <Suspense fallback={'loading...'}>
            <Routes />
          </Suspense>
        </Router>
      </context.Provider>
      <context.Provider value={{
        store,
      }}>
        <Router>
          <NavigationArea />
          <Suspense fallback={'loading...'}>
            <Routes />
          </Suspense>
        </Router>
      </context.Provider>
    </div>
  )
}

export default Root
