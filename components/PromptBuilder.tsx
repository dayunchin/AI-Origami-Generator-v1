import React from 'react';

const PROMPT_CATEGORIES = [
    { name: 'Origami Type', limit: 2, options: ['Origami', 'Modular origami', 'Tessellation', 'Kirigami', 'Golden venture folding', 'Strip folding'] },
    { name: 'Shape', limit: 2, options: ['Star', 'Flower', 'Spiral', 'Wheel', 'Crane', 'Dragon', 'Butterfly', 'Box', 'Polyhedron', 'Icosahedron'] },
    { name: 'Color', limit: 3, options: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Black', 'White', 'Gold', 'Silver', 'Rainbow', 'Pastel colors', 'Vibrant colors', 'Monochromatic'] },
    { name: 'Material', limit: 2, options: ['Paper', 'Plastic', 'Aluminium foil', 'Cardboard', 'Newspaper', 'Metal', 'Fabric', 'Glass'] },
    { name: 'Art Style', limit: 2, options: ['Photorealistic', 'Minimalist', 'Abstract', 'Surreal', 'Impressionistic', 'Art Deco', 'Steampunk', 'Concept art'] },
    { name: 'Details', limit: 3, options: ['Intricate folds', 'Wet-folding technique', 'Geometric', 'Symmetric', 'Fractal', 'Back-lit', 'On a dark background', 'Close-up shot', 'Detailed patterns'] },
];

interface PromptBuilderProps {
    prompt: string;
    setPrompt: (newPrompt: string) => void;
}

export const PromptBuilder: React.FC<PromptBuilderProps> = ({ prompt, setPrompt }) => {
    const selectedKeywords = new Set(prompt.split(',').map(k => k.trim()).filter(Boolean));

    const handleKeywordClick = (keyword: string, categoryName: string) => {
        const category = PROMPT_CATEGORIES.find(c => c.name === categoryName);
        if (!category) return;

        const newKeywords = new Set(selectedKeywords);
        
        if (newKeywords.has(keyword)) {
            newKeywords.delete(keyword);
        } else {
            const currentCategoryKeywords = category.options.filter(opt => newKeywords.has(opt));
            if (currentCategoryKeywords.length < category.limit) {
                newKeywords.add(keyword);
            } else {
                console.warn(`Limit of ${category.limit} reached for category "${category.name}"`);
                return;
            }
        }
        
        const orderedKeywords: string[] = [];
        PROMPT_CATEGORIES.forEach(cat => {
            cat.options.forEach(opt => {
                if (newKeywords.has(opt)) {
                    orderedKeywords.push(opt);
                }
            });
        });

        setPrompt(orderedKeywords.join(', '));
    };

    return (
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto p-1">
            {PROMPT_CATEGORIES.map(category => (
                <div key={category.name}>
                    <h4 className="text-sm font-semibold text-gray-300 mb-1.5">{category.name} <span className="text-xs text-gray-500">(select up to {category.limit})</span></h4>
                    <div className="flex flex-wrap gap-2">
                        {category.options.map(option => {
                            const isSelected = selectedKeywords.has(option);
                            return (
                                <button
                                    key={option}
                                    onClick={() => handleKeywordClick(option, category.name)}
                                    className={`px-2.5 py-1 text-xs rounded-full transition-colors border ${
                                        isSelected
                                            ? 'bg-blue-500 border-blue-400 text-white font-medium'
                                            : 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500 text-gray-200'
                                    }`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};