import React from 'react';
import { Eye, LayoutGrid, List, Columns } from 'lucide-react';

export type ViewMode = 'grid' | 'list' | 'kanban';

interface ViewModeSelectorProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
  currentMode,
  onModeChange,
}) => {
  const modes: Array<{ id: ViewMode; icon: React.ReactNode; label: string }> = [
    { id: 'grid', icon: <LayoutGrid className="h-4 w-4" />, label: 'Grade' },
    { id: 'list', icon: <List className="h-4 w-4" />, label: 'Lista' },
    { id: 'kanban', icon: <Columns className="h-4 w-4" />, label: 'Kanban' },
  ];

  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`
            inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
            ${
              currentMode === mode.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }
          `}
          title={mode.label}
        >
          {mode.icon}
          <span className="hidden sm:inline">{mode.label}</span>
        </button>
      ))}
    </div>
  );
};
