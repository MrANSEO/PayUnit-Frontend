// frontend/src/components/PaymentPage.jsx - VERSION AMÉLIORÉE
import React, { useState } from 'react';
import axios from 'axios';

const API_KEY = process.env.REACT_APP_API_KEY || 'pk_1696f0e8afb658232ff78d2043ae32392c0ced639e8f5f8f';
const MERCHANT_ID = process.env.REACT_APP_MERCHANT_ID || '690fef3ee9d765d23af00602';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
const PAYMENT_AMOUNT = 10000;

export default function PaymentPage() {
  const [phoneSuffix, setPhoneSuffix] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('orange');
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (phoneSuffix.length !== 9 || !/^\d{9}$/.test(phoneSuffix)) {
      alert('Veuillez entrer un numéro de téléphone valide (9 chiffres).');
      return;
    }

    const fullPhone = `237${phoneSuffix}`;

    setLoading(true);
    setStatus('pending');
    setMessage('💳 Paiement en cours...');

    try {
      const url = `${BACKEND_URL}/api/payment/initialize`;

      console.log('🔄 Envoi vers:', url);
      console.log('📤 Données:', {
        total_amount: PAYMENT_AMOUNT,
        currency: 'XAF',
        payment_country: 'CM',
        customer_phone: fullPhone,
        payment_method: paymentMethod.toUpperCase()
      });

      const response = await axios.post(url, {
        total_amount: PAYMENT_AMOUNT,
        currency: 'XAF',
        payment_country: 'CM',
        customer_phone: fullPhone,
        payment_method: paymentMethod.toUpperCase()
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000,
        validateStatus: () => true
      });

      console.log('✅ Réponse:', response.status, response.data);

      if (response.status >= 200 && response.status < 300 && response.data?.status === 'SUCCESS') {
        setMessage(`✅ Paiement initialisé ! Veuillez confirmer sur votre ${paymentMethod === 'orange' ? 'Orange Money' : 'Mobile Money'}.`);
        setStatus('success');
      } else {
        const serverMsg = response.data?.message || response.data?.error || 'Erreur inconnue';
        setMessage(`❌ ${serverMsg}`);
        setStatus('failed');
      }
    } catch (err) {
      console.error('❌ Erreur:', err);
      let errorMsg = 'Erreur réseau ou serveur';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message === 'Network Error') {
        errorMsg = 'Impossible de contacter le serveur';
      }
      setMessage(`❌ ${errorMsg}`);
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Frais de la demande</h1>
        <div style={styles.amount}>{new Intl.NumberFormat('fr-FR').format(PAYMENT_AMOUNT)} FCFA</div>
        <div style={styles.description}>
          Assuré d'avoir <strong>{new Intl.NumberFormat('fr-FR').format(PAYMENT_AMOUNT)} FCFA</strong> dans votre compte
          <strong> {paymentMethod === 'orange' ? 'Orange Money' : 'Mobile Money'}</strong>.
        </div>

        <div style={styles.paymentMethods}>
          <label style={labelStyle(paymentMethod === 'orange')}>
            <input
              type="radio"
              name="payment"
              value="orange"
              checked={paymentMethod === 'orange'}
              onChange={() => setPaymentMethod('orange')}
              style={{ marginRight: '10px' }}
            />
            Orange Money
          </label>
          <br />
          <label style={labelStyle(paymentMethod === 'mtn')}>
            <input
              type="radio"
              name="payment"
              value="mtn"
              checked={paymentMethod === 'mtn'}
              onChange={() => setPaymentMethod('mtn')}
              style={{ marginRight: '10px' }}
            />
            Mobile Money MTN
          </label>
        </div>

        <label style={styles.label}>Numéro de téléphone</label>
        <div style={styles.phoneWrapper}>
          <div style={styles.prefix}>+237</div>
          <input
            type="text"
            value={phoneSuffix}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
              setPhoneSuffix(v);
            }}
            placeholder="Entrez 9 chiffres"
            maxLength={9}
            style={styles.input}
            disabled={loading}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || phoneSuffix.length !== 9}
          style={{...styles.button, opacity: (loading || phoneSuffix.length !== 9) ? 0.6 : 1}}
        >
          {loading ? 'Envoi...' : `Payer ${new Intl.NumberFormat('fr-FR').format(PAYMENT_AMOUNT)} FCFA`}
        </button>

        {status && (
          <div style={status === 'success' ? styles.success : styles.error}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: isActive ? '#eaf1ff' : '#f5f7ff',
  border: `1px solid ${isActive ? '#004aad' : '#d4d9f2'}`,
  borderRadius: '8px',
  padding: '12px',
  marginBottom: '10px',
  cursor: 'pointer',
  fontSize: '15px',
  color: '#333',
  transition: 'all 0.3s ease'
});

const styles = {
  container: {
    fontFamily: "'Poppins', Arial, sans-serif",
    background: 'linear-gradient(to bottom right, #e8f0ff, #f9fbff)',
    margin: 0,
    padding: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh'
  },
  card: {
    backgroundColor: 'white',
    padding: '30px 25px',
    borderRadius: '14px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    maxWidth: '400px',
    width: '90%'
  },
  title: {
    textAlign: 'center',
    color: '#004aad',
    fontSize: '26px',
    fontWeight: '700',
    marginBottom: '20px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  amount: {
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '10px'
  },
  description: {
    textAlign: 'center',
    color: '#555',
    fontSize: '15px',
    marginBottom: '25px',
    lineHeight: '1.5'
  },
  paymentMethods: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginTop: '20px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px'
  },
  phoneWrapper: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ccc',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  prefix: {
    backgroundColor: '#eef3ff',
    color: '#004aad',
    padding: '10px 12px',
    fontWeight: '600',
    fontSize: '15px'
  },
  input: {
    flex: 1,
    padding: '10px',
    border: 'none',
    fontSize: '16px',
    outline: 'none'
  },
  button: {
    width: '100%',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '15px',
    borderRadius: '10px',
    fontSize: '18px',
    cursor: 'pointer',
    marginTop: '25px',
    fontWeight: '600'
  },
  success: {
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '20px',
    color: 'green'
  },
  error: {
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '20px',
    color: 'red'
  }
};
