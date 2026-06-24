import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useTokens } from '../ThemeContext';
import api from '../api';

const ROLES = ['manager', 'waiter', 'chef', 'cashier', 'delivery', 'other'];

const ROLE_META = {
  manager:  { bg: '#ffedd5', color: '#f97316' },
  waiter:   { bg: '#d1fae5', color: '#065f46' },
  chef:     { bg: '#fef3c7', color: '#92400e' },
  cashier:  { bg: '#dbeafe', color: '#1e40af' },
  delivery: { bg: '#fce7f3', color: '#9d174d' },
  other:    { bg: '#f3f4f6', color: '#374151' },
};

const STATUS_OPTS = [
  { value: 'present',  label: 'Present',  bg: '#6cf8bb', color: '#00714d' },
  { value: 'absent',   label: 'Absent',   bg: '#ffd6d6', color: '#ba1a1a' },
  { value: 'half-day', label: 'Half Day', bg: '#ffdcc3', color: '#884800' },
  { value: 'leave',    label: 'Leave',    bg: '#ffedd5', color: '#f97316' },
];

const todayStr  = () => new Date().toISOString().split('T')[0];
const monthStr  = () => new Date().toISOString().slice(0, 7);

const EMPTY_FORM = { name: '', phone: '', email: '', role: 'other', monthlySalary: '', isActive: true };

/* ─── Reusable inline input ─── */
function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  const T = useTokens();
  return (
    <Box>
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </Typography>
      <Box
        component="input"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        sx={{
          width: '100%', px: 2, py: 1.5, bgcolor: T.surfaceAlt,
          border: `1.5px solid ${T.surfaceHigh}`, borderRadius: '0.5rem',
          fontSize: '0.9375rem', fontFamily: 'Inter, sans-serif', color: T.text,
          outline: 'none', boxSizing: 'border-box',
          '&:focus': { borderColor: '#f97316' },
        }}
      />
    </Box>
  );
}

/* ─── Stat card ─── */
function StatCard({ label, value, gradient = false, valueColor }) {
  const T = useTokens();
  return (
    <Box sx={{
      p: 3, borderRadius: '0.75rem', boxShadow: T.shadow,
      ...(gradient
        ? { background: 'linear-gradient(135deg,#f97316,#ea580c)' }
        : { bgcolor: T.surface }),
    }}>
      <Typography sx={{
        fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.1em', mb: 1,
        color: gradient ? 'rgba(255,237,213,0.8)' : T.textSub,
      }}>
        {label}
      </Typography>
      <Typography sx={{
        fontSize: '1.875rem', fontWeight: 900,
        color: gradient ? '#fff' : (valueColor || T.text),
      }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function EmployeeManagementView() {
  const T = useTokens();
  const [tab, setTab] = useState('Staff');

  /* ── Staff state ── */
  const [employees, setEmployees]   = useState([]);
  const [loadingEmps, setLoadingEmps] = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editEmp, setEditEmp]       = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [formErr, setFormErr]       = useState('');

  /* ── Attendance state ── */
  const [attDate, setAttDate]   = useState(todayStr);
  const [attMap, setAttMap]     = useState({});   // { empId: status }
  const [loadingAtt, setLoadingAtt] = useState(false);
  const [savingAtt, setSavingAtt]   = useState(false);
  const [attMsg, setAttMsg]         = useState('');

  /* ── Salary state ── */
  const [salMonth, setSalMonth]     = useState(monthStr);
  const [salSummary, setSalSummary] = useState([]);
  const [loadingSal, setLoadingSal] = useState(false);

  /* ── Fetch employees ── */
  const fetchEmployees = useCallback(async () => {
    try {
      setLoadingEmps(true);
      const { data } = await api.get('/api/employees');
      setEmployees(data);
    } catch {
      // silent
    } finally {
      setLoadingEmps(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  /* ── Fetch attendance when date or tab changes ── */
  useEffect(() => {
    if (tab !== 'Attendance') return;
    (async () => {
      try {
        setLoadingAtt(true);
        const { data } = await api.get(`/api/attendance?date=${attDate}`);
        const map = {};
        data.forEach(r => {
          const id = r.employeeId?._id || r.employeeId;
          map[id] = r.status;
        });
        setAttMap(map);
      } catch {
        // silent
      } finally {
        setLoadingAtt(false);
      }
    })();
  }, [attDate, tab]);

  /* ── Fetch salary when month or tab changes ── */
  useEffect(() => {
    if (tab !== 'Salary') return;
    (async () => {
      try {
        setLoadingSal(true);
        const { data } = await api.get(`/api/attendance/salary-summary?month=${salMonth}`);
        setSalSummary(data);
      } catch {
        // silent
      } finally {
        setLoadingSal(false);
      }
    })();
  }, [salMonth, tab]);

  /* ── Employee CRUD ── */
  function openAdd() {
    setEditEmp(null);
    setForm(EMPTY_FORM);
    setFormErr('');
    setShowForm(true);
  }

  function openEdit(emp) {
    setEditEmp(emp);
    setForm({
      name: emp.name, phone: emp.phone, email: emp.email || '',
      role: emp.role, monthlySalary: String(emp.monthlySalary), isActive: emp.isActive,
    });
    setFormErr('');
    setShowForm(true);
  }

  async function handleSaveEmployee() {
    if (!form.name.trim() || !form.phone.trim() || !form.monthlySalary) {
      setFormErr('Name, phone and salary are required.');
      return;
    }
    setSaving(true);
    setFormErr('');
    try {
      const payload = { ...form, monthlySalary: Number(form.monthlySalary) };
      if (editEmp) {
        await api.put(`/api/employees/${editEmp._id}`, payload);
      } else {
        await api.post('/api/employees', payload);
      }
      await fetchEmployees();
      setShowForm(false);
    } catch (e) {
      setFormErr(e?.response?.data?.message || 'Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this employee permanently?')) return;
    try {
      await api.delete(`/api/employees/${id}`);
      setEmployees(prev => prev.filter(e => e._id !== id));
    } catch {
      // silent
    }
  }

  /* ── Attendance ── */
  async function saveAttendance() {
    setSavingAtt(true);
    setAttMsg('');
    try {
      const records = employees.map(emp => ({
        employeeId: emp._id,
        status: attMap[emp._id] || 'absent',
      }));
      await api.post('/api/attendance/bulk', { date: attDate, records });
      setAttMsg('Attendance saved!');
      setTimeout(() => setAttMsg(''), 3000);
    } catch {
      setAttMsg('Failed to save. Try again.');
    } finally {
      setSavingAtt(false);
    }
  }

  function markAll(status) {
    const map = {};
    employees.forEach(e => { map[e._id] = status; });
    setAttMap(map);
  }

  /* ── Derived ── */
  const activeCount  = employees.filter(e => e.isActive).length;
  const payroll      = employees.filter(e => e.isActive).reduce((s, e) => s + e.monthlySalary, 0);
  const totalSalPayable = salSummary.reduce((s, r) => s + r.calculatedSalary, 0);

  /* ── Shared input style ── */
  const inputSx = {
    px: 2, py: 1.5, bgcolor: T.surfaceAlt, border: `1.5px solid ${T.surfaceHigh}`,
    borderRadius: '0.5rem', fontSize: '0.9375rem', fontFamily: 'Inter, sans-serif',
    color: T.text, outline: 'none', '&:focus': { borderColor: '#f97316' },
  };

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <Box sx={{ color: T.text, pb: 4 }}>

      {/* ── Page header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { sm: 'flex-end' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4 }}>
        <Box>
          <Typography sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 900, letterSpacing: '-0.04em', color: T.text }}>
            Employee Management
          </Typography>
          <Typography sx={{ color: T.textSub, fontWeight: 500, mt: 0.5, fontSize: '0.9rem' }}>
            Manage your team, track daily attendance, and review salaries.
          </Typography>
        </Box>
        {tab === 'Staff' && (
          <Box
            component="button"
            onClick={openAdd}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1, px: 3, py: 1.5,
              bgcolor: '#f97316', color: '#fff', borderRadius: '9999px', border: 'none',
              cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700,
              whiteSpace: 'nowrap', alignSelf: { xs: 'flex-start', sm: 'auto' },
              '&:hover': { bgcolor: '#c2410c' }, transition: 'background-color 0.2s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
            Add Employee
          </Box>
        )}
      </Box>

      {/* ── Tabs ── */}
      <Box sx={{ display: 'flex', gap: 1, mb: 5, bgcolor: T.surface, p: 1, borderRadius: '9999px', width: 'fit-content', boxShadow: T.shadow }}>
        {['Staff', 'Attendance', 'Salary'].map(t => (
          <Box
            component="button"
            key={t}
            onClick={() => setTab(t)}
            sx={{
              px: { xs: 2, sm: 3 }, py: 1, borderRadius: '9999px', border: 'none',
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              fontSize: { xs: '0.8rem', sm: '0.875rem' }, fontWeight: 700,
              transition: 'all 0.2s',
              bgcolor: tab === t ? '#f97316' : 'transparent',
              color:   tab === t ? '#fff'    : T.textSub,
            }}
          >
            {t}
          </Box>
        ))}
      </Box>

      {/* ═══════════════ STAFF TAB ═══════════════ */}
      {tab === 'Staff' && (
        <Box>
          {/* Stats */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 5 }}>
            <StatCard label="Total Staff"    value={employees.length} />
            <StatCard label="Active"         value={activeCount}      valueColor="#006c49" />
            <StatCard label="Monthly Payroll" value={`₹${payroll.toLocaleString('en-IN')}`} gradient />
          </Box>

          {loadingEmps ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress size={32} sx={{ color: '#f97316' }} />
            </Box>
          ) : employees.length === 0 ? (
            <Box sx={{ bgcolor: T.surface, p: { xs: 6, md: 10 }, borderRadius: '0.75rem', textAlign: 'center', boxShadow: T.shadow }}>
              <span className="material-symbols-outlined" style={{ fontSize: 56, color: T.textMuted, display: 'block', marginBottom: 16 }}>group</span>
              <Typography sx={{ color: T.textSub, fontWeight: 600, fontSize: '1.05rem' }}>
                No employees yet.
              </Typography>
              <Typography sx={{ color: T.textMuted, mt: 0.5 }}>
                Click "Add Employee" to onboard your first team member.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 3 }}>
              {employees.map(emp => {
                const rm = ROLE_META[emp.role] || ROLE_META.other;
                return (
                  <Box key={emp._id} sx={{
                    bgcolor: T.surface, p: 3, borderRadius: '0.75rem', boxShadow: T.shadow,
                    transition: 'box-shadow 0.2s', '&:hover': { boxShadow: T.shadowHov },
                    display: 'flex', flexDirection: 'column', gap: 2,
                  }}>
                    {/* Card header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                        <Box sx={{
                          width: 48, height: 48, borderRadius: '50%', bgcolor: T.surfaceAlt, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, color: '#f97316', fontSize: '1.125rem',
                        }}>
                          {emp.name[0].toUpperCase()}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.9375rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {emp.name}
                          </Typography>
                          <Box component="span" sx={{
                            display: 'inline-block', mt: 0.5, px: 1.5, py: 0.25,
                            bgcolor: rm.bg, color: rm.color, borderRadius: '9999px',
                            fontSize: '0.6875rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em',
                          }}>
                            {emp.role}
                          </Box>
                        </Box>
                      </Box>
                      {/* Action buttons */}
                      <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                        <Box component="button" onClick={() => openEdit(emp)} sx={{
                          p: 1, bgcolor: T.surfaceAlt, border: 'none', cursor: 'pointer',
                          borderRadius: '0.5rem', color: T.textSub, display: 'flex',
                          '&:hover': { bgcolor: T.surfaceHigh, color: '#f97316' }, transition: 'all 0.15s',
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                        </Box>
                        <Box component="button" onClick={() => handleDelete(emp._id)} sx={{
                          p: 1, bgcolor: T.surfaceAlt, border: 'none', cursor: 'pointer',
                          borderRadius: '0.5rem', color: T.textSub, display: 'flex',
                          '&:hover': { bgcolor: '#ffd6d6', color: '#ba1a1a' }, transition: 'all 0.15s',
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                        </Box>
                      </Box>
                    </Box>

                    {/* Contact info */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 15, color: T.textMuted }}>phone</span>
                        <Typography sx={{ fontSize: '0.875rem', color: T.textSub }}>{emp.phone}</Typography>
                      </Box>
                      {emp.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 15, color: T.textMuted }}>email</span>
                          <Typography sx={{ fontSize: '0.875rem', color: T.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {emp.email}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Footer */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: `1px solid ${T.surfaceHigh}` }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.7rem', color: T.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Monthly
                        </Typography>
                        <Typography sx={{ fontWeight: 900, color: T.text, fontSize: '1.125rem' }}>
                          ₹{emp.monthlySalary.toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                      <Box sx={{
                        px: 2, py: 0.75, borderRadius: '9999px',
                        bgcolor:  emp.isActive ? '#6cf8bb' : T.surfaceHigh,
                        color:    emp.isActive ? '#00714d' : T.textMuted,
                        fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      )}

      {/* ═══════════════ ATTENDANCE TAB ═══════════════ */}
      {tab === 'Attendance' && (
        <Box>
          {/* Controls */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <Box>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Date
              </Typography>
              <Box
                component="input"
                type="date"
                value={attDate}
                onChange={e => setAttDate(e.target.value)}
                sx={{ ...inputSx, cursor: 'pointer' }}
              />
            </Box>
            {employees.length > 0 && (
              <>
                <Box component="button" onClick={() => markAll('present')} sx={{
                  px: 3, py: 1.5, bgcolor: T.surface, color: '#006c49',
                  border: '1.5px solid #6cf8bb', borderRadius: '9999px',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 700,
                  '&:hover': { bgcolor: '#6cf8bb20' },
                }}>
                  Mark All Present
                </Box>
                <Box component="button" onClick={() => markAll('absent')} sx={{
                  px: 3, py: 1.5, bgcolor: T.surface, color: '#ba1a1a',
                  border: '1.5px solid #ffd6d6', borderRadius: '9999px',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 700,
                  '&:hover': { bgcolor: '#ffd6d620' },
                }}>
                  Mark All Absent
                </Box>
                <Box component="button" onClick={saveAttendance} disabled={savingAtt} sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  px: 3, py: 1.5, bgcolor: savingAtt ? T.surfaceHigh : '#f97316',
                  color: savingAtt ? T.textMuted : '#fff', borderRadius: '9999px',
                  border: 'none', cursor: savingAtt ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700,
                  transition: 'background-color 0.2s',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    {savingAtt ? 'hourglass_empty' : 'save'}
                  </span>
                  {savingAtt ? 'Saving…' : 'Save Attendance'}
                </Box>
              </>
            )}
          </Box>

          {attMsg && (
            <Box sx={{
              mb: 3, px: 3, py: 1.5, borderRadius: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: 1,
              bgcolor: attMsg.includes('saved') ? '#6cf8bb' : '#ffd6d6',
              color:   attMsg.includes('saved') ? '#00714d'  : '#ba1a1a',
              fontSize: '0.875rem', fontWeight: 700,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {attMsg.includes('saved') ? 'check_circle' : 'error'}
              </span>
              {attMsg}
            </Box>
          )}

          {loadingAtt ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress size={32} sx={{ color: '#f97316' }} />
            </Box>
          ) : employees.length === 0 ? (
            <Box sx={{ bgcolor: T.surface, p: 8, borderRadius: '0.75rem', textAlign: 'center', boxShadow: T.shadow }}>
              <Typography sx={{ color: T.textSub }}>Add employees first to mark attendance.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {employees.map(emp => {
                const rm = ROLE_META[emp.role] || ROLE_META.other;
                const cur = attMap[emp._id] || '';
                return (
                  <Box key={emp._id} sx={{
                    bgcolor: T.surface, p: { xs: 2, sm: 3 }, borderRadius: '0.75rem', boxShadow: T.shadow,
                    display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2,
                  }}>
                    {/* Employee info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <Box sx={{
                        width: 44, height: 44, borderRadius: '50%', bgcolor: T.surfaceAlt, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, color: '#f97316',
                      }}>
                        {emp.name[0].toUpperCase()}
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.9375rem' }}>{emp.name}</Typography>
                        <Box component="span" sx={{
                          display: 'inline-block', mt: 0.25, px: 1.5, py: 0.25,
                          bgcolor: rm.bg, color: rm.color, borderRadius: '9999px',
                          fontSize: '0.6875rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                          {emp.role}
                        </Box>
                      </Box>
                    </Box>

                    {/* Status pills */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {STATUS_OPTS.map(opt => (
                        <Box
                          component="button"
                          key={opt.value}
                          onClick={() => setAttMap(prev => ({ ...prev, [emp._id]: opt.value }))}
                          sx={{
                            px: { xs: 1.5, sm: 2 }, py: 0.75, borderRadius: '9999px',
                            border: `1.5px solid ${cur === opt.value ? opt.bg : 'transparent'}`,
                            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }, fontWeight: 700, transition: 'all 0.15s',
                            bgcolor: cur === opt.value ? opt.bg   : T.surfaceAlt,
                            color:   cur === opt.value ? opt.color : T.textSub,
                          }}
                        >
                          {opt.label}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      )}

      {/* ═══════════════ SALARY TAB ═══════════════ */}
      {tab === 'Salary' && (
        <Box>
          {/* Month picker */}
          <Box sx={{ mb: 5 }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Month
            </Typography>
            <Box
              component="input"
              type="month"
              value={salMonth}
              onChange={e => setSalMonth(e.target.value)}
              sx={{ ...inputSx, cursor: 'pointer', width: 'auto' }}
            />
          </Box>

          {loadingSal ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress size={32} sx={{ color: '#f97316' }} />
            </Box>
          ) : salSummary.length === 0 ? (
            <Box sx={{ bgcolor: T.surface, p: 8, borderRadius: '0.75rem', textAlign: 'center', boxShadow: T.shadow }}>
              <Typography sx={{ color: T.textSub }}>No employee data found for this month.</Typography>
            </Box>
          ) : (
            <Box>
              {/* Summary stats */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 5 }}>
                <StatCard label="Total Payable"     value={`₹${totalSalPayable.toLocaleString('en-IN')}`} gradient />
                <StatCard label="Employees"         value={salSummary.length} />
                <StatCard label="Total Absent Days" value={salSummary.reduce((s, r) => s + r.absentDays, 0)} valueColor="#ba1a1a" />
                <StatCard label="Total Leave Days"  value={salSummary.reduce((s, r) => s + r.leaveDays, 0)}  valueColor="#f97316" />
              </Box>

              {/* Salary table — scrollable on mobile */}
              <Box sx={{ bgcolor: T.surface, borderRadius: '0.75rem', boxShadow: T.shadow, overflow: 'hidden' }}>
                {/* Header */}
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr auto', sm: '2fr repeat(5, 1fr)' },
                  gap: 1, px: { xs: 2, sm: 3 }, py: 2,
                  bgcolor: T.surfaceAlt, borderBottom: `1px solid ${T.surfaceHigh}`,
                }}>
                  {['Employee', 'Present', 'Half', 'Absent', 'Leave', 'Salary'].map((h, i) => (
                    <Typography key={h} sx={{
                      fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase',
                      letterSpacing: '0.08em', color: T.textSub,
                      display: { xs: i > 0 && i < 5 ? 'none' : 'block', sm: 'block' },
                    }}>
                      {h}
                    </Typography>
                  ))}
                </Box>

                {salSummary.map((s, idx) => (
                  <Box key={s.employee._id} sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr auto', sm: '2fr repeat(5, 1fr)' },
                    gap: 1, px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 },
                    borderBottom: idx < salSummary.length - 1 ? `1px solid ${T.surfaceHigh}` : 'none',
                    alignItems: 'center',
                  }}>
                    {/* Employee */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{
                        width: 36, height: 36, borderRadius: '50%', bgcolor: T.surfaceAlt, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, color: '#f97316', fontSize: '0.875rem',
                      }}>
                        {s.employee.name[0].toUpperCase()}
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.875rem' }}>{s.employee.name}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: T.textMuted, textTransform: 'capitalize' }}>{s.employee.role}</Typography>
                      </Box>
                    </Box>

                    {/* Present */}
                    <Typography sx={{ fontWeight: 700, color: '#006c49', display: { xs: 'none', sm: 'block' } }}>{s.presentDays}</Typography>
                    {/* Half */}
                    <Typography sx={{ fontWeight: 700, color: '#884800', display: { xs: 'none', sm: 'block' } }}>{s.halfDays}</Typography>
                    {/* Absent */}
                    <Typography sx={{ fontWeight: 700, color: '#ba1a1a', display: { xs: 'none', sm: 'block' } }}>{s.absentDays}</Typography>
                    {/* Leave */}
                    <Typography sx={{ fontWeight: 700, color: '#f97316', display: { xs: 'none', sm: 'block' } }}>{s.leaveDays}</Typography>

                    {/* Salary */}
                    <Box>
                      <Typography sx={{ fontWeight: 900, color: T.text, fontSize: '1rem' }}>
                        ₹{s.calculatedSalary.toLocaleString('en-IN')}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: T.textMuted }}>
                        of ₹{s.employee.monthlySalary.toLocaleString('en-IN')}
                      </Typography>
                    </Box>
                  </Box>
                ))}

                {/* Total row */}
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr auto', sm: '2fr repeat(5, 1fr)' },
                  gap: 1, px: { xs: 2, sm: 3 }, py: 2.5,
                  bgcolor: T.surfaceAlt, alignItems: 'center',
                }}>
                  <Typography sx={{ fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem' }}>
                    Total Payroll
                  </Typography>
                  <Box sx={{ display: { xs: 'none', sm: 'block' }, gridColumn: '2 / 6' }} />
                  <Typography sx={{ fontWeight: 900, color: '#f97316', fontSize: '1.125rem' }}>
                    ₹{totalSalPayable.toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </Box>

              {/* Mobile detail cards (shown only xs) */}
              <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column', gap: 2, mt: 4 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Attendance Breakdown
                </Typography>
                {salSummary.map(s => (
                  <Box key={`mob-${s.employee._id}`} sx={{ bgcolor: T.surface, p: 3, borderRadius: '0.75rem', boxShadow: T.shadow }}>
                    <Typography sx={{ fontWeight: 700, color: T.text, mb: 1.5 }}>{s.employee.name}</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                      {[
                        { label: 'Present',  value: s.presentDays, color: '#006c49' },
                        { label: 'Half Day', value: s.halfDays,    color: '#884800' },
                        { label: 'Absent',   value: s.absentDays,  color: '#ba1a1a' },
                        { label: 'Leave',    value: s.leaveDays,   color: '#f97316' },
                      ].map(row => (
                        <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ fontSize: '0.8rem', color: T.textSub }}>{row.label}</Typography>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: row.color }}>{row.value}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* ═══════════════ ADD / EDIT MODAL ═══════════════ */}
      {showForm && (
        <Box
          sx={{
            position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.55)', zIndex: 1200,
            display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2,
          }}
          onClick={() => setShowForm(false)}
        >
          <Box
            sx={{
              bgcolor: T.surface, borderRadius: '1.25rem', p: { xs: 3, sm: 4 },
              maxWidth: 480, width: '100%',
              boxShadow: '0 32px 64px rgba(0,0,0,0.25)',
              maxHeight: '90vh', overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: T.text }}>
                {editEmp ? 'Edit Employee' : 'Add Employee'}
              </Typography>
              <Box component="button" onClick={() => setShowForm(false)} sx={{
                p: 1, bgcolor: 'transparent', border: 'none', cursor: 'pointer',
                color: T.textSub, display: 'flex',
                '&:hover': { color: T.text },
              }}>
                <span className="material-symbols-outlined">close</span>
              </Box>
            </Box>

            {/* Fields */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Field
                label="Full Name *"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Raj Kumar"
              />
              <Field
                label="Phone *"
                type="tel"
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="e.g. 9876543210"
              />
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="e.g. raj@example.com"
              />
              <Field
                label="Monthly Salary (₹) *"
                type="number"
                value={form.monthlySalary}
                onChange={e => setForm(p => ({ ...p, monthlySalary: e.target.value }))}
                placeholder="e.g. 18000"
              />

              {/* Role select */}
              <Box>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Role
                </Typography>
                <Box
                  component="select"
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  sx={{ ...inputSx, width: '100%', cursor: 'pointer', textTransform: 'capitalize' }}
                >
                  {ROLES.map(r => (
                    <option key={r} value={r} style={{ textTransform: 'capitalize' }}>
                      {r[0].toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </Box>
              </Box>

              {/* Active toggle (edit only) */}
              {editEmp && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: T.textSub }}>Status:</Typography>
                  <Box
                    component="button"
                    onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                    sx={{
                      px: 2.5, py: 0.75, borderRadius: '9999px', border: 'none', cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 900,
                      bgcolor: form.isActive ? '#6cf8bb' : T.surfaceHigh,
                      color:   form.isActive ? '#00714d' : T.textMuted,
                    }}
                  >
                    {form.isActive ? 'Active' : 'Inactive'}
                  </Box>
                </Box>
              )}

              {/* Error */}
              {formErr && (
                <Typography sx={{ fontSize: '0.8rem', color: '#ba1a1a', fontWeight: 600 }}>{formErr}</Typography>
              )}
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Box component="button" onClick={() => setShowForm(false)} sx={{
                flex: 1, py: 1.5, bgcolor: T.surfaceAlt, color: T.textSub,
                border: 'none', cursor: 'pointer', borderRadius: '0.75rem',
                fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700,
              }}>
                Cancel
              </Box>
              <Box
                component="button"
                onClick={handleSaveEmployee}
                disabled={saving}
                sx={{
                  flex: 2, py: 1.5,
                  bgcolor: saving ? T.surfaceHigh : '#f97316',
                  color:   saving ? T.textMuted  : '#fff',
                  border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                  borderRadius: '0.75rem', fontFamily: 'Inter, sans-serif',
                  fontSize: '0.875rem', fontWeight: 700, transition: 'background-color 0.2s',
                }}
              >
                {saving ? 'Saving…' : (editEmp ? 'Update Employee' : 'Add Employee')}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
