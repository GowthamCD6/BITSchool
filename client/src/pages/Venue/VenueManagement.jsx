import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import VenueModal from '../../components/VenueModal';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import {
  Plus,
  Search,
  Tv,
  BookOpen,
  Monitor,
  FlaskConical,
  Edit,
  Trash2,
  Users,
  Building2,
  Sparkles
} from 'lucide-react';

export default function VenueManagement() {
  const { venues, deleteVenue } = useSchool();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [venueToEdit, setVenueToEdit] = useState(null);

  // Deletion Confirmation State
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleOpenAdd = () => {
    setVenueToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ven) => {
    setVenueToEdit(ven);
    setIsModalOpen(true);
  };

  const filteredVenues = venues.filter((ven) => {
    const matchesSearch =
      (ven.roomNo || '').toLowerCase().includes(search.toLowerCase()) ||
      (ven.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (ven.building || '').toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === 'ALL' || ven.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getVenueConfig = (type) => {
    switch (type) {
      case 'projector':
        return {
          label: 'Normal Class + Projector',
          icon: <Tv size={14} />,
          bg: '#f3e8ff',
          color: '#7e22ce',
          borderColor: '#d8b4fe',
          avatarBg: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)'
        };
      case 'computer_lab':
      case 'lab_computers':
        return {
          label: 'Computer Lab',
          icon: <Monitor size={14} />,
          bg: '#e0f2fe',
          color: '#0369a1',
          borderColor: '#7dd3fc',
          avatarBg: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)'
        };
      case 'science_lab':
      case 'lab_science':
        return {
          label: 'Science Lab',
          icon: <FlaskConical size={14} />,
          bg: '#fce7f3',
          color: '#be185d',
          borderColor: '#f9a8d4',
          avatarBg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'
        };
      case 'auditorium':
        return {
          label: 'Auditorium',
          icon: <Sparkles size={14} />,
          bg: '#fef3c7',
          color: '#b45309',
          borderColor: '#fde68a',
          avatarBg: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)'
        };
      case 'normal':
      default:
        return {
          label: 'Normal Class',
          icon: <BookOpen size={14} />,
          bg: '#eff6ff',
          color: '#1d4ed8',
          borderColor: '#93c5fd',
          avatarBg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Filter & Action Header */}
      <div className="section-header">
        <div className="filter-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="search-input-wrap">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by room no, title, building..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <button
              className={`btn ${typeFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', borderRadius: '8px' }}
              onClick={() => setTypeFilter('ALL')}
            >
              All Types ({venues.length})
            </button>
            <button
              className={`btn ${typeFilter === 'normal' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', borderRadius: '8px' }}
              onClick={() => setTypeFilter('normal')}
            >
              <BookOpen size={14} /> Normal Class
            </button>
            <button
              className={`btn ${typeFilter === 'projector' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', borderRadius: '8px' }}
              onClick={() => setTypeFilter('projector')}
            >
              <Tv size={14} /> Normal Class + Projector
            </button>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> Add New Venue
        </button>
      </div>

      {/* Venues Grid / Empty State */}
      {filteredVenues.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Venue Data Available"
          description="There are currently no classrooms or specialized venues configured matching your filters. Click below to add a new venue."
          actionText="Add New Venue"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredVenues.map((ven) => {
            const config = getVenueConfig(ven.type);
            const isAvailable = (ven.status || 'Available').toLowerCase() === 'available';

            return (
              <div
                key={ven.id}
                className="glass-card venue-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.35rem',
                  borderRadius: '16px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 15px -2px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.25s ease'
                }}
              >
                <div>
                  {/* Card Top: Room Avatar, Title, and Badge */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1.1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          background: config.avatarBg,
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
                          flexShrink: 0
                        }}
                      >
                        {config.icon}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                          {ven.roomNo}
                        </h3>
                        <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                          {ven.name || 'Academic Venue'}
                        </div>
                      </div>
                    </div>

                    {/* Venue Type Pill */}
                    <div
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        background: config.bg,
                        color: config.color,
                        border: `1px solid ${config.borderColor}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {config.icon}
                      <span>{config.label}</span>
                    </div>
                  </div>

                  {/* Specification Box Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.75rem',
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      marginBottom: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                        Seating Capacity
                      </div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '3px' }}>
                        <Users size={15} color="#2563eb" />
                        <span>{ven.capacity || 50} Seats</span>
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                        Building Block
                      </div>
                      <div style={{ fontWeight: 700, color: '#334155', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '3px' }}>
                        <Building2 size={15} color="#059669" />
                        <span>{ven.building || 'PO'} ({ven.floor || '1st Floor'})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Live Status & Quick Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid #f1f5f9'
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: isAvailable ? '#ecfdf5' : '#fffbe7',
                      color: isAvailable ? '#059669' : '#d97706',
                      border: `1px solid ${isAvailable ? '#a7f3d0' : '#fde68a'}`
                    }}
                  >
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: isAvailable ? '#10b981' : '#f59e0b',
                        boxShadow: `0 0 6px ${isAvailable ? '#10b981' : '#f59e0b'}`
                      }}
                    />
                    <span>{ven.status || 'Available'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <button
                      className="btn btn-secondary btn-icon-only"
                      style={{ padding: '0.4rem', borderRadius: '8px' }}
                      onClick={() => handleOpenEdit(ven)}
                      title="Edit Venue Configuration"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      className="btn btn-danger btn-icon-only"
                      style={{ padding: '0.4rem', borderRadius: '8px' }}
                      onClick={() => setDeleteTarget(ven)}
                      title="Remove Venue"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <VenueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        venueToEdit={venueToEdit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteVenue(deleteTarget.id);
        }}
        title="Delete Venue"
        message={`Are you sure you want to delete venue "${deleteTarget?.roomNo} - ${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete Venue"
      />
    </div>
  );
}
