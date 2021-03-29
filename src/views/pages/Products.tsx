import { useStore } from '@hooks/store'
import React from 'react'

const ProductsPage: React.FC = () => {
  const store = useStore()

  return <>
    <h1>Products</h1>
    <ul>
      {store.products.read().map((product) => <li key={product.id}>
        {product.data.displayName}
      </li>)}
    </ul>
  </>
}

export default ProductsPage
