import React, { useState, useEffect } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';

export default function DiseaseModal({ isOpen, onClose, onSave, editingDisease, availableMedicines = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    symptoms: '',
    medicines: []
  });
  const [newMedInput, setNewMedInput] = useState('');
  const [error, setError] = useState('');

  const defaultMedicinesList = [
    'Paracetamol', 'Cetirizine', 'Cough Syrup', 'Ibuprofen', 
    'Omeprazole', 'Antacid', 'Domperidone', 'Metformin', 
    'Glimepiride', 'Insulin', 'Amlodipine', 'Losartan', 
    'Atenolol', 'Amoxicillin', 'Azithromycin', 'Ciprofloxacin', 
    'Salbutamol', 'Montelukast', 'Pantoprazole'
  ];

  const allMeds = Array.from(new Set([...defaultMedicinesList, ...availableMedicines]));

  useEffect(() => {
    if (editingDisease) {
      setFormData({
        name: editingDisease.name || '',
        description: editingDisease.description || '',
        symptoms: Array.isArray(editingDisease.symptoms) 
          ? editingDisease.symptoms.join(', ') 
          : (editingDisease.symptoms || ''),
        medicines: Array.isArray(editingDisease.medicines) 
          ? editingDisease.medicines 
          : (editingDisease.medicines ? editingDisease.medicines.split(',').map(s => s.trim()) : [])
      });
    } else {
      setFormData({
        name: '',
        description: '',
        symptoms: '',
        medicines: []
      });
    }
    setError('');
  }, [editingDisease, isOpen]);

  if (!isOpen) return null;

  const toggleMedicine = (med) => {
    if (formData.medicines.includes(med)) {
      setFormData({
        ...formData,
        medicines: formData.medicines.filter(m => m !== med)
      });
    } else {
      setFormData({
        ...formData,
        medicines: [...formData.medicines, med]
      });
    }
  };

  const handleAddCustomMedicine = (e) => {
    e.preventDefault();
    if (newMedInput.trim() && !formData.medicines.includes(newMedInput.trim())) {
      setFormData({
        ...formData,
        medicines: [...formData.medicines, newMedInput.trim()]
      });
      setNewMedInput('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Disease name is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.symptoms.trim()) {
      setError('Common symptoms are required');
      return;
    }

    onSave({
      name: formData.name.trim(),
      description: formData.description.trim(),
      symptoms: formData.symptoms.trim(),
      medicines: formData.medicines
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-slate-900 mb-1">
          {editingDisease ? 'Edit Disease' : 'Add New Disease'}
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          {editingDisease ? 'Update disease details and recommended medicines.' : 'Enter disease specifications and assign recommended medicines.'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Disease Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Common Cold"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Viral infection of upper respiratory tract"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Common Symptoms (comma separated) *
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Cough, Sore throat, Runny nose, Sneezing"
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Recommended Medicines (Click to toggle)
            </label>

            {/* Selected Pills */}
            <div className="flex flex-wrap gap-1.5 mb-2.5 min-h-[32px] p-2 bg-slate-50 border border-slate-200/80 rounded-xl">
              {formData.medicines.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No medicines selected yet</span>
              ) : (
                formData.medicines.map((med, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200"
                  >
                    {med}
                    <button
                      type="button"
                      onClick={() => toggleMedicine(med)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Quick Selectable Medicines List */}
            <div className="max-h-28 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-white space-y-1">
              <div className="flex flex-wrap gap-1.5">
                {allMeds.map((med) => {
                  const isSelected = formData.medicines.includes(med);
                  return (
                    <button
                      key={med}
                      type="button"
                      onClick={() => toggleMedicine(med)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {med} {isSelected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Custom Medicine */}
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Add custom medicine..."
                value={newMedInput}
                onChange={(e) => setNewMedInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddCustomMedicine}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#1e5adb] hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
            >
              {editingDisease ? 'Update Disease' : 'Save Disease'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
