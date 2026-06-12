import React, { useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, addDoc, collection } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA4JkTKNdjMx5KlZGBRdGJGnQvSz9HMED0",
  authDomain: "apex-crm-935a9.firebaseapp.com",
  projectId: "apex-crm-935a9",
  storageBucket: "apex-crm-935a9.firebasestorage.app",
  messagingSenderId: "472835790880",
  appId: "1:472835790880:web:2c14e88b0e669e6c074445"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const BRAND = '#111111';

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: '8px',
  border: '1.5px solid #e0e0e0', fontSize: '16px',
  boxSizing: 'border-box', fontFamily: 'sans-serif', outline: 'none',
};
const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' };
const sectionStyle = { background: 'white', borderRadius: '12px', border: '1px solid #e0e0e0', padding: '20px', marginBottom: '16px' };

export default function LeadForm() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    vehicleInterest: '', budget: '', condition: 'New',
    hasTrade: 'No', tradeMake: '', tradeModel: '',
    tradeYear: '', tradeMiles: '', tradeCondition: 'Good',
    needsFinancing: 'Yes', employmentStatus: 'Employed',
    timeframe: 'Within 30 days', notes: '',
  });

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  function nextStep() { setStep(s => s + 1); window.scrollTo(0, 0); }
  function prevStep() { setStep(s => s - 1); window.scrollTo(0, 0); }

  async function handleSubmit() {
    if (!form.firstName || !form.phone) { alert('Please fill in your name and phone number.'); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, 'leads'), {
        name: `${form.firstName} ${form.lastName}`.trim(),
        phone: form.phone, email: form.email,
        vehicle: form.vehicleInterest,
        price: parseFloat(form.budget?.replace(/[^0-9.]/g, '')) || 0,
        status: 'New', rep: 'Unassigned', source: 'Lead Form',
        stage: 'New Lead', createdAt: Date.now(), activity: [],
        touchpoints: { calls: 0, texts: 0, emails: 0, walkaround: false },
        formData: {
          condition: form.condition, hasTrade: form.hasTrade,
          tradeMake: form.tradeMake, tradeModel: form.tradeModel,
          tradeYear: form.tradeYear, tradeMiles: form.tradeMiles,
          tradeCondition: form.tradeCondition, needsFinancing: form.needsFinancing,
          employmentStatus: form.employmentStatus, timeframe: form.timeframe,
          notes: form.notes,
        }
      });
      setSubmitted(true);
    } catch (e) {
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{ background: BRAND, color: 'white', fontWeight: '800', fontSize: '16px', padding: '10px 20px', borderRadius: '8px', letterSpacing: '2px', display: 'inline-block', marginBottom: '20px' }}>CGM</div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '40px 30px', border: '1px solid #e0e0e0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <div style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>You're all set!</div>
          <div style={{ fontSize: '15px', color: '#666', lineHeight: '1.6' }}>Thanks {form.firstName}! One of our specialists at Car Guyz Motors will be in touch shortly.</div>
          <div style={{ marginTop: '24px', padding: '16px', background: '#f8f8f8', borderRadius: '10px', fontSize: '13px', color: '#888' }}>📍 American Fork, UT · carguyzmotors.com</div>
        </div>
      </div>
    </div>
  );

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'sans-serif', paddingBottom: '40px' }}>
      <div style={{ background: BRAND, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'white', color: BRAND, fontWeight: '800', fontSize: '13px', padding: '6px 12px', borderRadius: '6px', letterSpacing: '1px' }}>CGM</div>
        <div>
          <div style={{ color: 'white', fontWeight: '800', fontSize: '15px' }}>CAR GUYZ MOTORS</div>
          <div style={{ color: '#888', fontSize: '11px' }}>American Fork, UT</div>
        </div>
      </div>

      <div style={{ height: '4px', background: '#333' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'white', transition: 'width .3s' }} />
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          {['Contact', 'Vehicle', 'Trade-in', 'Financing'].map((label, i) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step >= i + 1 ? BRAND : '#e0e0e0', color: step >= i + 1 ? 'white' : '#999', fontSize: '12px', fontWeight: '700' }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <div style={{ fontSize: '10px', color: step === i + 1 ? BRAND : '#999', fontWeight: step === i + 1 ? '700' : '400' }}>{label}</div>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>Let's get started 👋</div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>Tell us a little about yourself.</div>
            <div style={sectionStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={labelStyle}>First Name *</label>
                  <input style={inputStyle} name="firstName" value={form.firstName} onChange={handleChange} placeholder="Tyler" />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input style={inputStyle} name="lastName" value={form.lastName} onChange={handleChange} placeholder="Wiggins" />
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Phone Number *</label>
                <input style={inputStyle} name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="(801) 000-0000" />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input style={inputStyle} name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>What are you looking for? 🚗</div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>Tell us about your dream car.</div>
            <div style={sectionStyle}>
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Vehicle of Interest</label>
                <input style={inputStyle} name="vehicleInterest" value={form.vehicleInterest} onChange={handleChange} placeholder="e.g. 2024 Lamborghini Huracán" />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Budget</label>
                <input style={inputStyle} name="budget" value={form.budget} onChange={handleChange} placeholder="e.g. $150,000" />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Condition Preference</label>
                <select style={inputStyle} name="condition" value={form.condition} onChange={handleChange}>
                  <option>New</option>
                  <option>Pre-Owned / CPO</option>
                  <option>Either</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>When are you looking to purchase?</label>
                <select style={inputStyle} name="timeframe" value={form.timeframe} onChange={handleChange}>
                  <option>ASAP</option>
                  <option>Within 30 days</option>
                  <option>Within 90 days</option>
                  <option>Just browsing</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>Do you have a trade-in? 🔄</div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>We'll give you top dollar for your current vehicle.</div>
            <div style={sectionStyle}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Do you have a vehicle to trade in?</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['Yes', 'No'].map(opt => (
                    <button key={opt} onClick={() => setForm({ ...form, hasTrade: opt })} style={{ flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', background: form.hasTrade === opt ? BRAND : 'white', color: form.hasTrade === opt ? 'white' : '#666', border: `2px solid ${form.hasTrade === opt ? BRAND : '#e0e0e0'}` }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              {form.hasTrade === 'Yes' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Year</label>
                    <input style={inputStyle} name="tradeYear" value={form.tradeYear} onChange={handleChange} placeholder="2021" />
                  </div>
                  <div>
                    <label style={labelStyle}>Make</label>
                    <input style={inputStyle} name="tradeMake" value={form.tradeMake} onChange={handleChange} placeholder="Porsche" />
                  </div>
                  <div>
                    <label style={labelStyle}>Model</label>
                    <input style={inputStyle} name="tradeModel" value={form.tradeModel} onChange={handleChange} placeholder="911" />
                  </div>
                  <div>
                    <label style={labelStyle}>Miles</label>
                    <input style={inputStyle} name="tradeMiles" value={form.tradeMiles} onChange={handleChange} placeholder="24,000" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Condition</label>
                    <select style={inputStyle} name="tradeCondition" value={form.tradeCondition} onChange={handleChange}>
                      <option>Excellent</option>
                      <option>Good</option>
                      <option>Fair</option>
                      <option>Needs Work</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>Financing & final details 💳</div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>Almost done!</div>
            <div style={sectionStyle}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Will you need financing?</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['Yes', 'No', 'Undecided'].map(opt => (
                    <button key={opt} onClick={() => setForm({ ...form, needsFinancing: opt })} style={{ flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: form.needsFinancing === opt ? BRAND : 'white', color: form.needsFinancing === opt ? 'white' : '#666', border: `2px solid ${form.needsFinancing === opt ? BRAND : '#e0e0e0'}` }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              {form.needsFinancing === 'Yes' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Employment Status</label>
                  <select style={inputStyle} name="employmentStatus" value={form.employmentStatus} onChange={handleChange}>
                    <option>Employed</option>
                    <option>Self-Employed</option>
                    <option>Retired</option>
                    <option>Other</option>
                  </select>
                </div>
              )}
              <div>
                <label style={labelStyle}>Anything else you'd like us to know?</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any specific features, colors, or questions..."
                  style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          {step > 1 && (
            <button onClick={prevStep} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '2px solid #e0e0e0', background: 'white', cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: '#666' }}>
              ← Back
            </button>
          )}
          {step < totalSteps ? (
            <button onClick={nextStep} style={{ flex: 2, padding: '14px', borderRadius: '10px', border: 'none', background: BRAND, color: 'white', cursor: 'pointer', fontSize: '15px', fontWeight: '700' }}>
              Continue →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '14px', borderRadius: '10px', border: 'none', background: '#3B6D11', color: 'white', cursor: 'pointer', fontSize: '15px', fontWeight: '700' }}>
              {loading ? 'Submitting...' : '🚗 Submit My Request'}
            </button>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#aaa' }}>
          Your information is kept private and will only be used to contact you about your vehicle inquiry.
        </div>
      </div>
    </div>
  );
}