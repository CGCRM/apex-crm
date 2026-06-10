import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA4JkTKNdjMx5KlZGBRdGJGnQvSz9HMED0",
  authDomain: "apex-crm-935a9.firebaseapp.com",
  projectId: "apex-crm-935a9",
  storageBucket: "apex-crm-935a9.firebasestorage.app",
  messagingSenderId: "472835790880",
  appId: "1:472835790880:web:2c14e88b0e669e6c074445"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Manager UIDs — only these emails get full access
const MANAGER_UIDS = ['DD4YST73YdU7JUXgxS5yZEMYmlg2'];

// Map email to rep name
const EMAIL_TO_REP = {
  'tfrost@carguyzmotors.com': 'Taylor',
  'twiggins@carguyzmotors.com': 'Manager',
};

const BRAND = '#111111';
const BRAND_LIGHT = '#f2f2f2';

const STAGES = ['New Lead', 'Contact Made', 'Test Drive', 'Negotiation', 'F&I', 'Delivered'];

const stageColors = {
  'New Lead': '#4a90e2',
  'Contact Made': '#111111',
  'Test Drive': '#0F6E56',
  'Negotiation': '#BA7517',
  'F&I': '#993C1D',
  'Delivered': '#3B6D11',
};

const statusColors = {
  Hot: '#ff6b35',
  Warm: '#f5a623',
  New: '#4a90e2',
  Cold: '#aaaaaa',
};

const inventoryStatusColors = {
  Available: '#3B6D11',
  Pending: '#BA7517',
  Sold: '#999',
};

const REPS = ['Ty', 'Taylor'];
const ALL_REPS = [...REPS, 'Unassigned'];
const sources = ['AutoTrader', 'Cars.com', 'Website', 'Walk-in', 'Referral', 'CarGurus'];
const statuses = ['New', 'Hot', 'Warm', 'Cold'];
const emptyForm = { name: '', vehicle: '', price: '', status: 'New', rep: 'Unassigned', source: 'Website', phone: '', email: '' };
const emptyVehicle = { stockNum: '', vin: '', year: '', make: '', model: '', color: '', miles: '', listPrice: '', buyPrice: '', inventoryStatus: 'Available' };

const initialRules = [
  { id: 1, label: 'Exotics', minPrice: 250000, maxPrice: 999999999, reps: ['Ty', 'Taylor'], mode: 'round-robin' },
  { id: 2, label: 'Luxury', minPrice: 0, maxPrice: 249999, reps: ['Ty', 'Taylor'], mode: 'round-robin' },
];

const rrCounters = {};

function assignRep(price, rules) {
  const rule = rules.find(r => price >= r.minPrice && price <= r.maxPrice);
  if (!rule || rule.reps.length === 0) return 'Unassigned';
  if (!rrCounters[rule.id]) rrCounters[rule.id] = 0;
  const rep = rule.reps[rrCounters[rule.id] % rule.reps.length];
  rrCounters[rule.id]++;
  return rep;
}

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function daysSince(ts) {
  if (!ts) return 0;
  return Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
}

const btnPrimary = {
  background: BRAND, color: 'white', border: 'none', borderRadius: '8px',
  padding: '8px 16px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
};

const inputStyle = {
  width: '100%', padding: '8px 10px', borderRadius: '7px',
  border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box',
};

// ─── Login Page ────────────────────────────────────────────
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: BRAND, display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: '380px', padding: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-block', background: 'white', color: BRAND,
            fontWeight: '800', fontSize: '18px', padding: '10px 20px',
            borderRadius: '8px', letterSpacing: '2px', marginBottom: '12px',
          }}>CGM</div>
          <div style={{ color: 'white', fontSize: '20px', fontWeight: '800', letterSpacing: '1px' }}>CAR GUYZ MOTORS</div>
          <div style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>Internal CRM · Sign in to continue</div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '28px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '6px' }}>EMAIL</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@carguyzmotors.com"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '6px' }}>PASSWORD</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={inputStyle}
            />
          </div>
          {error && <div style={{ color: '#993C1D', fontSize: '13px', marginBottom: '14px', fontWeight: '500' }}>{error}</div>}
          <button onClick={handleLogin} disabled={loading} style={{ ...btnPrimary, width: '100%', padding: '12px', fontSize: '15px' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Nav Bar ───────────────────────────────────────────────
function NavBar({ page, setPage, isManager }) {
  const tabs = isManager ? ['Leads', 'Inventory', 'Reps', 'Settings'] : ['Leads', 'Inventory'];
  return (
    <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '2px solid #111' }}>
      {tabs.map(tab => (
        <button key={tab} onClick={() => setPage(tab)} style={{
          background: page === tab ? BRAND : 'none',
          color: page === tab ? 'white' : '#555',
          border: 'none', padding: '10px 20px', cursor: 'pointer',
          fontSize: '14px', fontWeight: '600',
          borderRadius: '6px 6px 0 0', marginBottom: '-2px',
        }}>{tab}</button>
      ))}
    </div>
  );
}

// ─── Lead Detail Panel ─────────────────────────────────────
function LeadDetail({ lead, onClose }) {
  const [note, setNote] = useState('');
  const [followUp, setFollowUp] = useState(lead.followUp || '');
  const [editField, setEditField] = useState(null);
  const [editVal, setEditVal] = useState('');

  async function saveNote() {
    if (!note.trim()) return;
    const activity = [...(lead.activity || []), { text: note, ts: Date.now(), type: 'note' }];
    await updateDoc(doc(db, 'leads', lead.id), { activity });
    setNote('');
  }

  async function saveFollowUp() {
    await updateDoc(doc(db, 'leads', lead.id), { followUp });
  }

  async function saveField(field, value) {
    await updateDoc(doc(db, 'leads', lead.id), { [field]: value });
    setEditField(null);
  }

  async function advanceStage() {
    const i = STAGES.indexOf(lead.stage);
    if (i < STAGES.length - 1) {
      const newStage = STAGES[i + 1];
      const activity = [...(lead.activity || []), { text: `Stage → "${newStage}"`, ts: Date.now(), type: 'stage' }];
      await updateDoc(doc(db, 'leads', lead.id), { stage: newStage, activity });
    }
  }

  async function regressStage() {
    const i = STAGES.indexOf(lead.stage);
    if (i > 0) {
      const newStage = STAGES[i - 1];
      const activity = [...(lead.activity || []), { text: `Stage → "${newStage}"`, ts: Date.now(), type: 'stage' }];
      await updateDoc(doc(db, 'leads', lead.id), { stage: newStage, activity });
    }
  }

  function EditableField({ label, field, value }) {
    return (
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', color: '#888', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
        {editField === field ? (
          <div style={{ display: 'flex', gap: '6px' }}>
            <input autoFocus style={inputStyle} value={editVal} onChange={e => setEditVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveField(field, editVal); if (e.key === 'Escape') setEditField(null); }} />
            <button onClick={() => saveField(field, editVal)} style={{ ...btnPrimary, padding: '0 12px' }}>Save</button>
          </div>
        ) : (
          <div onClick={() => { setEditField(field); setEditVal(value || ''); }}
            style={{ fontSize: '14px', padding: '7px 10px', borderRadius: '7px', border: '1px solid transparent', cursor: 'pointer', background: '#fafafa' }}>
            {value || <span style={{ color: '#bbb' }}>Click to add...</span>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, width: '420px', height: '100vh',
      background: 'white', borderLeft: '2px solid #111', overflowY: 'auto',
      zIndex: 100, padding: '24px', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: '700' }}>{lead.name}</div>
          <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>{lead.vehicle}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' }}>✕</button>
      </div>

      <div style={{ background: BRAND_LIGHT, borderRadius: '10px', padding: '14px', marginBottom: '20px', borderLeft: `4px solid ${BRAND}` }}>
        <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pipeline Stage</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={regressStage} style={{ background: 'white', border: '1px solid #ddd', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontWeight: '600' }}>←</button>
          <div style={{
            flex: 1, textAlign: 'center', padding: '6px', borderRadius: '7px', fontSize: '13px', fontWeight: '700',
            background: stageColors[lead.stage] + '22', color: stageColors[lead.stage],
          }}>{lead.stage}</div>
          <button onClick={advanceStage} style={{ background: 'white', border: '1px solid #ddd', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontWeight: '600' }}>→</button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Info</div>
        <EditableField label="Phone" field="phone" value={lead.phone} />
        <EditableField label="Email" field="email" value={lead.email} />
        <EditableField label="Assigned Rep" field="rep" value={lead.rep} />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deal Info</div>
        <EditableField label="Vehicle" field="vehicle" value={lead.vehicle} />
        <EditableField label="Price" field="price" value={lead.price?.toString()} />
        <EditableField label="Lead Source" field="source" value={lead.source} />
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</div>
          <select value={lead.status} onChange={e => saveField('status', e.target.value)} style={{ ...inputStyle, background: '#fafafa' }}>
            {statuses.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Follow-up Date</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="datetime-local" value={followUp} onChange={e => setFollowUp(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          <button onClick={saveFollowUp} style={{ ...btnPrimary, padding: '0 14px' }}>Set</button>
        </div>
        {lead.followUp && <div style={{ fontSize: '12px', color: BRAND, marginTop: '6px', fontWeight: '600' }}>📅 {new Date(lead.followUp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Add Note</div>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Type a note..."
          style={{ ...inputStyle, height: '80px', resize: 'vertical', fontFamily: 'sans-serif' }} />
        <button onClick={saveNote} style={{ ...btnPrimary, marginTop: '8px' }}>Save Note</button>
      </div>

      {(lead.activity || []).length > 0 && (
        <div>
          <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Activity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[...(lead.activity || [])].reverse().map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px', background: '#f8f8f8', borderRadius: '8px', borderLeft: `3px solid ${BRAND}` }}>
                <div style={{ fontSize: '16px' }}>{a.type === 'note' ? '📝' : '🔄'}</div>
                <div>
                  <div style={{ fontSize: '13px' }}>{a.text}</div>
                  <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{formatDate(a.ts)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Leads Page ────────────────────────────────────────────
function LeadsPage({ leads, rules, isManager, currentRep }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [manualRep, setManualRep] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    if (selectedLead) {
      const updated = leads.find(l => l.id === selectedLead.id);
      if (updated) setSelectedLead(updated);
    }
  }, [leads, selectedLead]);

  // Filter leads by rep if not manager
  const visibleLeads = isManager ? leads : leads.filter(l => l.rep === currentRep);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleAddLead() {
    if (!form.name || !form.vehicle || !form.price) { alert('Please fill in name, vehicle, and price.'); return; }
    const price = parseFloat(form.price);
    const assignedRep = manualRep ? form.rep : (isManager ? assignRep(price, rules) : currentRep);
    await addDoc(collection(db, 'leads'), {
      ...form, price, stage: 'New Lead', rep: assignedRep, createdAt: Date.now(), activity: []
    });
    setForm(emptyForm);
    setShowForm(false);
    setManualRep(false);
  }

  async function advanceStage(lead, e) {
    e.stopPropagation();
    const i = STAGES.indexOf(lead.stage);
    if (i < STAGES.length - 1) await updateDoc(doc(db, 'leads', lead.id), { stage: STAGES[i + 1] });
  }

  async function regressStage(lead, e) {
    e.stopPropagation();
    const i = STAGES.indexOf(lead.stage);
    if (i > 0) await updateDoc(doc(db, 'leads', lead.id), { stage: STAGES[i - 1] });
  }

  async function deleteLead(id, e) {
    e.stopPropagation();
    if (window.confirm('Delete this lead?')) {
      if (selectedLead?.id === id) setSelectedLead(null);
      await deleteDoc(doc(db, 'leads', id));
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
          {isManager ? `All Leads (${visibleLeads.length})` : `My Leads (${visibleLeads.length})`}
        </h2>
        <button onClick={() => setShowForm(!showForm)} style={btnPrimary}>{showForm ? 'Cancel' : '+ Add Lead'}</button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {STAGES.map(stage => {
          const count = visibleLeads.filter(l => l.stage === stage).length;
          const value = visibleLeads.filter(l => l.stage === stage).reduce((s, l) => s + l.price, 0);
          return (
            <div key={stage} style={{
              flex: 1, minWidth: '100px', background: 'white', border: '1px solid #e0e0e0',
              borderRadius: '10px', padding: '10px 12px', borderTop: `3px solid ${stageColors[stage]}`,
            }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>{stage}</div>
              <div style={{ fontSize: '20px', fontWeight: '700' }}>{count}</div>
              {value > 0 && <div style={{ fontSize: '11px', color: '#888' }}>${(value / 1000).toFixed(0)}k</div>}
            </div>
          );
        })}
      </div>

      {showForm && (
        <div style={{ background: 'white', border: '2px solid #111', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700' }}>New Lead</h3>
          <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#666' }}>
            {isManager ? 'Rep auto-assigned by price unless you override.' : `This lead will be assigned to you (${currentRep}).`}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Customer Name', name: 'name', type: 'text', placeholder: 'Full name' },
              { label: 'Phone', name: 'phone', type: 'tel', placeholder: '(801) 000-0000' },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'email@example.com' },
              { label: 'Vehicle of Interest', name: 'vehicle', type: 'text', placeholder: 'Year Make Model' },
              { label: 'Price', name: 'price', type: 'number', placeholder: '250000' },
            ].map(f => (
              <div key={f.name}>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px', fontWeight: '600' }}>{f.label}</label>
                <input type={f.type} name={f.name} placeholder={f.placeholder} value={form[f.name]} onChange={handleChange} style={inputStyle} />
              </div>
            ))}
            {[
              { label: 'Status', name: 'status', options: statuses },
              { label: 'Lead Source', name: 'source', options: sources },
            ].map(f => (
              <div key={f.name}>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px', fontWeight: '600' }}>{f.label}</label>
                <select name={f.name} value={form[f.name]} onChange={handleChange} style={inputStyle}>
                  {f.options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            {isManager && (
              <div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px', fontWeight: '600' }}>
                  Assigned Rep
                  <span onClick={() => setManualRep(!manualRep)} style={{ marginLeft: '8px', color: BRAND, cursor: 'pointer', textDecoration: 'underline' }}>
                    {manualRep ? '(use auto-assign)' : '(override)'}
                  </span>
                </label>
                {manualRep ? (
                  <select name="rep" value={form.rep} onChange={handleChange} style={inputStyle}>
                    {ALL_REPS.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <div style={{ ...inputStyle, color: '#888', background: '#fafafa' }}>
                    {form.price ? `Will assign → ${assignRep(parseFloat(form.price), rules)}` : 'Enter price to preview'}
                  </div>
                )}
              </div>
            )}
          </div>
          <button onClick={handleAddLead} style={{ ...btnPrimary, marginTop: '16px', padding: '10px 20px' }}>Save Lead</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {visibleLeads.map(lead => (
          <div key={lead.id} onClick={() => setSelectedLead(lead)} style={{
            background: selectedLead?.id === lead.id ? BRAND_LIGHT : 'white',
            border: `2px solid ${selectedLead?.id === lead.id ? BRAND : '#e0e0e0'}`,
            borderRadius: '10px', padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
            cursor: 'pointer',
          }}>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>{lead.name}</div>
              <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>{lead.vehicle}</div>
              {lead.phone && <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{lead.phone}</div>}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700' }}>${lead.price?.toLocaleString()}</div>
            <div style={{
              padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
              background: statusColors[lead.status] + '22', color: statusColors[lead.status],
            }}>{lead.status}</div>
            <div style={{ fontSize: '13px', color: '#666' }}>{lead.source}</div>
            {isManager && <div style={{ fontSize: '13px', fontWeight: '600', width: '60px' }}>{lead.rep}</div>}
            {lead.followUp && (
              <div style={{ fontSize: '11px', color: BRAND, fontWeight: '600' }}>
                📅 {new Date(lead.followUp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button onClick={e => regressStage(lead, e)} style={{ background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontWeight: '700' }}>←</button>
              <div style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700',
                background: stageColors[lead.stage] + '22', color: stageColors[lead.stage], whiteSpace: 'nowrap',
              }}>{lead.stage}</div>
              <button onClick={e => advanceStage(lead, e)} style={{ background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontWeight: '700' }}>→</button>
            </div>
            {isManager && <button onClick={e => deleteLead(lead.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: '16px' }}>✕</button>}
          </div>
        ))}
        {visibleLeads.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999', background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
            No leads yet — click + Add Lead to get started
          </div>
        )}
      </div>

      {selectedLead && <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} />}
    </div>
  );
}

// ─── Inventory Page ────────────────────────────────────────
function InventoryPage({ vehicles, isManager }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyVehicle);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleAddVehicle() {
    if (!form.year || !form.make || !form.model) { alert('Please fill in year, make, and model.'); return; }
    await addDoc(collection(db, 'inventory'), {
      ...form,
      listPrice: parseFloat(form.listPrice) || 0,
      buyPrice: parseFloat(form.buyPrice) || 0,
      miles: parseInt(form.miles) || 0,
      createdAt: Date.now(),
    });
    setForm(emptyVehicle);
    setShowForm(false);
  }

  async function updateVehicleStatus(id, inventoryStatus) {
    await updateDoc(doc(db, 'inventory', id), { inventoryStatus });
  }

  async function deleteVehicle(id) {
    if (window.confirm('Remove this vehicle?')) {
      await deleteDoc(doc(db, 'inventory', id));
    }
  }

  const available = vehicles.filter(v => v.inventoryStatus === 'Available').length;
  const pending = vehicles.filter(v => v.inventoryStatus === 'Pending').length;
  const sold = vehicles.filter(v => v.inventoryStatus === 'Sold').length;
  const totalValue = vehicles.filter(v => v.inventoryStatus !== 'Sold').reduce((s, v) => s + (v.listPrice || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Inventory ({vehicles.length})</h2>
        {isManager && <button onClick={() => setShowForm(!showForm)} style={btnPrimary}>{showForm ? 'Cancel' : '+ Add Vehicle'}</button>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Available', value: available, color: '#3B6D11' },
          { label: 'Pending', value: pending, color: '#BA7517' },
          { label: 'Sold MTD', value: sold, color: '#999' },
          { label: 'Lot Value', value: '$' + (totalValue / 1000).toFixed(0) + 'k', color: BRAND },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '12px', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>{s.label}</div>
            <div style={{ fontSize: '22px', fontWeight: '700' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {showForm && isManager && (
        <div style={{ background: 'white', border: '2px solid #111', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700' }}>Add Vehicle</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Year', name: 'year', placeholder: '2024' },
              { label: 'Make', name: 'make', placeholder: 'Lamborghini' },
              { label: 'Model', name: 'model', placeholder: 'Huracán' },
              { label: 'Color', name: 'color', placeholder: 'Pearl White' },
              { label: 'Miles', name: 'miles', placeholder: '1200' },
              { label: 'Stock #', name: 'stockNum', placeholder: 'LH2401' },
              { label: 'VIN', name: 'vin', placeholder: '1HGBH41JXMN109186' },
              { label: 'List Price', name: 'listPrice', placeholder: '284000' },
              { label: 'Buy Price / Cost', name: 'buyPrice', placeholder: '240000' },
            ].map(f => (
              <div key={f.name}>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px', fontWeight: '600' }}>{f.label}</label>
                <input type="text" name={f.name} placeholder={f.placeholder} value={form[f.name]} onChange={handleChange} style={inputStyle} />
              </div>
            ))}
          </div>
          <button onClick={handleAddVehicle} style={{ ...btnPrimary, marginTop: '16px', padding: '10px 20px' }}>Save Vehicle</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {vehicles.map(v => {
          const days = daysSince(v.createdAt);
          const margin = isManager && v.listPrice && v.buyPrice ? v.listPrice - v.buyPrice : null;
          return (
            <div key={v.id} style={{
              background: 'white', border: '1px solid #e0e0e0', borderRadius: '10px',
              padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <div style={{ fontWeight: '700', fontSize: '15px' }}>{v.year} {v.make} {v.model}</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '3px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {v.color && <span>🎨 {v.color}</span>}
                  {v.miles ? <span>📍 {parseInt(v.miles).toLocaleString()} mi</span> : null}
                  {v.stockNum && <span>#{v.stockNum}</span>}
                </div>
                {v.vin && <div style={{ fontSize: '11px', color: '#bbb', marginTop: '2px' }}>VIN: {v.vin}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '15px', fontWeight: '700' }}>${(v.listPrice || 0).toLocaleString()}</div>
                {margin !== null && <div style={{ fontSize: '11px', color: '#3B6D11', marginTop: '2px', fontWeight: '600' }}>+${margin.toLocaleString()} margin</div>}
              </div>
              <div style={{ fontSize: '12px', color: days > 30 ? '#993C1D' : '#888', fontWeight: days > 30 ? '700' : '400' }}>{days}d on lot</div>
              <select value={v.inventoryStatus} onChange={e => updateVehicleStatus(v.id, e.target.value)}
                style={{
                  padding: '5px 10px', borderRadius: '20px', border: '1px solid #ddd',
                  fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                  background: inventoryStatusColors[v.inventoryStatus] + '18',
                  color: inventoryStatusColors[v.inventoryStatus],
                }}>
                <option>Available</option>
                <option>Pending</option>
                <option>Sold</option>
              </select>
              {isManager && <button onClick={() => deleteVehicle(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: '16px' }}>✕</button>}
            </div>
          );
        })}
        {vehicles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999', background: 'white', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
            No vehicles yet
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Reps Page ─────────────────────────────────────────────
function RepsPage({ leads }) {
  return (
    <div>
      <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700' }}>Sales Reps</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {REPS.map(rep => {
          const repLeads = leads.filter(l => l.rep === rep);
          const active = repLeads.filter(l => l.stage !== 'Delivered').length;
          const delivered = repLeads.filter(l => l.stage === 'Delivered');
          const revenue = delivered.reduce((s, l) => s + l.price, 0);
          const closeRate = repLeads.length > 0 ? Math.round((delivered.length / repLeads.length) * 100) : 0;
          const progress = Math.min((revenue / 1000000) * 100, 100);
          return (
            <div key={rep} style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%', background: BRAND,
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: '14px', flexShrink: 0,
                }}>{rep.slice(0, 2).toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px' }}>{rep}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Sales Rep · Car Guyz Motors</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                {[
                  { label: 'Active leads', value: active },
                  { label: 'Sold MTD', value: delivered.length },
                  { label: 'Revenue MTD', value: '$' + (revenue / 1000).toFixed(0) + 'k' },
                  { label: 'Close rate', value: closeRate + '%' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: BRAND_LIGHT, borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '700' }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Monthly goal</span><span style={{ fontWeight: '600' }}>${(revenue / 1000).toFixed(0)}k / $1M</span>
              </div>
              <div style={{ height: '6px', background: '#e0e0e0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: progress + '%', background: progress >= 80 ? '#3B6D11' : progress >= 40 ? BRAND : '#BA7517', borderRadius: '3px' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Settings Page ─────────────────────────────────────────
function SettingsPage({ rules, setRules }) {
  function toggleRep(ruleId, rep) {
    setRules(rules.map(rule => {
      if (rule.id !== ruleId) return rule;
      const hasRep = rule.reps.includes(rep);
      return { ...rule, reps: hasRep ? rule.reps.filter(r => r !== rep) : [...rule.reps, rep] };
    }));
  }
  function updateMode(ruleId, mode) {
    setRules(rules.map(rule => rule.id === ruleId ? { ...rule, mode } : rule));
  }
  return (
    <div>
      <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700' }}>Lead Distribution Rules</h2>
      <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#666' }}>Set which reps receive leads based on vehicle price range.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {rules.map(rule => (
          <div key={rule.id} style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px' }}>{rule.label}</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                  ${rule.minPrice.toLocaleString()} – {rule.maxPrice > 9000000 ? 'and up' : '$' + rule.maxPrice.toLocaleString()}
                </div>
              </div>
              <select value={rule.mode} onChange={e => updateMode(rule.id, e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '7px', border: '1px solid #ddd', fontSize: '13px' }}>
                <option value="round-robin">Round robin</option>
                <option value="first">Always first rep</option>
              </select>
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>Eligible reps:</div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {REPS.map(rep => {
                const checked = rule.reps.includes(rep);
                return (
                  <label key={rep} style={{
                    display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                    padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                    background: checked ? BRAND : '#f5f5f5',
                    color: checked ? 'white' : '#666',
                    border: `1px solid ${checked ? BRAND : '#e0e0e0'}`,
                  }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleRep(rule.id, rep)} style={{ display: 'none' }} />
                    {rep}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── App Root ──────────────────────────────────────────────
function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState('Leads');
  const [leads, setLeads] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [rules, setRules] = useState(initialRules);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    let leadsLoaded = false;
    let inventoryLoaded = false;

    const unsub1 = onSnapshot(collection(db, 'leads'), snapshot => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => b.createdAt - a.createdAt);
      setLeads(data);
      leadsLoaded = true;
      if (leadsLoaded && inventoryLoaded) setDataLoading(false);
    });

    const unsub2 = onSnapshot(collection(db, 'inventory'), snapshot => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => b.createdAt - a.createdAt);
      setVehicles(data);
      inventoryLoaded = true;
      if (leadsLoaded && inventoryLoaded) setDataLoading(false);
    });

    return () => { unsub1(); unsub2(); };
  }, [user]);

  if (authLoading) return (
    <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: BRAND }}>
      <div style={{ color: 'white', fontSize: '22px', fontWeight: '700', letterSpacing: '1px' }}>CAR GUYZ MOTORS</div>
      <div style={{ color: '#888', fontSize: '13px', marginTop: '8px' }}>Loading...</div>
    </div>
  );

  if (!user) return <LoginPage />;

  const isManager = MANAGER_UIDS.includes(user.uid);
  const currentRep = EMAIL_TO_REP[user.email] || user.email;

  if (dataLoading) return (
    <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: BRAND }}>
      <div style={{ color: 'white', fontSize: '22px', fontWeight: '700', letterSpacing: '1px' }}>CAR GUYZ MOTORS</div>
      <div style={{ color: '#888', fontSize: '13px', marginTop: '8px' }}>Loading CRM...</div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '980px', margin: '0 auto', padding: '24px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #111',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: BRAND, color: 'white', fontWeight: '800', fontSize: '13px', padding: '8px 14px', borderRadius: '6px', letterSpacing: '1px' }}>CGM</div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px' }}>CAR GUYZ MOTORS</div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              {isManager ? '👑 Manager View' : `👤 ${currentRep}`} · American Fork, UT
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '12px', color: '#aaa' }}>{user.email}</div>
          <button onClick={() => signOut(auth)} style={{ background: 'none', border: '1px solid #ddd', borderRadius: '7px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', color: '#666' }}>
            Sign out
          </button>
        </div>
      </div>

      <NavBar page={page} setPage={setPage} isManager={isManager} />
      {page === 'Leads' && <LeadsPage leads={leads} rules={rules} isManager={isManager} currentRep={currentRep} />}
      {page === 'Inventory' && <InventoryPage vehicles={vehicles} isManager={isManager} />}
      {page === 'Reps' && isManager && <RepsPage leads={leads} />}
      {page === 'Settings' && isManager && <SettingsPage rules={rules} setRules={setRules} />}
    </div>
  );
}

export default App;