import { MessageType } from '@/components/Bot';
import { sendRequest } from '@/utils/index';

export type IncomingInput = {
  question: string;
  history: MessageType[];
  overrideConfig?: Record<string, unknown>;
  socketIOClientId?: string;
  chatId?: string;
  fileName?: string; // Only for assistant
};

export type MessageRequest = {
  chatflowid?: string;
  apiHost?: string;
  body?: IncomingInput;
};

export const sendMessageQuery = ({ chatflowid, apiHost = 'http://localhost:3000', body }: MessageRequest) =>
  sendRequest<any>({
    method: 'POST',
    url: `${apiHost}/api/v1/prediction/${chatflowid}`,
    body,
  });

export const getChatbotConfig = ({ chatflowid, apiHost = 'http://localhost:3000' }: MessageRequest) =>
  sendRequest<any>({
    method: 'GET',
    url: `${apiHost}/api/v1/public-chatbotConfig/${chatflowid}`,
  });

export const isStreamAvailableQuery = ({ chatflowid, apiHost = 'http://localhost:3000' }: MessageRequest) =>
  sendRequest<any>({
    method: 'GET',
    url: `${apiHost}/api/v1/chatflows-streaming/${chatflowid}`,
  });

export const sendFileDownloadQuery = ({ apiHost = 'http://localhost:3000', body }: MessageRequest) =>
  sendRequest<any>({
    method: 'POST',
    url: `${apiHost}/api/v1/openai-assistants-file`,
    body,
    type: 'blob',
  });

export const sendSpeechToTextQuery = async ({ speech }: { speech: Blob }) => {
  const apiUrl = (window as unknown as { speechToTextEndpointUrl: string }).speechToTextEndpointUrl;
  if (!apiUrl) {
    throw new Error('api endpoint url for speech to text is not provided');
  }
  const formData = new FormData();
  formData.append('file', speech);
  const response = await fetch(apiUrl, {
    method: 'POST',
    body: formData,
  });
  const responseJson = await response.json();
  return responseJson.transcription as string;
};

export const sendTextToSpeechQuery = async ({ text }: { text: string }) => {
  const apiUrl = (window as unknown as { textToSpeechEndpointUrl: string }).textToSpeechEndpointUrl;
  if (!apiUrl) {
    throw new Error('api endpoint url for text to speech is not provided');
  }
  const response = await sendRequest<any>({
    method: 'POST',
    url: apiUrl,
    body: { text },
    type: 'raw',
  });
  return response.data as Response;
};
