import React, { useRef, useEffect } from 'react';
import type { Layer } from '../types';

interface CanvasAreaProps {
    layers: Layer[];
    activeLayerId: string | null;
    canvasSize: { width: number; height: number };
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({ layers, activeLayerId, canvasSize }) => {
    const layerCanvasRefs = useRef<Record<string, HTMLCanvasElement>>({});

    useEffect(() => {
        if (canvasSize.width === 0 || canvasSize.height === 0) return;

        // Resize all layer canvases
        layers.forEach(layer => {
            const canvas = layerCanvasRefs.current[layer.id];
            if (canvas) {
                canvas.width = canvasSize.width;
                canvas.height = canvasSize.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    if (layer.canvas) { // Redraw existing content from state
                        ctx.drawImage(layer.canvas, 0, 0, canvas.width, canvas.height);
                    }
                }
            }
        });
    }, [canvasSize, layers]);

    return (
        <div className="w-full h-full flex justify-center items-center p-5">
            {canvasSize.width > 0 && canvasSize.height > 0 && (
                 <div className="relative shadow-2xl" style={{ width: canvasSize.width, height: canvasSize.height }}>
                    <div className="relative checkerboard-bg" style={{ width: canvasSize.width, height: canvasSize.height }}>
                        {layers.map(layer => (
                            <canvas
                                key={layer.id}
                                ref={el => { if (el) layerCanvasRefs.current[layer.id] = el; }}
                                style={{ display: layer.id === activeLayerId ? 'block' : 'none', pointerEvents: 'none' }}
                                className="absolute top-0 left-0 bg-transparent"
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};