import DashboardPage from '@pages/Dashboard'
import LanesPage from '@pages/Lanes'
import OrdersPage from '@pages/Orders'
import ProductsPage from '@pages/Products'
import React from 'react'
import { Route } from 'react-router-dom'

const Routes: React.FC = () => {
  return (
    <>
      <Route exact path='/' component={DashboardPage} />
      <Route exact path='/products' component={ProductsPage} />
      <Route exact path='/orders' component={OrdersPage} />
      <Route exact path='/lanes' component={LanesPage} />
    </>
  )
}

export default Routes
