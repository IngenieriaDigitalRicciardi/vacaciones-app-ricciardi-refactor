import React from 'react';

const TABS = [
  { id: 'solicitudes', label: '📋 Cargar Solicitud' },
  { id: 'licencias', label: '📅 Vacaciones Activas' },
  { id: 'empleados', label: '👥 Administrar Personal' },
];

export default function TabNav({ pestana, onCambiarPestana }) {
  return (
    <div className="flex border-b border-slate-800 mb-8 gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onCambiarPestana(tab.id)}
          className={`pb-3 px-4 font-medium text-sm transition-all border-b-2 ${
            pestana === tab.id
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
