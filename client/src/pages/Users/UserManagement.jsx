import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import {
  UserPlus,
  Users,
  Search,
  Shield,
  Mail,
  UserCheck,
  Edit,
  Trash2,
  Lock,
  Check,
  X,
  Eye,
  EyeOff,
  GraduationCap,
  Briefcase,
  User as UserIcon,
  Copy
} from 'lucide-react';

const ROLE_OPTIONS = [
  'Principal Administrator',
  'Faculty / Teacher',
  'Department Head',
  'Administrative Staff',
  'Student'
];

const COLOR_OPTIONS = ['#2563eb', '#059669', '#7c3aed', '#d97706', '#dc2626', '#0891b2'];

export default function UserManagement() {
  const { users = [], addUser, updateUser, deleteUser, showToast } = useSchool();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    regNo: '',
    email: '',
    password: '',
    role: 'Faculty / Teacher',
    avatarColor: '#2563eb'
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        (user.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (user.regNo || '').toLowerCase().includes(search.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // Counts
  const adminCount = useMemo(() => users.filter(u => String(u.role).toLowerCase().includes('admin')).length, [users]);
  const facultyCount = useMemo(() => users.filter(u => String(u.role).toLowerCase().includes('faculty') || String(u.role).toLowerCase().includes('teacher')).length, [users]);
  const staffCount = useMemo(() => users.filter(u => !String(u.role).toLowerCase().includes('admin') && !String(u.role).toLowerCase().includes('faculty') && !String(u.role).toLowerCase().includes('teacher')).length, [users]);

  // Copy helper
  const handleCopyRegNo = (regNo) => {
    navigator.clipboard.writeText(regNo);
    showToast(`Copied "${regNo}" to clipboard.`);
  };

  // Handlers for Modals
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      regNo: '',
      email: '',
      password: '',
      role: 'Faculty / Teacher',
      avatarColor: COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)]
    });
    setShowPassword(false);
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      regNo: user.regNo || '',
      email: user.email || '',
      password: '',
      role: user.role || 'Faculty / Teacher',
      avatarColor: user.avatarColor || '#2563eb'
    });
    setShowPassword(false);
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) return setFormError('Full Name is required.');
    if (!formData.regNo.trim()) return setFormError('Registration No / Employee ID is required.');
    if (!formData.email.trim()) return setFormError('Email Address is required.');
    if (!formData.password.trim()) return setFormError('Password is required for new accounts.');

    setIsSubmitting(true);
    try {
      await addUser({
        name: formData.name.trim(),
        regNo: formData.regNo.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        role: formData.role,
        avatarColor: formData.avatarColor
      });
      setIsSubmitting(false);
      setIsAddModalOpen(false);
    } catch (err) {
      setIsSubmitting(false);
      setFormError(err.message || 'Failed to create user account.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) return setFormError('Full Name is required.');
    if (!formData.regNo.trim()) return setFormError('Registration No / Employee ID is required.');
    if (!formData.email.trim()) return setFormError('Email Address is required.');

    setIsSubmitting(true);
    try {
      await updateUser({
        id: selectedUser.id,
        name: formData.name.trim(),
        regNo: formData.regNo.trim(),
        email: formData.email.trim(),
        password: formData.password.trim() || undefined,
        role: formData.role,
        avatarColor: formData.avatarColor
      });
      setIsSubmitting(false);
      setIsEditModalOpen(false);
    } catch (err) {
      setIsSubmitting(false);
      setFormError(err.message || 'Failed to update user account.');
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedUser) {
      await deleteUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      
      {/* Top Filter & Actions Bar (Standard Section Header) */}
      <div className="section-header">
        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search user by name, ID, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="select-custom"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All System Roles</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      {/* Summary KPI Stats Row (Standard BITSchool Stat Cards) */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div>
            <div className="stat-lbl">Total Accounts</div>
            <div className="stat-val">{users.length}</div>
          </div>
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div>
            <div className="stat-lbl">Administrators</div>
            <div className="stat-val">{adminCount}</div>
          </div>
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
            <Shield size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div>
            <div className="stat-lbl">Faculty Accounts</div>
            <div className="stat-val">{facultyCount}</div>
          </div>
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#047857' }}>
            <GraduationCap size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div>
            <div className="stat-lbl">Staff & Other Accounts</div>
            <div className="stat-val">{staffCount}</div>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <UserCheck size={24} />
          </div>
        </div>
      </div>

      {/* Users Table / Empty State */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No User Accounts Found"
          description="There are currently no user accounts matching your search or role filters. Click below to create a new user profile."
          actionText="Add New User"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>User Details</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Reg No / ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Email Address</th>
                  <th style={{ padding: '0.75rem 1rem' }}>System Role</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const userPic = user.picture || user.avatar || user.photoURL;
                  const isPrimaryAdmin = String(user.role).toLowerCase().includes('admin') || String(user.role).toLowerCase().includes('principal');

                  return (
                    <tr
                      key={user.id}
                      style={{ borderBottom: '1px solid var(--border-color)' }}
                    >
                      {/* Name & Avatar */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: user.avatarColor || '#2563eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              flexShrink: 0
                            }}
                          >
                            {userPic ? (
                              <img src={userPic} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              <UserIcon size={18} color="#ffffff" style={{ color: '#ffffff' }} />
                            )}
                          </div>

                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{user.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: 600 }}>Active Account</div>
                          </div>
                        </div>
                      </td>

                      {/* Reg No / Staff ID */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '3px 8px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-main)', fontSize: '0.8rem' }}>
                            {user.regNo}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyRegNo(user.regNo)}
                            title="Copy ID"
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>

                      {/* Email Address */}
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                          <span>{user.email}</span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          className={`badge ${isPrimaryAdmin ? 'badge-purple' : 'badge-normal'}`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleOpenEditModal(user)}
                            title="Edit User"
                            style={{ padding: '0.35rem 0.6rem' }}
                          >
                            <Edit size={14} />
                          </button>

                          <button
                            className="btn btn-secondary"
                            onClick={() => handleOpenDeleteModal(user)}
                            title="Delete User"
                            style={{ padding: '0.35rem 0.6rem', color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New System User"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" form="addUserForm" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </>
        }
      >
        <form id="addUserForm" onSubmit={handleAddSubmit}>
          {formError && (
            <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
              {formError}
            </div>
          )}

          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Dr. Rajesh Kumar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Reg No / Staff ID *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 7376242IT163"
                value={formData.regNo}
                onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>System Role *</label>
              <select
                className="form-control"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Email Address * (For Google OAuth & System Login)</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. user@bitschool.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Password * (For Direct Login)</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Set account password..."
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '0.5rem' }}>
            <label>Avatar Color Theme</label>
            <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.2rem' }}>
              {COLOR_OPTIONS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setFormData({ ...formData, avatarColor: color })}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: color,
                    border: formData.avatarColor === color ? '3px solid var(--text-main)' : '1px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {formData.avatarColor === color && <Check size={14} color="#ffffff" />}
                </button>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit User (${selectedUser?.name})`}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" form="editUserForm" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <form id="editUserForm" onSubmit={handleEditSubmit}>
          {formError && (
            <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
              {formError}
            </div>
          )}

          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Reg No / Staff ID *</label>
              <input
                type="text"
                className="form-control"
                value={formData.regNo}
                onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>System Role *</label>
              <select
                className="form-control"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Reset Password (Optional — leave blank to keep existing password)</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter new password if changing..."
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete User Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete User Account"
        message={`Are you sure you want to delete the account for "${selectedUser?.name}" (${selectedUser?.regNo})? They will no longer be able to log in.`}
        confirmText="Delete User"
        onConfirm={handleConfirmDelete}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
