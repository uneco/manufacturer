import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  height: 350px;
`

const OrdersPage: React.FC = () => {
  return <Container>
    <h1>Orders</h1>
  </Container>
}

export default OrdersPage
