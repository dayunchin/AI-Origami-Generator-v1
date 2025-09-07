import React from 'react';
import type { AIFeature } from '../types';
import { ImageIcon, MusicIcon, StoryIcon, FeedbackIcon, DownloadIcon } from './icons';

interface TopBarProps {
    onFeatureClick: (feature: AIFeature) => void;
    onSave: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onFeatureClick, onSave }) => {
    return (
        <header className="flex flex-col p-2 bg-gray-800 border-b border-gray-700 shadow-md">
            <h1 className="text-4xl font-bold text-center text-blue-400 mb-2">AI Origami Generator v1</h1>
            <div className="flex items-center w-full">
                 <div className="flex items-center space-x-2">
                    <button onClick={() => onFeatureClick('textToImage')} className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-blue-600 rounded-md transition-colors" title="Text to Image (Alt+I)">
                        <ImageIcon />
                        <span>Text to Image</span>
                    </button>
                    <button onClick={() => onFeatureClick('music')} className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-blue-600 rounded-md transition-colors" title="AI Music (Alt+M)">
                        <MusicIcon />
                        <span>AI Music</span>
                    </button>
                    <button onClick={() => onFeatureClick('story')} className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-blue-600 rounded-md transition-colors" title="AI Story (Alt+O)">
                        <StoryIcon />
                        <span>AI Story</span>
                    </button>
                    <button onClick={() => onFeatureClick('feedback')} className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-blue-600 rounded-md transition-colors" title="AI Feedback (Alt+F)">
                        <FeedbackIcon />
                        <span>AI Feedback</span>
                    </button>
                </div>
                <div className="flex-grow" />
                <button onClick={onSave} className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors" title="Save Image (Ctrl+S)">
                    <DownloadIcon />
                    <span>Save</span>
                </button>
            </div>
        </header>
    );
};