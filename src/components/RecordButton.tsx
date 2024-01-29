import { Spinner } from '@/components/SendButton';
import { Show } from 'solid-js';
import { JSX } from 'solid-js/jsx-runtime';
import { RecordIcon } from './icons/RecordIcon';
import { RecordingIcon } from './icons/RecordingIcon';

type RecordButtonProps = {
  buttonColor?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  disableIcon?: boolean;
  isRecording?: boolean;
  onRecordToggle?: () => void;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export function RecordButton(props: RecordButtonProps) {
  return (
    <button
      type="button"
      disabled={props.isDisabled || props.isLoading}
      {...props}
      class={
        'py-2 px-4 justify-center font-semibold text-white focus:outline-none flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 chatbot-button ' +
        props.class
      }
      style={{ background: 'transparent', border: 'none' }}
      onClick={() => props.onRecordToggle?.()}
    >
      <Show when={!props.isLoading} fallback={<Spinner class="text-white" />}>
        {!props.isRecording ? (
          <RecordIcon color={props.buttonColor} class={'send-icon flex ' + (props.disableIcon ? 'hidden' : '')} />
        ) : (
          <RecordingIcon class={'send-icon flex ' + (props.disableIcon ? 'hidden' : '')} />
        )}
      </Show>
    </button>
  );
}
