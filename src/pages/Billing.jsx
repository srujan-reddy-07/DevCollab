import React, { useState } from 'react';
import { useStore } from '../store/store';
import { usePresence } from '../hooks/usePresence';
import { CreditCard, Check, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Billing() {
  const proUser = useStore(state => state.proUser);
  const setProUser = useStore(state => state.setProUser);
  const logActivity = useStore(state => state.logActivity);

  const [checkoutMode, setCheckoutMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Broadcast presence on Billing page
  usePresence('billing_settings', null);

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate standard sandbox stripe card processing
    setTimeout(() => {
      setLoading(false);
      setProUser(true);
      setCheckoutMode(false);
      
      // Log upgraded status
      logActivity('Upgraded organization account to PRO Tier successfully!');

      // Celebrate!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }, 1800);
  };

  const handleDowngrade = () => {
    setProUser(false);
    logActivity('Downgraded account to FREE Tier.');
  };

  const freeFeatures = [
    '1 active workspace',
    'Up to 3 collaborative projects',
    'Up to 5 total members',
    'Standard Kanban, List, and Calendars',
    'Basic Wiki Docs & Code Snippet manager'
  ];

  const proFeatures = [
    'Unlimited active workspaces',
    'Unlimited projects',
    'Unlimited team members',
    'Full AI Project Assistant (summaries, blockers, standups)',
    'Full AI Code Reviewer (bug scans, security checks, quality ratings)',
    'Wiki Page Version Control & Reversion',
    'Priority real-time events priority'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header Panel */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          Billing & Subscription Plan
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', marginTop: '0.4rem' }}>
          Select or toggle subscriptions instantly inside this sandboxed billing simulation.
        </p>
      </div>

      {checkoutMode ? (
        /* Checkout Panel */
        <form 
          onSubmit={handleCheckoutSubmit}
          className="glass-panel animate-fade"
          style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '480px', margin: '0 auto', width: '100%' }}
        >
          <h3 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem', fontSize: '1.1rem' }}>
            <CreditCard size={18} className="logo-icon" /> Sandbox checkout gate
          </h3>

          <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <AlertCircle size={15} style={{ color: 'hsl(var(--accent-blue))', flexShrink: 0, marginTop: '0.1rem' }} />
            <span style={{ color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>
              This billing module is running in <strong>SANDBOX Mode</strong>. Utilize any fake card details (e.g. <code>4242 4242...</code>) to simulate checking out. No charges will occur.
            </span>
          </div>

          {/* Card Number */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Credit Card Number</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16))}
              required
              disabled={loading}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Expiry */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Expiration</label>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value.substring(0, 5))}
                required
                disabled={loading}
              />
            </div>

            {/* CVC */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>CVC</label>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="123"
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <button 
              type="submit" 
              className="glass-button primary" 
              style={{ justifyContent: 'center', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? 'Authorizing Sandbox Payment...' : 'Submit Sandbox Payment ($15/mo)'}
            </button>
            <button 
              type="button" 
              onClick={() => setCheckoutMode(false)}
              className="glass-button" 
              style={{ justifyContent: 'center', padding: '0.75rem' }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        /* Pricing Cards layout */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }} className="animate-fade">
          {/* Free Tier */}
          <div 
            className="glass-panel" 
            style={{ 
              padding: '2rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.5rem',
              border: !proUser ? '1.5px solid hsl(var(--primary))' : '1px solid rgba(255,255,255,0.06)',
              position: 'relative'
            }}
          >
            {!proUser && (
              <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(139,92,246,0.15)', color: 'hsl(var(--primary))', fontSize: '0.65rem', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 600 }}>
                Active Plan
              </span>
            )}

            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'white' }}>Free Tier</h3>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.2rem' }}>Ideal for solo student builders.</p>
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>$0</span>
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>/ month</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
              {freeFeatures.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                  <Check size={14} style={{ color: 'hsl(var(--accent-blue))' }} /> <span>{f}</span>
                </div>
              ))}
            </div>

            {proUser ? (
              <button 
                onClick={handleDowngrade}
                className="glass-button" 
                style={{ width: '100%', justifyContent: 'center', marginTop: 'auto', padding: '0.6rem' }}
              >
                Downgrade to Free
              </button>
            ) : (
              <button 
                disabled 
                className="glass-button" 
                style={{ width: '100%', justifyContent: 'center', marginTop: 'auto', padding: '0.6rem', opacity: 0.5, cursor: 'default' }}
              >
                Currently Active
              </button>
            )}
          </div>

          {/* Pro Tier */}
          <div 
            className="glass-panel" 
            style={{ 
              padding: '2rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.5rem',
              border: proUser ? '1.5px solid hsl(var(--accent-emerald))' : '1px solid rgba(255,255,255,0.06)',
              boxShadow: proUser ? '0 10px 30px -5px rgba(16, 185, 129, 0.1)' : 'none',
              position: 'relative'
            }}
          >
            {proUser && (
              <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(16,185,129,0.15)', color: 'hsl(var(--accent-emerald))', fontSize: '0.65rem', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 600 }}>
                Active Plan
              </span>
            )}

            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Pro Tier <Sparkles size={16} style={{ color: 'hsl(var(--accent-amber))' }} />
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.2rem' }}>Engineered for full-scale development teams.</p>
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>$15</span>
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>/ month</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
              {proFeatures.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                  <Check size={14} style={{ color: 'hsl(var(--accent-emerald))' }} /> <span>{f}</span>
                </div>
              ))}
            </div>

            {proUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'hsl(var(--accent-emerald))', fontSize: '0.8rem', justifyContent: 'center', padding: '0.6rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <ShieldCheck size={16} /> <span>Subscription Unlocked via Sandbox</span>
              </div>
            ) : (
              <button 
                onClick={() => setCheckoutMode(true)}
                className="glass-button primary" 
                style={{ width: '100%', justifyContent: 'center', marginTop: 'auto', padding: '0.6rem' }}
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
