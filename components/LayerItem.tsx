
import React, { useState, useRef, useEffect } from 'react';
import type { Layer } from '../types';
import { EyeOpenIcon, EyeClosedIcon, SparklesIcon } from './icons';
import { generateLayerNameFromImage } from '../services/geminiService';

interface LayerItemProps {
    layer: Layer;
    isActive: boolean;
    onSelect: (id: string) => void;
    onToggleVisibility: (id: string) => void;
    onUpdateName: (id: string, newName: string) => void;
}

export const LayerItem: React.FC<LayerItemProps> = ({ layer, isActive, onSelect, onToggleVisibility, onUpdateName }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingName, setEditingName] = useState(layer.name);
    const [isNamingAi, setIsNamingAi] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleNameChange = () => {
        if (editingName.trim()) {
            onUpdateName(layer.id, editingName.trim());
        }
        setIsEditing(false);
    };
    
    const handleAiName = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!layer.canvas) return;
        setIsNamingAi(true);
        try {
            const dataUrl = layer.canvas.toDataURL('image/png');
            const base64Data = dataUrl.split(',')[1];
            if (!base64Data) {
                onUpdateName(layer.id, "Empty Layer");
                return;
            }
            const newName = await generateLayerNameFromImage(base64Data);
            onUpdateName(layer.id, newName);
        } catch (error) {
            console.error("AI Naming Error:", error);
            onUpdateName(layer.id, "AI Name Failed");
        } finally {
            setIsNamingAi(false);
        }
    };
    
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData("layerId", layer.id);
    };

    return (
        <div
            data-layer-id={layer.id}
            draggable
            onDragStart={handleDragStart}
            onClick={() => onSelect(layer.id)}
            onDoubleClick={() => setIsEditing(true)}
            className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                isActive ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-gray-700 hover:bg-gray-600'
            }`}
        >
            <button onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }} className="mr-2">
                {layer.isVisible ? <EyeOpenIcon /> : <EyeClosedIcon />}
            </button>
            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={handleNameChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleNameChange()}
                    className="flex-grow bg-gray-900 text-white p-0 m-0 border-none outline-none"
                    onClick={(e) => e.stopPropagation()}
                />
            ) : (
                <span className="flex-grow truncate" title={layer.name}>{layer.name}</span>
            )}
            <button
                onClick={handleAiName}
                disabled={isNamingAi}
                className="ml-2 p-1 text-yellow-400 hover:text-yellow-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                title="Suggest name with AI"
            >
                {isNamingAi ? <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon />}
            </button>
        </div>
    );
};
