declare const chatbot: {
    initFull: (props: {
        chatflowid: string;
        speechToTextEndpointUrl?: string | undefined;
        textToSpeechEndpointUrl?: string | undefined;
        apiHost?: string | undefined;
        chatflowConfig?: Record<string, unknown> | undefined;
        observersConfig?: import("./components/Bot").observersConfigType | undefined;
    } & {
        id?: string | undefined;
    }) => void;
    init: (props: {
        chatflowid: string;
        speechToTextEndpointUrl?: string | undefined;
        textToSpeechEndpointUrl?: string | undefined;
        apiHost?: string | undefined;
        chatflowConfig?: Record<string, unknown> | undefined;
        observersConfig?: import("./components/Bot").observersConfigType | undefined;
    }) => void;
};
export default chatbot;
//# sourceMappingURL=web.d.ts.map