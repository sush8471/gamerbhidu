"use client"

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, ShoppingBag, ArrowLeft, ChevronDown } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { motion } from 'framer-motion'
import GamerBhiduNavbar from '@/components/sections/gamerbhidu-navbar'
import Footer from '@/components/sections/footer'

export default function CartPage() {
  const { cart, removeFromCart, totalPrice, clearCart, itemCount } = useCart()
  const [itemsExpanded, setItemsExpanded] = useState(true)

  return (
    <div className="min-h-screen bg-background">
      <GamerBhiduNavbar />
      
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">Shopping Cart</h1>
              <p className="text-muted-foreground">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
            </div>
            <Link href="/games" className="flex items-center gap-2 text-white hover:text-white/70 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Continue Shopping</span>
            </Link>
          </div>

          {cart.length === 0 ? (
            // Empty Cart State
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <ShoppingBag className="h-24 w-24 text-white/10 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">Add some games to get started!</p>
              <Link
                href="/games"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 text-white rounded-full hover:bg-white/25 transition-colors font-medium"
              >
                Browse Games
              </Link>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-card border border-white/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setItemsExpanded((v) => !v)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-white/[0.03] transition-colors select-none"
                    aria-expanded={itemsExpanded}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-white font-semibold text-sm sm:text-base">Your Items</span>
                      <span className="text-muted-foreground text-xs sm:text-sm font-medium">
                        ({itemCount})
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${
                        itemsExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      itemsExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="border-t border-white/10 divide-y divide-white/5">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 px-3 py-2.5 sm:px-4 hover:bg-white/[0.02] transition-colors"
                        >
                          <Link
                            href={`/games/${item.id}`}
                            className="relative w-11 h-14 sm:w-12 sm:h-16 flex-shrink-0 rounded-md overflow-hidden border border-white/10"
                          >
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </Link>

                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/games/${item.id}`}
                              className="text-white text-sm font-medium truncate block hover:text-white/80 transition-colors"
                            >
                              {item.name}
                            </Link>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-white font-semibold text-sm tabular-nums">₹{item.price}</span>
                              {item.originalPrice && (
                                <span className="text-muted-foreground line-through text-xs tabular-nums">₹{item.originalPrice}</span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 text-red-500/80 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors flex-shrink-0"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/10 px-4 py-2.5">
                      <button
                        onClick={clearCart}
                        className="text-muted-foreground hover:text-red-500 transition-colors text-xs font-medium"
                      >
                        Clear all items
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-white/10 p-6 rounded-lg sticky top-24"
                >
                  <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal ({itemCount} items)</span>
                      <span>₹{totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery</span>
                      <span className="text-green-500">FREE</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex justify-between text-white text-xl font-bold">
                      <span>Total</span>
                      <span>₹{totalPrice}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="w-full bg-[#25D366] text-white py-4 rounded-lg font-semibold hover:bg-[#20BA5A] transition-colors flex items-center justify-center gap-2 mb-3"
                  >
                    <FaWhatsapp className="h-5 w-5" />
                    Proceed to Checkout
                  </Link>

                  <p className="text-xs text-muted-foreground text-center">
                    Review your order and pay via UPI on the next step
                  </p>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-white/10 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Instant Delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>100% Original Games</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>24/7 Support</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>



      <Footer />
    </div>
  )
}
