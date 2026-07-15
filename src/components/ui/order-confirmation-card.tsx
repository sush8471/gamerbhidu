import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface OrderConfirmationCardProps {
  orderId: string;
  paymentMethod: string;
  dateTime: string;
  totalAmount: string;
  onGoToAccount: () => void;
  title?: string;
  buttonText?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const OrderConfirmationCard: React.FC<OrderConfirmationCardProps> = ({
  orderId,
  paymentMethod,
  dateTime,
  totalAmount,
  onGoToAccount,
  title = "Your order has been successfully submitted",
  buttonText = "Go to my account",
  icon = <CheckCircle2 className="h-12 w-12 text-green-500" />,
  className,
}) => {
  const [showQREnlarged, setShowQREnlarged] = React.useState(false);

  const details = [
    { label: "Order ID", value: orderId },
    { label: "Payment Method", value: paymentMethod },
    { label: "Date & Time", value: dateTime },
  ];

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring" as const,
        stiffness: 100 
      } 
    },
  };

  const handleDownloadQR = () => {
    // Create a link to download the QR code
    const link = document.createElement('a');
    link.href = '/payment-qr.png';
    link.download = 'GamerBhidu-Payment-QR.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          aria-live="polite"
          className={cn(
            "w-full max-w-md rounded-2xl border border-slate-700/50 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl overflow-hidden",
            className
          )}
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
        >
          {/* Scrollable Content */}
          <div className="max-h-[85vh] overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
            <div className="flex flex-col items-center space-y-7 text-center">
              {/* Success Icon */}
              <motion.div variants={itemVariants} className="flex items-center justify-center">
                {icon}
              </motion.div>

              {/* Title */}
              <motion.h2 
                variants={itemVariants} 
                className="text-2xl font-bold text-white tracking-tight"
                style={{ letterSpacing: '-0.02em' }}
              >
                {title}
              </motion.h2>

              {/* Order Details Section */}
              <motion.div variants={itemVariants} className="w-full space-y-5 pt-2">
                {details.map((item, index) => (
                  <div
                    key={item.label}
                    className="flex items-start justify-between text-left"
                  >
                    <span className="text-sm font-medium text-slate-400 tracking-wide uppercase" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
                      {item.label}
                    </span>
                    <span className="text-[15px] font-semibold text-slate-100 text-right max-w-[60%]" style={{ lineHeight: '1.4', letterSpacing: '0.01em' }}>
                      {item.value}
                    </span>
                  </div>
                ))}

                {/* Total - Prominent Display */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <span className="text-base font-bold text-white tracking-wide">
                    Total
                  </span>
                  <span className="text-3xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
                    {totalAmount}
                  </span>
                </div>
              </motion.div>

              {/* QR Code Payment Section */}
              <motion.div variants={itemVariants} className="w-full pt-4 space-y-3">
                <div className="text-center">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">
                    Scan QR to Pay via UPI
                  </p>
                  
                  {/* QR Code with Click to Enlarge */}
                  <button
                    onClick={() => setShowQREnlarged(true)}
                    className="relative mx-auto w-52 h-52 rounded-2xl overflow-hidden border-2 border-slate-700/50 bg-white/5 backdrop-blur-sm p-2 group hover:border-blue-500/50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    aria-label="Click to enlarge QR code"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Image
                      src="/payment-qr.png"
                      alt="UPI QR Code"
                      width={192}
                      height={192}
                      className="rounded-xl relative z-10"
                      priority
                    />
                    {/* Click hint */}
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="px-3 py-1 bg-black/80 text-white text-xs rounded-full backdrop-blur-sm">
                        Click to enlarge
                      </span>
                    </div>
                  </button>

                  {/* UPI ID Display */}
                  <div className="mt-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">UPI ID</p>
                    <p className="text-sm text-white font-mono font-semibold">sushantcha00123@okicici</p>
                  </div>
                </div>

                {/* OR Divider */}
                <div className="relative py-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700/50"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 text-xs text-slate-400 bg-gradient-to-b from-slate-900 to-slate-950 font-medium">OR</span>
                  </div>
                </div>
              </motion.div>

              {/* Action Button */}
              <motion.div variants={itemVariants} className="w-full">
                <Button
                  onClick={onGoToAccount}
                  className="w-full h-12 text-[15px] font-semibold bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
                  size="lg"
                >
                  {buttonText}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Full Screen QR Code View */}
      <AnimatePresence>
        {showQREnlarged && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={() => setShowQREnlarged(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-8 border border-slate-700/50 shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowQREnlarged(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 text-white transition-all hover:scale-110 active:scale-95"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center space-y-6">
                <h3 className="text-2xl font-bold text-white">Scan to Pay via UPI</h3>
                
                {/* Full Size QR Code */}
                <div className="bg-white p-6 rounded-2xl shadow-2xl">
                  <Image
                    src="/payment-qr.png"
                    alt="UPI QR Code - Full Size"
                    width={400}
                    height={400}
                    className="w-full h-auto"
                    priority
                  />
                </div>

                {/* UPI ID */}
                <div className="w-full max-w-md px-6 py-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 text-center">UPI ID</p>
                  <p className="text-lg text-white font-mono font-semibold text-center">sushantcha00123@okicici</p>
                </div>

                {/* Download Button */}
                <Button
                  onClick={handleDownloadQR}
                  className="w-full max-w-md h-12 bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-green-500/30"
                  size="lg"
                >
                  <Download className="w-5 h-5" />
                  Download QR Code (HD)
                </Button>

                <p className="text-sm text-slate-400 text-center">
                  Scan with any UPI app: Google Pay, PhonePe, Paytm, etc.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
