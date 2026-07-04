"use client"

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { FaWhatsapp, FaInstagram } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import SteamRushNavbar from '@/components/sections/steamrush-navbar'
import Footer from '@/components/sections/footer'

export default function CartPage() {
  const { cart, removeFromCart, totalPrice, clearCart, itemCount } = useCart()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  const handleCheckoutClick = () => {
    // Generate order ID
    const newOrderId = `SR${Date.now().toString().slice(-8)}`
    setOrderId(newOrderId)
    setPaymentConfirmed(false) // Reset confirmation when opening modal
    setShowConfirmation(true)
  }

  const handleWhatsAppRedirect = () => {
    const message = `🎮 *Gamer Bhidu Order ${orderId}*\n\n📦 *Games (${itemCount}):*\n${
      cart.map((item, i) => `${i + 1}. ${item.name} - ₹${item.price}`).join('\n')
    }\n\n💰 *Total: ₹${totalPrice}*\n\nI'd like to proceed with this order!`
    
    const whatsappUrl = `https://wa.me/917752805529?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    
    // Close confirmation modal
    setShowConfirmation(false)
  }

  const handleInstagramRedirect = () => {
    const message = `🎮 Gamer Bhidu Order ${orderId}\n\n📦 Games (${itemCount}):\n${
      cart.map((item, i) => `${i + 1}. ${item.name} - ₹${item.price}`).join('\n')
    }\n\n💰 Total: ₹${totalPrice}\n\nI'd like to proceed with this order!`
    
    // Open Instagram profile - user can then send DM with order details
    window.open('https://www.instagram.com/steamrush_official', '_blank')
    
    // Copy order details to clipboard for easy pasting
    navigator.clipboard.writeText(message).then(() => {
      console.log('Order details copied to clipboard!')
    }).catch(err => {
      console.error('Failed to copy:', err)
    })
    
    // Close confirmation modal
    setShowConfirmation(false)
  }

  return (
    <div className="min-h-screen bg-[#080A10]">
      <SteamRushNavbar />
      
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">Shopping Cart</h1>
              <p className="text-[#B0B8D0]">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
            </div>
            <Link href="/games" className="flex items-center gap-2 text-[#3B82F6] hover:text-[#2563EB] transition-colors">
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
              <ShoppingBag className="h-24 w-24 text-[#202838] mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
              <p className="text-[#B0B8D0] mb-8">Add some games to get started!</p>
              <Link
                href="/games"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#3B82F6] text-white rounded-full hover:bg-[#2563EB] transition-colors font-medium"
              >
                Browse Games
              </Link>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-[#121622] border border-[#202838] p-4 rounded-lg flex items-center gap-4 hover:border-[#3B82F6]/30 transition-all"
                  >
                    <div className="relative w-24 h-32 flex-shrink-0">
                      {item.id === 'gta-v' || item.name.toLowerCase().includes('grand theft auto v') ? (
                        <Link href="/games/gta-v">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover rounded hover:opacity-80 transition-opacity"
                          />
                        </Link>
                      ) : (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                        />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1">
                        {item.id === 'gta-v' || item.name.toLowerCase().includes('grand theft auto v') ? (
                          <Link href="/games/gta-v" className="hover:text-[#3B82F6] transition-colors">
                            {item.name}
                          </Link>
                        ) : (
                          item.name
                        )}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[#3B82F6] font-bold text-xl">₹{item.price}</span>
                        {item.originalPrice && (
                          <span className="text-[#B0B8D0] line-through text-sm">₹{item.originalPrice}</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      aria-label="Remove from cart"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </motion.div>
                ))}

                {/* Clear Cart Button */}
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="w-full text-[#B0B8D0] hover:text-red-500 transition-colors py-2 text-sm"
                  >
                    Clear All Items
                  </button>
                )}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#121622] border border-[#202838] p-6 rounded-lg sticky top-24"
                >
                  <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-[#B0B8D0]">
                      <span>Subtotal ({itemCount} items)</span>
                      <span>₹{totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-[#B0B8D0]">
                      <span>Delivery</span>
                      <span className="text-green-500">FREE</span>
                    </div>
                    <div className="border-t border-[#202838] pt-3 flex justify-between text-white text-xl font-bold">
                      <span>Total</span>
                      <span>₹{totalPrice}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckoutClick}
                    className="w-full bg-[#25D366] text-white py-4 rounded-lg font-semibold hover:bg-[#20BA5A] transition-colors flex items-center justify-center gap-2 mb-3"
                  >
                    <FaWhatsapp className="h-5 w-5" />
                    Checkout
                  </button>

                  <p className="text-xs text-[#B0B8D0] text-center">
                    You'll be redirected to WhatsApp to complete your order
                  </p>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-[#202838] space-y-2 text-sm text-[#B0B8D0]">
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

      {/* Payment Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#121622] border border-[#202838] rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Scrollable Content */}
              <div className="max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                <div className="p-8 space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Order Ready!</h2>
                    <p className="text-[#B0B8D0] text-sm">Complete your payment to get instant access</p>
                  </div>

                  {/* Order Details */}
                  <div className="bg-[#080A10]/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#B0B8D0]">Order ID</span>
                      <span className="text-white font-semibold">{orderId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#B0B8D0]">Items</span>
                      <span className="text-white font-semibold">{itemCount}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-[#202838]">
                      <span className="text-white font-bold">Total</span>
                      <span className="text-2xl font-bold text-[#00D2FF]">₹{totalPrice}</span>
                    </div>
                  </div>

                  {/* QR Code Section */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-[#B0B8D0] mb-4">Scan QR Code to Pay via UPI</p>
                      
                      <div className="bg-white p-4 rounded-xl inline-block">
                        <Image
                          src="/payment-qr.png"
                          alt="Payment QR Code"
                          width={200}
                          height={200}
                          className="w-full h-auto"
                          priority
                        />
                      </div>

                      {/* UPI ID */}
                      <div className="mt-4 px-4 py-3 bg-[#080A10]/50 rounded-lg">
                        <p className="text-xs text-[#B0B8D0] mb-1">UPI ID</p>
                        <p className="text-sm text-white font-mono font-semibold">sushantcha00123@okicici</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Confirmation Checkbox */}
                  <div className="bg-[#080A10]/30 border border-[#202838] rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={paymentConfirmed}
                          onChange={(e) => setPaymentConfirmed(e.target.checked)}
                          className="w-5 h-5 rounded border-2 border-[#202838] bg-transparent checked:bg-[#00D2FF] checked:border-[#00D2FF] cursor-pointer transition-all focus:ring-2 focus:ring-[#00D2FF]/50 focus:ring-offset-2 focus:ring-offset-[#121622]"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium group-hover:text-[#00D2FF] transition-colors">
                          I have completed the payment
                        </p>
                        <p className="text-xs text-[#B0B8D0] mt-1">
                          Please check this box after making the UPI payment to proceed
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#202838]"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 text-xs text-[#B0B8D0] bg-[#121622]">THEN</span>
                    </div>
                  </div>

                  {/* WhatsApp Button */}
                  <button
                    onClick={handleWhatsAppRedirect}
                    disabled={!paymentConfirmed}
                    className={`w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      paymentConfirmed
                        ? 'bg-[#25D366] text-white hover:bg-[#20BA5A] cursor-pointer'
                        : 'bg-[#202838] text-[#4A5568] cursor-not-allowed opacity-50'
                    }`}
                  >
                    <FaWhatsapp className="h-5 w-5" />
                    {paymentConfirmed ? 'Continue to WhatsApp' : 'Confirm Payment First'}
                  </button>

                  {/* Instagram Button */}
                  <button
                    onClick={handleInstagramRedirect}
                    disabled={!paymentConfirmed}
                    className={`w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      paymentConfirmed
                        ? 'bg-gradient-to-r from-[#833AB4] via-[#C13584] to-[#E1306C] text-white hover:opacity-90 cursor-pointer'
                        : 'bg-[#202838] text-[#4A5568] cursor-not-allowed opacity-50'
                    }`}
                  >
                    <FaInstagram className="h-5 w-5" />
                    {paymentConfirmed ? 'Contact via Instagram' : 'Confirm Payment First'}
                  </button>

                  {/* Info Text */}
                  <p className="text-xs text-[#B0B8D0] text-center">
                    {paymentConfirmed 
                      ? 'Choose WhatsApp or Instagram to share your order details for game delivery' 
                      : 'Complete payment and check the box above to continue'
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
