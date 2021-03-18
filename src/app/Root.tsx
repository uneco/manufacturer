import React from 'react'
import '@styles/App.css'
import { BrowserRouter as Router } from 'react-router-dom'
import Routes from './Routes'
import NavigationArea from '@partials/NavigationArea'

const Root: React.FC = () => {
  return (
    <div className="App">
      <Router>
        <NavigationArea />
        <Routes />
      </Router>
    </div>
  )
}

export default Root
