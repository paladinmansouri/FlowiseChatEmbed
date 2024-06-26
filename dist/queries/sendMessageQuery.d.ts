import { MessageType } from '@/components/Bot';
export type IncomingInput = {
    question: string;
    history: MessageType[];
    overrideConfig?: Record<string, unknown>;
    socketIOClientId?: string;
    chatId?: string;
    fileName?: string;
};
export type MessageRequest = {
    chatflowid?: string;
    apiHost?: string;
    body?: IncomingInput;
};
export declare const sendMessageQuery: ({ chatflowid, apiHost, body }: MessageRequest) => Promise<{
    data?: any;
    error?: Error | undefined;
}>;
export declare const getChatbotConfig: ({ chatflowid, apiHost }: MessageRequest) => Promise<{
    data?: any;
    error?: Error | undefined;
}>;
export declare const isStreamAvailableQuery: ({ chatflowid, apiHost }: MessageRequest) => Promise<{
    data?: any;
    error?: Error | undefined;
}>;
export declare const sendFileDownloadQuery: ({ apiHost, body }: MessageRequest) => Promise<{
    data?: any;
    error?: Error | undefined;
}>;
export declare const sendSpeechToTextQuery: ({ speech }: {
    speech: Blob;
}) => Promise<string>;
export declare const sendTextToSpeechQuery: ({ text }: {
    text: string;
}) => Promise<Response>;
//# sourceMappingURL=sendMessageQuery.d.ts.map