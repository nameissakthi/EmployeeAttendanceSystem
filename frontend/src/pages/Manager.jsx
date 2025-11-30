import React, { useState, useEffect } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Manager() {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState(null)
  const [employees, setEmployees] = useState([])
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [employeesLoading, setEmployeesLoading] = useState(true)
  const pageSize = 5
  const { logout } = useAuth()

  async function loadSummary() {
    try {
      setSummaryLoading(true)
      setError('')
      const res = await api.get('/api/attendance/summary')
      setSummary(res.data)
      console.log('Summary loaded:', res.data)
    } catch (e) {
      console.error('Failed to load summary', e)
      setError(`Summary Error: ${e.response?.data?.error || e.message}`)
      setSummary(null)
    } finally {
      setSummaryLoading(false)
    }
  }

  async function loadEmployees() {
    try {
      setEmployeesLoading(true)
      setError('')
      const res = await api.get('/api/attendance/employees-list')
      setEmployees(res.data)
      console.log('Employees loaded:', res.data)
    } catch (e) {
      console.error('Failed to load employees', e)
      setError(`Employees Error: ${e.response?.data?.error || e.message}`)
      setEmployees([])
    } finally {
      setEmployeesLoading(false)
    }
  }

  async function download() {
    setLoading(true)
    try {
      const res = await api.get('/api/attendance/export', { params: { start, end, employeeId }, responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `attendance_${start || 'from'}_${end || 'to'}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (e) {
      alert(e.response?.data?.error || 'Export failed')
    } finally { setLoading(false) }
  }

  useEffect(() => {
    loadSummary()
    loadEmployees()
  }, [])

  return (
    <div className="page">
      <header className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Manager Reports</h2>
        <button onClick={logout} style={{ padding: '8px 16px', cursor: 'pointer' }}>Logout</button>
      </header>

      {error && <div style={{ padding: 12, backgroundColor: '#ffcccc', borderRadius: 4, marginBottom: 12, color: '#cc0000' }}><strong>Error:</strong> {error}</div>}

      <section className="card">
        <h3>Team Summary</h3>
        {summaryLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading summary...</div>
        ) : summary ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div style={{ backgroundColor: '#e3f2fd', padding: 16, borderRadius: 8, borderLeft: '4px solid #2196f3' }}>
              <div style={{ fontSize: '12px', color: '#555', marginBottom: 8 }}>Total Employees</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196f3' }}>{summary.totalEmployees}</div>
            </div>
            <div style={{ backgroundColor: '#e8f5e9', padding: 16, borderRadius: 8, borderLeft: '4px solid #4caf50' }}>
              <div style={{ fontSize: '12px', color: '#555', marginBottom: 8 }}>Present Today</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4caf50' }}>{summary.todayPresent}</div>
            </div>
            <div style={{ backgroundColor: '#ffebee', padding: 16, borderRadius: 8, borderLeft: '4px solid #f44336' }}>
              <div style={{ fontSize: '12px', color: '#555', marginBottom: 8 }}>Absent Today</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f44336' }}>{summary.todayAbsent}</div>
            </div>
            <div style={{ backgroundColor: '#fff3e0', padding: 16, borderRadius: 8, borderLeft: '4px solid #ff9800' }}>
              <div style={{ fontSize: '12px', color: '#555', marginBottom: 8 }}>Late Arrivals</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9800' }}>{summary.lateArrivals.length}</div>
            </div>
          </div>
        ) : <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No summary data available</div>}
      </section>

      <section className="card">
        <h3>Team Attendance</h3>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label>Filter by department</label>
            <input value={departmentFilter} onChange={e => { setDepartmentFilter(e.target.value); setPage(1) }} placeholder="e.g., Engineering" style={{ width: '100%' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Filter by status</label>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} style={{ width: '100%', padding: '8px' }}>
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half-Day</option>
            </select>
          </div>
        </div>
        {employeesLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading team data...</div>
        ) : employees.length > 0 ? (
          <>
            <table style={{ marginTop: 12, width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>EmployeeId</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Department</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Today Status</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Today Check-In</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Recent Status</th>
                </tr>
              </thead>
              <tbody>
                {employees
                  .filter(e => !departmentFilter || e.department === departmentFilter)
                  .filter(e => !statusFilter || e.todayStatus === statusFilter)
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map(emp => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>{emp.employeeId}</td>
                      <td style={{ padding: '10px' }}>{emp.name}</td>
                      <td style={{ padding: '10px' }}>{emp.department}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: emp.todayStatus === 'present' ? '#d4edda' : emp.todayStatus === 'absent' ? '#f8d7da' : '#fff3cd',
                          color: emp.todayStatus === 'present' ? '#155724' : emp.todayStatus === 'absent' ? '#721c24' : '#856404'
                        }}>
                          {emp.todayStatus}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>{emp.todayCheckIn ? new Date(emp.todayCheckIn).toLocaleTimeString() : '-'}</td>
                      <td style={{ padding: '10px' }}>{emp.recentStatus} ({emp.recentDate})</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
              <div style={{ padding: '8px 12px' }}>Page {page}</div>
              <button onClick={() => setPage(p => p + 1)} disabled={(page * pageSize) >= employees.filter(e => !departmentFilter || e.department === departmentFilter).filter(e => !statusFilter || e.todayStatus === statusFilter).length}>Next →</button>
            </div>
          </>
        ) : <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No employees found</div>}
      </section>

      <section className="card">
        <h3>📊 Export Attendance Report</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Start Date (YYYY-MM-DD)</label>
            <input value={start} onChange={e => setStart(e.target.value)} placeholder="2025-11-01" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>End Date (YYYY-MM-DD)</label>
            <input value={end} onChange={e => setEnd(e.target.value)} placeholder="2025-11-30" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Employee ID (Optional)</label>
            <input value={employeeId} onChange={e => setEmployeeId(e.target.value)} placeholder="EMP001 or leave blank" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
          </div>
        </div>
        <button onClick={download} disabled={loading} style={{ padding: '10px 20px', backgroundColor: loading ? '#ccc' : '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px' }}>
          {loading ? '⏳ Preparing...' : '📥 Download CSV'}
        </button>
      </section>
    </div>
  )
}
