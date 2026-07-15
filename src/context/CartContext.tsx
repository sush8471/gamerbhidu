"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  originalPrice?: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  isInCart: (id: string) => boolean
  totalPrice: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('gamerbhidu-cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart:', error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('gamerbhidu-cart', JSON.stringify(cart))
    }
  }, [cart, isLoaded])

  // Memoize callbacks to prevent unnecessary re-renders
  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id)
      if (exists) {
        return prev
      }
      return [...prev, item]
    })
  }, [])

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const isInCart = useCallback((id: string) => {
    return cart.some(item => item.id === id)
  }, [cart])

  // Memoize computed values
  const totalPrice = useMemo(() => cart.reduce((sum, item) => sum + item.price, 0), [cart])
  const itemCount = useMemo(() => cart.length, [cart])

  // Memoize context value
  const value = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart,
    totalPrice,
    itemCount
  }), [cart, addToCart, removeFromCart, clearCart, isInCart, totalPrice, itemCount])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
