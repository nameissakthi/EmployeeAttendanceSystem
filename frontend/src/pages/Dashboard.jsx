import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const [today, setToday] = useState(null)
  const [summary, setSummary] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkinLoading, setCheckinLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [manualCheckinTime, setManualCheckinTime] = useState('')
  const [manualCheckoutTime, setManualCheckoutTime] = useState('')
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const { user, logout } = useAuth()

  useEffect(() => {
    let mounted = true
    Promise.all([
      api.get('/api/attendance/today').then(r => (mounted ? setToday(r.data.attendance) : null)).catch(() => {}),
      api.get('/api/attendance/my-history').then(r => (mounted ? setHistory(r.data) : null)).catch(() => {}),
      api.get('/api/attendance/my-summary').then(r => (mounted ? setSummary(r.data) : null)).catch(() => {})
    ]).finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  async function checkin() {
    try {
      setCheckinLoading(true)
      // If a manual HH:MM time is provided, convert it to an ISO timestamp (local date + provided time).
      // Otherwise send an ISO timestamp from the client (current time).
      let timeToSend = ''
      if (manualCheckinTime) {
        // manualCheckinTime is in "HH:MM" format from <input type="time">.
        const [hh, mm] = manualCheckinTime.split(':')
        const d = new Date()
        d.setHours(parseInt(hh || '0', 10), parseInt(mm || '0', 10), 0, 0)
        timeToSend = d.toISOString()
      } else {
        timeToSend = new Date().toISOString()
      }
      const r = await api.post('/api/attendance/checkin', { time: timeToSend })
      setToday(r.data.attendance)
    } catch (e) {
      alert(e.response?.data?.error || 'Error')
    } finally {
      setCheckinLoading(false)
    }
  }

  async function checkout() {
    try {
      setCheckoutLoading(true)
      // If a manual HH:MM time is provided, convert it to an ISO timestamp (local date + provided time).
      // Otherwise send an ISO timestamp from the client (current time).
      let timeToSend = ''
      if (manualCheckoutTime) {
        const [hh, mm] = manualCheckoutTime.split(':')
        const d = new Date()
        d.setHours(parseInt(hh || '0', 10), parseInt(mm || '0', 10), 0, 0)
        timeToSend = d.toISOString()
      } else {
        timeToSend = new Date().toISOString()
      }
      const r = await api.post('/api/attendance/checkout', { time: timeToSend })
      setToday(r.data.attendance)
    } catch (e) {
      alert(e.response?.data?.error || 'Error')
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', background: 'linear-gradient(135deg, #fffef0 0%, #fff9e6 100%)' }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: '4px' }}>👋 Welcome, {user?.name || 'Employee'}</h2>
          <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>Employee Attendance Dashboard</p>
        </div>
        <button onClick={logout} style={{ 
          padding: '10px 20px', 
          cursor: 'pointer', 
          backgroundColor: '#d32f2f', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px',
          fontWeight: '600',
          boxShadow: '0 2px 8px rgba(211, 47, 47, 0.3)'
        }}>🚪 Logout</button>
      </div>

      {/* Today's Status Section */}
      {/* Styles extracted to variables to avoid long inline expressions that can confuse parsers */}
      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>⏰ Today's Status</h3>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '20px', borderRadius: '12px', background: 'linear-gradient(135deg, #fff9e6 0%, #fffef0 100%)', border: '2px solid #ffc107', boxShadow: '0 2px 8px rgba(255, 193, 7, 0.1)' }}>
              <div style={{ fontSize: '12px', color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</div>
              <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '8px', color: '#333' }}>{today?.status || 'Not Started'}</div>
            </div>

            <div style={{ padding: '20px', borderRadius: '12px', background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)', border: '2px solid #4caf50', boxShadow: '0 2px 8px rgba(76, 175, 80, 0.1)' }}>
              <div style={{ fontSize: '12px', color: '#558b2f', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Check-In Time</div>
              <div style={{ marginTop: '8px' }}>
                <button
                  onClick={checkin}
                  disabled={checkinLoading || Boolean(today && today.checkInTime)}
                  style={{
                    width: '100%',
                    padding: '12px 10px',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#2e7d32',
                    background: today?.checkInTime ? 'transparent' : '#e8f5e9',
                    border: 'none',
                    cursor: checkinLoading || Boolean(today && today.checkInTime) ? 'not-allowed' : 'pointer',
                    textAlign: 'center',
                    borderRadius: '8px'
                  }}
                >
                  {today?.checkInTime
                    ? new Date(today.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : (manualCheckinTime
                      ? (() => { const [hh, mm] = manualCheckinTime.split(':'); const d = new Date(); d.setHours(parseInt(hh||'0',10), parseInt(mm||'0',10),0,0); return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); })()
                      : (checkinLoading ? '⏳ Checking In...' : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))) }
                </button>
              </div>
            </div>

            <div style={{ padding: '20px', borderRadius: '12px', background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)', border: '2px solid #2196f3', boxShadow: '0 2px 8px rgba(33, 150, 243, 0.1)' }}>
              <div style={{ fontSize: '12px', color: '#1565c0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Check-Out Time</div>
              <div style={{ marginTop: '8px' }}>
                <button
                  onClick={checkout}
                  disabled={checkoutLoading || !(today && today.checkInTime) || Boolean(today && today.checkOutTime)}
                  style={{
                    width: '100%',
                    padding: '12px 10px',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#1976d2',
                    background: today?.checkOutTime ? 'transparent' : '#e3f2fd',
                    border: 'none',
                    cursor: checkoutLoading || !(today && today.checkInTime) || Boolean(today && today.checkOutTime) ? 'not-allowed' : 'pointer',
                    textAlign: 'center',
                    borderRadius: '8px'
                  }}
                >
                  {today?.checkOutTime
                    ? new Date(today.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : (manualCheckoutTime
                      ? (() => { const [hh, mm] = manualCheckoutTime.split(':'); const d = new Date(); d.setHours(parseInt(hh||'0',10), parseInt(mm||'0',10),0,0); return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); })()
                      : ((checkoutLoading || !(today && today.checkInTime)) ? '—' : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))) }
                </button>
              </div>
            </div>

            <div style={{ padding: '20px', borderRadius: '12px', background: 'linear-gradient(135deg, #f3e5f5 0%, #ede7f6 100%)', border: '2px solid #9c27b0', boxShadow: '0 2px 8px rgba(156, 39, 176, 0.1)' }}>
              <div style={{ fontSize: '12px', color: '#6a1b9a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Hours</div>
              <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '8px', color: '#7b1fa2' }}>{today?.totalHours ? today.totalHours.toFixed(2) + 'h' : '—'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontSize: '12px', color: '#555' }}>Manual Check-In</label>
              <input type="time" value={manualCheckinTime} onChange={e => setManualCheckinTime(e.target.value)} style={{ padding: '6px', borderRadius: '6px' }} />
            </div>

            <button onClick={checkin} disabled={checkinLoading || Boolean(today && today.checkInTime)} style={{ padding: '12px 24px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '8px', cursor: checkinLoading || Boolean(today && today.checkInTime) ? 'not-allowed' : 'pointer', fontWeight: 600 }}> {checkinLoading ? '⏳ Checking In...' : '✓ Check In'}</button>

            <div style={{ width: 24 }} />

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontSize: '12px', color: '#555' }}>Manual Check-Out</label>
              <input type="time" value={manualCheckoutTime} onChange={e => setManualCheckoutTime(e.target.value)} style={{ padding: '6px', borderRadius: '6px' }} />
            </div>

            <button onClick={checkout} disabled={checkoutLoading || !(today && today.checkInTime) || Boolean(today && today.checkOutTime)} style={{ padding: '12px 24px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '8px', cursor: checkoutLoading || !(today && today.checkInTime) || Boolean(today && today.checkOutTime) ? 'not-allowed' : 'pointer', fontWeight: 600 }}> {checkoutLoading ? '⏳ Checking Out...' : '→ Check Out'}</button>
          </div>
        </div>
      </div>
      {summary && (
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>This Month Summary</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ padding: '12px', borderRadius: '8px', background: '#e8f5e9', minWidth: '110px' }}>
              <div style={{ fontSize: '12px', color: '#558b2f', fontWeight: 600 }}>Present</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#2e7d32' }}>{summary.present}</div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', background: '#ffebee', minWidth: '110px' }}>
              <div style={{ fontSize: '12px', color: '#b71c1c', fontWeight: 600 }}>Absent</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#d32f2f' }}>{summary.absent}</div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', background: '#fff3e0', minWidth: '110px' }}>
              <div style={{ fontSize: '12px', color: '#e65100', fontWeight: 600 }}>Late</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#f57c00' }}>{summary.late}</div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', background: '#ede7f6', minWidth: '110px' }}>
              <div style={{ fontSize: '12px', color: '#6a1b9a', fontWeight: 600 }}>Half-Day</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#7b1fa2' }}>{summary.halfDay}</div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', background: '#e1f5fe', minWidth: '140px' }}>
              <div style={{ fontSize: '12px', color: '#006064', fontWeight: 600 }}>Total Hours</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#0097a7' }}>{(summary.totalHours || 0).toFixed(1)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Attendance */}
      <div className="card">
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>📋 Recent Attendance</h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>⏳</div>
            Loading attendance records...
          </div>
        ) : history.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>📅 Date</th>
                  <th>📊 Status</th>
                  <th>⏱️ Check-In</th>
                  <th>⏱️ Check-Out</th>
                  <th>⌛ Duration</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 10).map((h, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fafafa' : 'white' }}>
                    <td style={{ fontWeight: '500' }}>{new Date(h.date).toLocaleDateString()}</td>
                    <td>
                      <span className="badge" style={{
                        background: h.status === 'present' ? 'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)' : 
                                  h.status === 'absent' ? 'linear-gradient(135deg, #ffcccc 0%, #ffb3b3 100%)' : 
                                  h.status === 'late' ? 'linear-gradient(135deg, #fff9c4 0%, #fff59d 100%)' : 
                                  'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
                        color: h.status === 'present' ? '#2e7d32' :
                               h.status === 'absent' ? '#c62828' :
                               h.status === 'late' ? '#f57f17' : '#721c24'
                      }}>
                        {h.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{h.checkInTime ? new Date(h.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td>{h.checkOutTime ? new Date(h.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td style={{ fontWeight: '600', color: '#ffc107' }}>{h.totalHours ? h.totalHours.toFixed(2) + 'h' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>📭</div>
            No attendance records yet
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
