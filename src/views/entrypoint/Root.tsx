import React from 'react'
import '@styles/App.css'
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
          <Routes />
        </Router>
      </context.Provider>
    </div>
  )
}

export default Root
