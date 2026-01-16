interface AIPromptInputProps {
    isVisible: boolean;
    onClose: () => void;
    onGenerate: (prompt: string) => Promise<void>;
    isGenerating: boolean;
    selectedChannels: string[];
}
export declare function AIPromptInput({ isVisible, onClose, onGenerate, isGenerating, selectedChannels, }: AIPromptInputProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AIPromptInput.d.ts.map