import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TopBar } from './components/TopBar';
import { RightPanel } from './components/RightPanel';
import { CanvasArea } from './components/CanvasArea';
import { useLayers } from './hooks/useLayers';
import type { AIFeature } from './types';
import { Modal } from './components/Modal';
import { PromptBuilder } from './components/PromptBuilder';
import { generateImageFromPrompt, generateStoryFromImage, generateFeedbackForImage, generateMusicFromImage, translateText } from './services/geminiService';

const CopyrightInfo: React.FC = () => (
    <div className="text-sm text-gray-300 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <p>This application is built using the Google Gemini API, the rules and regulations are governed by Google's official terms of service and policies.</p>
        <p>Here is a breakdown of the key points regarding the images you generate, along with the official URLs for more detailed information.</p>
        
        <h3 className="text-lg font-bold text-white pt-2">Summary of Rules and Privacy</h3>
        
        <div className="space-y-3">
            <div>
                <h4 className="font-semibold text-white">Content Ownership</h4>
                <p>According to Google's terms, you own the content you create. Google does not claim ownership rights over the images generated from your prompts. However, the legal landscape for AI-generated copyright is still evolving globally, so the extent to which you can copyright the output may vary by jurisdiction.</p>
            </div>
            <div>
                <h4 className="font-semibold text-white">How Your Data is Used (Privacy)</h4>
                <p>When you use the service, your prompts and the generated images may be used by Google to improve their products, including their machine-learning models. The data is typically anonymized before being used by researchers. You should not include sensitive or personal information in your prompts.</p>
            </div>
            <div>
                <h4 className="font-semibold text-white">Prohibited Use</h4>
                <p>You cannot use the service to create content that violates Google's "Prohibited Use Policy." This is a critical document to understand. Prohibited content includes, but is not limited to:</p>
                <ul className="list-disc list-inside pl-4 pt-2 space-y-1">
                    <li>Child Sexual Abuse Material (CSAM).</li>
                    <li>The generation of sexually explicit material.</li>
                    <li>Hate speech or content that promotes violence against individuals or groups.</li>
                    <li>Harassment and bullying.</li>
                    <li>Misinformation and content that promotes dangerous acts.</li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-white">Commercial Use</h4>
                <p>Generally, you are permitted to use the images you generate for commercial purposes, as long as your use complies with all the terms, especially the Prohibited Use Policy.</p>
            </div>
        </div>
    </div>
);


const App: React.FC = () => {
    const {
        layers,
        activeLayerId,
        addLayer,
        removeLayer,
        setActiveLayerId,
        toggleLayerVisibility,
        reorderLayers,
        updateLayerName,
        updateLayerCanvas,
    } = useLayers();

    const [activeModal, setActiveModal] = useState<AIFeature | null>(null);
    const [isCopyrightModalOpen, setIsCopyrightModalOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [aiContent, setAiContent] = useState('');
    const [originalAiContent, setOriginalAiContent] = useState('');
    const [translatedAiContent, setTranslatedAiContent] = useState('');
    const [isShowingTranslation, setIsShowingTranslation] = useState(false);
    const [translationTargetLanguage, setTranslationTargetLanguage] = useState('Spanish');
    const [isTranslating, setIsTranslating] = useState(false);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const calculateCanvasSize = () => {
            if (canvasContainerRef.current) {
                const container = canvasContainerRef.current;
                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;

                // 1:1 aspect ratio
                const SQUARE_RATIO = 1;
                const PADDING = 40; // Total padding (e.g., 20px on each side for rulers)

                let canvasWidth, canvasHeight;

                if (containerWidth <= PADDING || containerHeight <= PADDING) {
                    setCanvasSize({ width: 0, height: 0 });
                    return;
                }

                if ((containerWidth - PADDING) / (containerHeight - PADDING) > SQUARE_RATIO) {
                    canvasHeight = containerHeight - PADDING;
                    canvasWidth = canvasHeight * SQUARE_RATIO;
                } else {
                    canvasWidth = containerWidth - PADDING;
                    canvasHeight = canvasWidth / SQUARE_RATIO;
                }

                setCanvasSize({ width: Math.round(canvasWidth), height: Math.round(canvasHeight) });
            }
        };

        calculateCanvasSize();
        const resizeObserver = new ResizeObserver(calculateCanvasSize);
        if (canvasContainerRef.current) {
            resizeObserver.observe(canvasContainerRef.current);
        }
        return () => resizeObserver.disconnect();
    }, []);


    const getFlattenedCanvas = useCallback(() => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvasSize.width;
        tempCanvas.height = canvasSize.height;

        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return null;

        // Draw layers from bottom to top
        [...layers].reverse().forEach(layer => {
            if (layer.isVisible && layer.canvas) {
                tempCtx.drawImage(layer.canvas, 0, 0, tempCanvas.width, tempCanvas.height);
            }
        });
        return tempCanvas;
    }, [layers, canvasSize]);

    const handleAiFeature = useCallback(async () => {
        if (!activeModal) return;
        setIsLoading(true);
        setAiContent('');

        try {
            if (activeModal === 'textToImage') {
                if (!prompt) throw new Error("Prompt cannot be empty.");
                const base64Image = await generateImageFromPrompt(prompt);
                const newLayer = addLayer();
                const image = new Image();
                image.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = canvasSize.width;
                    canvas.height = canvasSize.height;

                    const ctx = canvas.getContext('2d');
                    if(ctx) {
                        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                        updateLayerCanvas(newLayer.id, canvas);
                    }
                };
                image.src = `data:image/png;base64,${base64Image}`;
                setActiveModal(null);
            } else {
                const flattenedCanvas = getFlattenedCanvas();
                if (!flattenedCanvas) throw new Error("Could not create flattened canvas.");
                const imageData = flattenedCanvas.toDataURL('image/jpeg').split(',')[1];

                let result = '';
                if (activeModal === 'story') {
                    result = await generateStoryFromImage(imageData);
                } else if (activeModal === 'feedback') {
                    result = await generateFeedbackForImage(imageData);
                } else if (activeModal === 'music') {
                    result = await generateMusicFromImage(imageData);
                }
                setAiContent(result);
                setOriginalAiContent(result);
                setTranslatedAiContent('');
                setIsShowingTranslation(false);
            }
        } catch (error) {
            console.error('AI Feature Error:', error);
            setAiContent(error instanceof Error ? error.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
            if(activeModal !== 'textToImage') {
                // don't clear prompt for text to image on error
            } else {
                 setPrompt('');
            }
        }
    }, [activeModal, prompt, addLayer, getFlattenedCanvas, updateLayerCanvas, canvasSize]);
    
    const closeModal = () => {
        setActiveModal(null);
        setAiContent('');
        setOriginalAiContent('');
        setTranslatedAiContent('');
        setIsShowingTranslation(false);
        setIsLoading(false);
        setPrompt('');
    };
    
    const handleTranslate = async () => {
        if (!originalAiContent) return;
        setIsTranslating(true);
        try {
            const translation = await translateText(originalAiContent, translationTargetLanguage);
            setTranslatedAiContent(translation);
            setAiContent(translation);
            setIsShowingTranslation(true);
        } catch (error) {
            console.error('Translation Error:', error);
            setAiContent(error instanceof Error ? error.message : 'Translation failed.');
        } finally {
            setIsTranslating(false);
        }
    };

    const handleSave = useCallback(() => {
        const canvas = getFlattenedCanvas();
        if (!canvas) {
            console.error("Could not get canvas for saving.");
            return;
        }

        const link = document.createElement('a');
        link.download = 'ai-origami-art.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [getFlattenedCanvas]);


    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.ctrlKey && e.key.toLowerCase() === 's') {
            e.preventDefault();
            handleSave();
            return;
        }

        if (e.altKey) {
            e.preventDefault();
            switch(e.key.toLowerCase()) {
                case 'i': setActiveModal('textToImage'); break;
                case 'm': setActiveModal('music'); break;
                case 'o': setActiveModal('story'); break;
                case 'f': setActiveModal('feedback'); break;
            }
        }
    }, [handleSave]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        if (activeModal && ['music', 'story', 'feedback'].includes(activeModal)) {
            handleAiFeature();
        }
    }, [activeModal, handleAiFeature]);

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white font-sans overflow-hidden">
            <TopBar onFeatureClick={setActiveModal} onSave={handleSave} />
            <div className="flex flex-grow h-full overflow-hidden">
                <div ref={canvasContainerRef} className="flex-grow bg-gray-800 relative">
                     <CanvasArea
                        layers={layers}
                        activeLayerId={activeLayerId}
                        canvasSize={canvasSize}
                     />
                </div>

                <RightPanel
                    layers={layers}
                    activeLayerId={activeLayerId}
                    onAddLayer={addLayer}
                    onRemoveLayer={() => removeLayer(activeLayerId)}
                    onSelectLayer={setActiveLayerId}
                    onToggleVisibility={toggleLayerVisibility}
                    onReorderLayers={reorderLayers}
                    onUpdateLayerName={updateLayerName}
                />
            </div>

            <footer className="p-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
                <button 
                    onClick={() => setIsCopyrightModalOpen(true)}
                    className="hover:text-blue-400 transition-colors bg-transparent border-none p-0 cursor-pointer"
                    title="Learn about the rules and regulations for AI-generated images"
                >
                    Copyright of AI Images
                </button>
            </footer>

            {activeModal && (
                <Modal title={activeModal.replace(/([A-Z])/g, ' $1').toUpperCase()} onClose={closeModal}>
                    {isLoading ? (
                         <div className="flex justify-center items-center h-48">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : aiContent ? (
                        <>
                            <div className="p-4 bg-gray-800 rounded-md max-h-96 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap">{aiContent}</pre>
                            </div>
                             {['story', 'music', 'feedback'].includes(activeModal) && originalAiContent && (
                                <div className="mt-4 flex items-center gap-2">
                                    {translatedAiContent && (
                                        <button
                                            onClick={() => {
                                                setIsShowingTranslation(!isShowingTranslation);
                                                setAiContent(isShowingTranslation ? originalAiContent : translatedAiContent);
                                            }}
                                            className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded-md text-xs"
                                        >
                                            {isShowingTranslation ? 'Show Original' : 'Show Translation'}
                                        </button>
                                    )}
                                    <div className="flex-grow" />
                                    <select
                                        value={translationTargetLanguage}
                                        onChange={(e) => setTranslationTargetLanguage(e.target.value)}
                                        className="bg-gray-700 border border-gray-600 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        aria-label="Select language for translation"
                                    >
                                        <option>Spanish</option>
                                        <option>French</option>
                                        <option>German</option>
                                        <option>Japanese</option>
                                        <option>Chinese</option>
                                    </select>
                                    <button
                                        onClick={handleTranslate}
                                        disabled={isTranslating}
                                        className="px-4 py-1 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm font-semibold disabled:bg-gray-500 disabled:cursor-wait"
                                    >
                                        {isTranslating ? 'Translating...' : 'Translate'}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-4">
                            {activeModal === 'textToImage' && (
                                <>
                                <PromptBuilder prompt={prompt} setPrompt={setPrompt} />
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Add more details or refine the prompt here..."
                                    className="w-full h-24 p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                 <button
                                    onClick={handleAiFeature}
                                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-bold transition-colors"
                                >
                                    Generate
                                </button>
                                </>
                            )}
                        </div>
                    )}
                </Modal>
            )}

            {isCopyrightModalOpen && (
                <Modal title="AI Image Usage Policy" onClose={() => setIsCopyrightModalOpen(false)}>
                    <CopyrightInfo />
                </Modal>
            )}
        </div>
    );
};

export default App;