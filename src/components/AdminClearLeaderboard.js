import React, { useState } from 'react';
import axios from 'axios';

const ADMIN_PASSWORD = 'pirateadmin123'; // Change this to your secret password

const AdminClearLeaderboard = () => {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [show, setShow] = useState(false);

  const handleClear = async () => {
    if (password !== ADMIN_PASSWORD) {
      setStatus('Incorrect password!');
      return;
    }
    setStatus('Clearing...');
    try {
      // Get all leaderboard entries
      const res = await axios.get('https://json-server-jcg2.onrender.com/leaderboard');
      const entries = res.data;
      // Delete each entry
      await Promise.all(entries.map(entry =>
        axios.delete(`https://json-server-jcg2.onrender.com/leaderboard/${entry.id}`)
      ));
      setStatus('Leaderboard cleared!');
    } catch (err) {
      setStatus('Failed to clear leaderboard.');
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 10, right: 10, zIndex: 2000 }}>
      <button onClick={() => setShow(s => !s)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: '#333', color: '#fff', border: 'none', opacity: 0.5 }}>Admin</button>
      {show && (
        <div style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 8, padding: 16, marginTop: 8, minWidth: 220 }}>
          <h4>Clear Leaderboard</h4>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', marginBottom: 8, padding: 6, borderRadius: 4, border: '1px solid #bbb' }}
          />
          <button onClick={handleClear} style={{ background: '#d9534f', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', fontWeight: 600 }}>Clear</button>
          <div style={{ marginTop: 8, fontSize: 13, color: '#555' }}>{status}</div>
        </div>
      )}
    </div>
  );
};

export default AdminClearLeaderboard; 