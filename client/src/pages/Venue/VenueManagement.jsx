import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import VenueModal from '../../components/VenueModal';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import { Plus, Search, Tv, BookOpen, Monitor, FlaskConical, Edit, Trash2, Users, Building2 } from 'lucide-react';

export default function VenueManagement() {
  const { venues, venueTypes, deleteVenue } = useSchool();

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
      ven.roomNo.toLowerCase().includes(search.toLowerCase()) ||
      ven.name.toLowerCase().includes(search.toLowerCase()) ||
      ven.building.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === 'ALL' || ven.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getVenueTypeBadge = (type) => {
    switch (type) {
      case 'projector':
        return <span className="badge badge-projector"><Tv size={12} /> Normal Class + Projector</span>;
      case 'normal':
        return <span className="badge badge-normal"><BookOpen size={12} /> Normal Class</span>;
      case 'computer_lab':
        return <span className="badge badge-lab"><Monitor size={12} /> Computer Lab</span>;
      case 'science_lab':
        return <span className="badge badge-science"><FlaskConical size={12} /> Science Lab</span>;
      default:
        return <span className="badge badge-normal">{type}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Filter & Action Header */}
      <div className="section-header">
        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by room no, title, building..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              className={`btn ${typeFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
              onClick={() => setTypeFilter('ALL')}
            >
              All Types
            </button>
            <button
              className={`btn ${typeFilter === 'normal' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
              onClick={() => setTypeFilter('normal')}
            >
              Normal Class
            </button>
            <button
              className={`btn ${typeFilter === 'projector' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
              onClick={() => setTypeFilter('projector')}
            >
              Normal Class + Projector
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
          description="There are currently no classrooms or specialized venues configured. Click below to add a new venue to your institutional database."
          actionText="Add New Venue"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="cards-grid">
          {filteredVenues.map((ven) => (
            <div key={ven.id} className="glass-card venue-card">
              <div>
                <div className="card-top">
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{ven.roomNo}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: 500, marginTop: '2px' }}>
                      {ven.name}
                    </div>
                  </div>
                  {getVenueTypeBadge(ven.type)}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem',
                    marginTop: '1rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#f8fafc',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.82rem'
                  }}
                >
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Capacity</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                      <Users size={14} color="var(--primary)" /> {ven.capacity} Seats
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Building Block</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-sub)', marginTop: '2px' }}>
                      {ven.building} ({ven.floor})
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '1.25rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-color)'
                }}
              >
                <span className="badge badge-normal" style={{ fontSize: '0.72rem' }}>
                  {ven.status}
                </span>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-secondary btn-icon-only"
                    onClick={() => handleOpenEdit(ven)}
                    title="Edit Venue Configuration"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn btn-danger btn-icon-only"
                    onClick={() => setDeleteTarget(ven)}
                    title="Remove Venue"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
