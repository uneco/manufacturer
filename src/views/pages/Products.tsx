import RoundedList from '@components/RoundedList'
import ProductsList from '@partials/ProductsList'
import React, { Suspense } from 'react'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  height: 350px;
`

const ProductsPage: React.FC = () => {
  return <Container>
    <h1>Products</h1>
    <RoundedList>
      <Suspense fallback={<li>loading...</li>}>
        <ProductsList />
      </Suspense>
    </RoundedList>
  </Container>
}

export default ProductsPage
