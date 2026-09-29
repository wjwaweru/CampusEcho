import React, { useState, useEffect } from 'react';
import { MapPin, Users, PlusCircle, Trash2, Edit2, CheckCircle, AlertTriangle, Building2, Search } from 'lucide-react';
import { db } from '../../services/db';
import { Venue, VenueStatus } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const AdminVenuesManage: React.FC = () => {
  const { showToast } = useNotification();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [building, setBuilding] = useState('');
  const [capacity, setCapacity] = useState(45);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<VenueStatus>('Available');

  useEffect(() => {
    const update = () => setVenues(db.getVenues());
    update();
    const unsub = db.subscribe(update);
    return () => unsub();
  }, []);

  const handleOpenAdd = () => {
    setEditingVenue(null);
    setName('');
    setBuilding('Science Complex');
    setCapacity(50);
    setDescription('');
    setStatus('Available');
    setShowModal(true);
  };

  const handleOpenEdit = (v: Venue) => {
    setEditingVenue(v);
    setName(v.name);
    setBuilding(v.building);
    setCapacity(v.capacity);
    setDescription(v.description);
    setStatus(v.status || 'Available');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingVenue) {
      db.updateVenue(editingVenue.id, {
        name,
        building,
        capacity: Number(capacity),
        description,
        status,
      });
      showToast({
        type: 'success',
        title: 'Venue Updated',
        message: `✓ Venue ${name} updated successfully.`,
      });
    } else {
      db.addVenue({
        name,
        building,
        capacity: Number(capacity),
        description,
        status,
      });
      showToast({
        type: 'success',
        title: 'Venue Created',
        message: `✓ Venue ${name} added to campus registry.`,
      });
    }

    setShowModal(false);
  };

  const handleDelete = (id: string, vName: string) => {
    if (window.confirm(`Delete venue "${vName}"? This will affect classes assigned to it.`)) {
      db.deleteVenue(id);
      showToast({
        type: 'info',
        title: 'Venue Deleted',
        message: `Venue ${vName} was removed.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Venue & Capacity Management
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Manage lecture halls, laboratory occupancy, seating limits, and maintenance availability.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Campus Venue</span>
          </button>
        </div>
      </div>

      {/* Venues Table (Section 8 Format) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[11px]">
              <tr>
                <th className="py-3.5 px-6">Venue Name</th>
                <th className="py-3.5 px-4">Building</th>
                <th className="py-3.5 px-4 text-right">Capacity</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-6">Description</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {venues.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-4 px-6 font-black text-slate-900 text-sm">
                    {v.name}
                  </td>
                  <td className="py-4 px-4 text-slate-600">{v.building}</td>
                  <td className="py-4 px-4 text-right font-bold text-slate-900">
                    {v.capacity} comrades
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        v.status === 'Available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : v.status === 'Occupied'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {v.status || 'Available'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-500 max-w-xs truncate">
                    {v.description}
                  </td>
                  <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenEdit(v)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition"
                      title="Edit Venue"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id, v.name)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Venue"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                {editingVenue ? 'Edit Campus Venue' : 'Register New Campus Venue'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Venue Name / Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab 4, LH 3, Room 102"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Building / Complex</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Complex, Computing Block"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={1000}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as VenueStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 bg-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Equipment & Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Equipped with 45 Linux workstations, overhead projector, whiteboards..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  {editingVenue ? 'Save Changes' : 'Create Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
