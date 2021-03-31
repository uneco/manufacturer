import { useStore } from '@hooks/store'
import React from 'react'

const ProductsList: React.FC = () => {
  const store = useStore()
  const products = store.products.orderBy('price', 'asc').read()

  return <>
    {products.map((product) => (
      <li key={product.id}>
        {product.data.displayName} (${product.data.price.toLocaleString()})
      </li>
    ))}
  </>
}

export default ProductsList
