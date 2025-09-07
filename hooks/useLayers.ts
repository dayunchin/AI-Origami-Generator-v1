
import { useState, useCallback } from 'react';
import type { Layer } from '../types';

const createNewLayer = (count: number): Layer => ({
    id: `layer-${Date.now()}-${count}`,
    name: `Layer ${count}`,
    isVisible: true,
    canvas: null,
});

export const useLayers = () => {
    const [layers, setLayers] = useState<Layer[]>([createNewLayer(1)]);
    const [activeLayerId, setActiveLayerId] = useState<string>(layers[0].id);
    const [layerCount, setLayerCount] = useState(1);

    const addLayer = useCallback(() => {
        const newCount = layerCount + 1;
        const newLayer = createNewLayer(newCount);
        setLayers(prev => [newLayer, ...prev]);
        setLayerCount(newCount);
        setActiveLayerId(newLayer.id);
        return newLayer;
    }, [layerCount]);

    const removeLayer = useCallback((id: string) => {
        if (layers.length <= 1) return; // Cannot remove the last layer
        setLayers(prev => {
            const newLayers = prev.filter(layer => layer.id !== id);
            if (activeLayerId === id) {
                setActiveLayerId(newLayers[0]?.id || '');
            }
            return newLayers;
        });
    }, [layers.length, activeLayerId]);

    const toggleLayerVisibility = useCallback((id: string) => {
        setLayers(prev => prev.map(layer =>
            layer.id === id ? { ...layer, isVisible: !layer.isVisible } : layer
        ));
    }, []);
    
    const reorderLayers = useCallback((draggedId: string, targetId: string) => {
        setLayers(currentLayers => {
            const draggedIndex = currentLayers.findIndex(l => l.id === draggedId);
            const targetIndex = currentLayers.findIndex(l => l.id === targetId);

            if (draggedIndex === -1 || targetIndex === -1) return currentLayers;
            
            const newLayers = [...currentLayers];
            const [draggedItem] = newLayers.splice(draggedIndex, 1);
            newLayers.splice(targetIndex, 0, draggedItem);
            
            return newLayers;
        });
    }, []);

    const updateLayerName = useCallback((id: string, newName: string) => {
        setLayers(prev => prev.map(layer =>
            layer.id === id ? { ...layer, name: newName } : layer
        ));
    }, []);

    const updateLayerCanvas = useCallback((id: string, canvas: HTMLCanvasElement) => {
         setLayers(prev => prev.map(layer =>
            layer.id === id ? { ...layer, canvas: canvas } : layer
        ));
    }, []);

    return {
        layers,
        activeLayerId,
        addLayer,
        removeLayer,
        setActiveLayerId,
        toggleLayerVisibility,
        reorderLayers,
        updateLayerName,
        updateLayerCanvas
    };
};
