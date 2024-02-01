import { ShortTextInput } from './ShortTextInput';
import { isMobile } from '@/utils/isMobileSignal';
import { createSignal, createEffect, onMount } from 'solid-js';
import { SendButton } from '@/components/SendButton';
import { RecordButton } from '../../../RecordButton';
import { RecordRTCPromisesHandler } from 'recordrtc';
import { sendSpeechToTextQuery } from '@/queries/sendMessageQuery';

type Props = {
  placeholder?: string;
  backgroundColor?: string;
  textColor?: string;
  sendButtonColor?: string;
  defaultValue?: string;
  fontSize?: number;
  disabled?: boolean;
  onSubmit: (value: string) => void;
  setDisabled: (vaL: boolean) => void;
};

const defaultBackgroundColor = '#ffffff';
const defaultTextColor = '#303235';

export const TextInput = (props: Props) => {
  const [inputValue, setInputValue] = createSignal(props.defaultValue ?? '');
  let inputRef: HTMLInputElement | HTMLTextAreaElement | undefined;

  const [isRecording, setIsRecording] = createSignal(false);
  const [recorder, setRecorder] = createSignal<RecordRTCPromisesHandler>();

  const handleInput = (inputValue: string) => setInputValue(inputValue);

  const checkIfInputIsValid = () => inputValue() !== '' && inputRef?.reportValidity();

  const submit = () => {
    if (checkIfInputIsValid()) props.onSubmit(inputValue());
    setInputValue('');
  };

  const submitWhenEnter = (e: KeyboardEvent) => {
    // Check if IME composition is in progress
    const isIMEComposition = e.isComposing || e.keyCode === 229;
    if (e.key === 'Enter' && !isIMEComposition) submit();
  };

  createEffect(() => {
    if (!props.disabled && !isMobile() && inputRef) inputRef.focus();
  });

  onMount(() => {
    if (!isMobile() && inputRef) inputRef.focus();
  });

  async function submitBySpeech(speech: Blob) {
    props.setDisabled(true);
    const text = await sendSpeechToTextQuery({ speech });
    props.onSubmit(text);
    props.setDisabled(false);
  }

  async function stopRecording() {
    const rec = recorder();
    if (!rec) {
      return;
    }
    await rec.stopRecording();
    const blob = await rec.getBlob();
    setIsRecording(false);
    return submitBySpeech(blob);
  }

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });

    setRecorder(
      new RecordRTCPromisesHandler(stream, {
        type: 'audio',
      }),
    );
    await recorder()?.startRecording();
    setIsRecording(true);
    props.setDisabled(true);
  }

  function handleRecordToggle() {
    if (isRecording()) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  return (
    <div
      class={'flex items-end justify-between chatbot-input'}
      data-testid="input"
      style={{
        'border-top': '1px solid #eeeeee',
        position: 'absolute',
        left: '20px',
        right: '20px',
        bottom: '40px',
        margin: 'auto',
        'z-index': 1000,
        'background-color': props.backgroundColor ?? defaultBackgroundColor,
        color: props.textColor ?? defaultTextColor,
      }}
      onKeyDown={submitWhenEnter}
    >
      <ShortTextInput
        ref={inputRef as HTMLInputElement}
        onInput={handleInput}
        value={inputValue()}
        fontSize={props.fontSize}
        disabled={props.disabled}
        placeholder={props.placeholder ?? 'Type your question'}
      />
      <RecordButton
        buttonColor={props.sendButtonColor}
        type="button"
        class="my-2 ml-2"
        on:click={submit}
        isRecording={isRecording()}
        onRecordToggle={handleRecordToggle}
      />
      <SendButton
        sendButtonColor={props.sendButtonColor}
        type="button"
        isDisabled={props.disabled || inputValue() === ''}
        class="my-2"
        on:click={submit}
      >
        <span style={{ 'font-family': 'Poppins, sans-serif' }}>Send</span>
      </SendButton>
    </div>
  );
};
