import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { Wallet as WalletIcon, TrendingUp, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Wallet() {
  const { wallet, setWallet, user } = useAuthStore();
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/wallet').then(r => {
      setWallet(r.data.wallet);
      setTransactions(r.data.transactions || []);
    });
  }, []);

  const handleAddMoney = async () => {
    const amt = Number(amount);
    if (!amt || amt < 10) return toast.error('Minimum ₹10 required');
    setLoading(true);
    try {
      const { data } = await api.post('/wallet/order', { amount: amt });
      
      const options = {
        key: data.keyId,
        amount: data.order.amount,
        currency: 'INR',
        name: 'SkillSwap',
        description: 'Wallet Top-up',
        order_id: data.order.id,
        handler: async (response) => {
          const verifyRes = await api.post('/wallet/verify', { ...response, amount: amt });
          setWallet(verifyRes.data.wallet);
          const wRes = await api.get('/wallet');
          setTransactions(wRes.data.transactions || []);
          toast.success(`₹${amt} added successfully! 🎉`);
          setAmount('');
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#6C63FF' }
      };
      
      if (window.Razorpay) {
        new window.Razorpay(options).open();
      } else {
        toast.error('Payment gateway not loaded. Add Razorpay script to index.html');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    }
    setLoading(false);
  };

  const quickAmounts = [100, 250, 500, 1000];

  const txIcon = (type) => {
    if (type === 'credit') return <ArrowDownRight className="w-4 h-4 text-green-400" />;
    return <ArrowUpRight className="w-4 h-4 text-accent" />;
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold mb-1">Wallet</h1>
        <p className="text-white/40">Manage your balance and transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="glass-card p-6 relative overflow-hidden col-span-1">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
          <WalletIcon className="w-8 h-8 text-primary mb-4" />
          <p className="text-sm text-white/40">Available Balance</p>
          <p className="font-display text-4xl font-bold text-white mt-1">₹{wallet?.balance?.toFixed(0) || 0}</p>
          <p className="text-xs text-white/30 mt-2">≈ {Math.floor((wallet?.balance || 0) / 5)} minutes of learning</p>
        </motion.div>

        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.05}} className="glass-card p-6">
          <TrendingUp className="w-8 h-8 text-green-400 mb-4" />
          <p className="text-sm text-white/40">Total Spent</p>
          <p className="font-display text-4xl font-bold text-white mt-1">₹{wallet?.totalSpent?.toFixed(0) || 0}</p>
          <p className="text-xs text-white/30 mt-2">On learning sessions</p>
        </motion.div>

        {user?.isMentor && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="glass-card p-6">
            <ArrowDownRight className="w-8 h-8 text-accent-gold mb-4" />
            <p className="text-sm text-white/40">Total Earned</p>
            <p className="font-display text-4xl font-bold text-white mt-1">₹{wallet?.totalEarned?.toFixed(0) || 0}</p>
            <p className="text-xs text-white/30 mt-2">Withdrawable: ₹{wallet?.withdrawable?.toFixed(0) || 0}</p>
          </motion.div>
        )}
      </div>

      {/* Add Money */}
      <div className="glass-card p-6">
        <h2 className="font-display text-xl font-semibold mb-4">Add Money</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {quickAmounts.map(a => (
            <button key={a} onClick={() => setAmount(String(a))}
              className={`px-4 py-2 rounded-xl text-sm border transition-all ${amount === String(a) ? 'border-primary bg-primary/20 text-primary' : 'border-dark-border text-white/60 hover:border-primary/50'}`}>
              ₹{a}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-gold font-bold">₹</span>
            <input type="number" min="10" className="input pl-8"
              placeholder="Custom amount"
              value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <button onClick={handleAddMoney} disabled={loading || !amount}
            className="btn-primary flex items-center gap-2 px-6 disabled:opacity-50">
            <Plus className="w-4 h-4" />
            {loading ? 'Processing...' : 'Add Money'}
          </button>
        </div>
        <p className="text-xs text-white/30 mt-3">Secured by Razorpay • UPI, Net Banking, Cards accepted</p>
      </div>

      {/* Transactions */}
      <div className="glass-card p-6">
        <h2 className="font-display text-xl font-semibold mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-white/40 text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {transactions.map(t => (
              <div key={t._id} className="flex items-center gap-4 p-4 rounded-xl bg-dark-surface hover:bg-white/5 transition-colors">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${t.type === 'credit' ? 'bg-green-500/10' : 'bg-accent/10'}`}>
                  {txIcon(t.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.description}</p>
                  <p className="text-xs text-white/40">{new Date(t.createdAt).toLocaleString()}</p>
                </div>
                <div className={`text-sm font-bold ${t.type === 'credit' ? 'text-green-400' : 'text-accent'}`}>
                  {t.type === 'credit' ? '+' : '-'}₹{t.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
