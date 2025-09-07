
import React from 'react';
import type { Layer } from '../types';
import { LayerItem } from './LayerItem';

interface RightPanelProps {
    layers: Layer[];
    activeLayerId: string | null;
    onAddLayer: () => void;
    onRemoveLayer: () => void;
    onSelectLayer: (id: string) => void;
    onToggleVisibility: (id: string) => void;
    onReorderLayers: (draggedId: string, targetId: string) => void;
    onUpdateLayerName: (id: string, newName: string) => void;
}

export const RightPanel: React.FC<RightPanelProps> = (props) => {
    const {
        layers,
        activeLayerId,
        onAddLayer,
        onRemoveLayer,
        onSelectLayer,
        onToggleVisibility,
        onReorderLayers,
        onUpdateLayerName
    } = props;
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData("layerId");
        const targetId = (e.target as HTMLElement).closest('[data-layer-id]')?.getAttribute('data-layer-id');
        if (draggedId && targetId && draggedId !== targetId) {
            onReorderLayers(draggedId, targetId);
        }
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    return (
        <div className="w-64 bg-gray-800 border-l border-gray-700 flex flex-col p-2">
            <h2 className="text-lg font-bold mb-2 text-center">Layers</h2>
            <div 
                className="flex-grow space-y-1 overflow-y-auto"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                {layers.map(layer => (
                    <LayerItem
                        key={layer.id}
                        layer={layer}
                        isActive={layer.id === activeLayerId}
                        onSelect={onSelectLayer}
                        onToggleVisibility={onToggleVisibility}
                        onUpdateName={onUpdateLayerName}
                    />
                ))}
            </div>
            <div className="flex mt-2 space-x-2">
                <button onClick={onAddLayer} className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-bold transition-colors">Add</button>
                <button onClick={onRemoveLayer} className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 rounded-md text-white font-bold transition-colors disabled:bg-gray-600" disabled={layers.length <= 1}>Remove</button>
            </div>
        </div>
    );
};
