'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { X, CreditCard, Zap } from 'lucide-react';

interface CreditPurchaseProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (quantity: number) => Promise<void>;
  loading?: boolean;
}

const CREDIT_PRICE = 1.50; // $1.50 per credit

const PRESET_QUANTITIES = [
  { amount: 5, bonus: 0, popular: false },
  { amount: 10, bonus: 2, popular: true },
  { amount: 25, bonus: 5, popular: false },
  { amount: 50, bonus: 15, popular: false },
];

export default function CreditPurchase({ isOpen, onClose, onPurchase, loading }: CreditPurchaseProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(10);
  const [customQuantity, setCustomQuantity] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const finalQuantity = useCustom ? parseInt(customQuantity) || 1 : selectedQuantity;
  const selectedPreset = PRESET_QUANTITIES.find(p => p.amount === selectedQuantity);
  const bonusCredits = useCustom ? 0 : (selectedPreset?.bonus || 0);
  const totalCredits = finalQuantity + bonusCredits;
  const totalPrice = finalQuantity * CREDIT_PRICE;

  const handlePurchase = async () => {
    if (finalQuantity >= 1) {
      await onPurchase(finalQuantity);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#a259ff]" />
            Purchase Credits
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Credit Packages */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-medium text-gray-300">Choose Package</h3>
          
          <div className="grid gap-3">
            {PRESET_QUANTITIES.map((preset) => (
              <motion.div
                key={preset.amount}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                  selectedQuantity === preset.amount && !useCustom
                    ? 'border-[#a259ff] bg-[#a259ff]/10'
                    : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
                }`}
                onClick={() => {
                  setSelectedQuantity(preset.amount);
                  setUseCustom(false);
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-semibold text-white">
                      {preset.amount} Credits
                    </div>
                    {preset.bonus > 0 && (
                      <div className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                        +{preset.bonus} Bonus
                      </div>
                    )}
                    {preset.popular && (
                      <div className="px-2 py-1 bg-[#a259ff]/20 text-[#a259ff] text-xs rounded-full font-medium">
                        Popular
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-white">
                      ${(preset.amount * CREDIT_PRICE).toFixed(2)}
                    </div>
                    {preset.bonus > 0 && (
                      <div className="text-xs text-gray-400">
                        Total: {preset.amount + preset.bonus} credits
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Custom Amount */}
            <motion.div
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                useCustom
                  ? 'border-[#a259ff] bg-[#a259ff]/10'
                  : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
              }`}
              onClick={() => setUseCustom(true)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-semibold text-white">Custom Amount</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={customQuantity}
                    onChange={(e) => {
                      setCustomQuantity(e.target.value);
                      setUseCustom(true);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-20 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-2 py-1 text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                    placeholder="10"
                  />
                  <span className="text-sm text-gray-400">credits</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-[#2a2a2a]/50 rounded-xl p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Credits to purchase:</span>
              <span className="text-white">{finalQuantity}</span>
            </div>
            {bonusCredits > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Bonus credits:</span>
                <span className="text-green-400">+{bonusCredits}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Price per credit:</span>
              <span className="text-white">${CREDIT_PRICE.toFixed(2)}</span>
            </div>
            <hr className="border-[#3a3a3a] my-2" />
            <div className="flex justify-between font-semibold">
              <span className="text-white">Total credits:</span>
              <span className="text-[#a259ff] flex items-center gap-1">
                <Zap className="w-4 h-4" />
                {totalCredits}
              </span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-white">Total price:</span>
              <span className="text-white">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            intent="secondary"
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            className="flex-1 bg-[#a259ff] hover:bg-[#9333ea]"
            disabled={loading || finalQuantity < 1}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              `Purchase for $${totalPrice.toFixed(2)}`
            )}
          </Button>
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Credits never expire and can be used for any workflow generation.
        </p>
      </motion.div>
    </div>
  );
} 