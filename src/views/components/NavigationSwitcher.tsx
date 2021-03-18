import React from 'react'
import { Link, useRouteMatch } from 'react-router-dom'
import styled from 'styled-components'

const Container = styled.div`
  background: #47b;
  display: flex;
`

export type Props = {
  to: string;
  component?: typeof Link;
  exact?: boolean;
}

export const NavigationSwitcher: React.FC<Props> = ({ to, children, component, exact }) => {
  const SwitchLink = component ?? Link
  const match = useRouteMatch(to)

  function isMatched () {
    if (!match) {
      return false
    }
    if (exact === true) {
      return match.isExact
    }

    return true
  }

  return <Container>
    <SwitchLink to={to} className={isMatched() ? 'navigation-active' : undefined}>
      {children}
    </SwitchLink>
  </Container>
}
