import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { NavigationSwitcher } from '@components/NavigationSwitcher'

const NavContainer = styled.nav`
  background: #47b;
  display: flex;
  height: 50px;
`

const NavLink = styled(Link)`
  height: 100%;
  padding: 0 1rem;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;

  &.navigation-active {
    background: rgba(0, 0, 0, 0.2);
  }
`

const NavigationArea: React.FC = () => {
  return <NavContainer>
    <NavigationSwitcher component={NavLink} exact to={'/'}>Dashboard</NavigationSwitcher>
    <NavigationSwitcher component={NavLink} to={'/products'}>Products</NavigationSwitcher>
    <NavigationSwitcher component={NavLink} to={'/orders'}>Orders</NavigationSwitcher>
    <NavigationSwitcher component={NavLink} to={'/lanes'}>Lanes</NavigationSwitcher>
  </NavContainer>
}

export default NavigationArea
