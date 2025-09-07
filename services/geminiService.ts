import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateImageFromPrompt(prompt: string): Promise<string> {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    }
    throw new Error("Image generation failed or returned no images.");
}


export async function generateStoryFromImage(base64ImageData: string): Promise<string> {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: base64ImageData,
                    },
                },
                {
                    text: 'Write a short, imaginative story inspired by this image.'
                }
            ]
        },
        config: {
            systemInstruction: "You are a creative storyteller."
        }
    });
    return response.text;
}


export async function generateFeedbackForImage(base64ImageData: string): Promise<string> {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: base64ImageData,
                    },
                },
                {
                    text: 'Provide constructive feedback on this artwork. Comment on composition, color, mood, and potential areas for improvement.'
                }
            ]
        },
        config: {
            systemInstruction: "You are a helpful and encouraging art critic."
        }
    });
    return response.text;
}

export async function generateMusicFromImage(base64ImageData: string): Promise<string> {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: base64ImageData,
                    },
                },
                {
                    text: 'Describe a simple melody or musical mood that would fit this image. What instruments would you use? What tempo and key?'
                }
            ]
        },
        config: {
            systemInstruction: "You are a musician who translates visual art into musical ideas."
        }
    });
    return response.text;
}

export async function generateLayerNameFromImage(base64ImageData: string): Promise<string> {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                 {
                    inlineData: {
                        mimeType: 'image/png',
                        data: base64ImageData,
                    },
                },
                {
                    text: `Suggest a very short, descriptive name for this image layer (2-3 words max, e.g., 'Blue sky', 'Character sketch', 'Foreground tree').`
                }
            ]
        },
    });
    return response.text.replace(/["']/g, "").trim();
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Translate the following text to ${targetLanguage}: "${text}"`,
        config: {
            systemInstruction: "You are a helpful and accurate translator."
        }
    });
    return response.text;
}