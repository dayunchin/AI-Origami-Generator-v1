
export interface Layer {
    id: string;
    name: string;
    isVisible: boolean;
    canvas: HTMLCanvasElement | null;
}

export type AIFeature = 'textToImage' | 'music' | 'story' | 'feedback';
