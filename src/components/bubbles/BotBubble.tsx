import { Show, createEffect, createSignal, onMount } from 'solid-js';
import { Avatar } from '../avatars/Avatar';
import { Marked } from '@ts-stack/markdown';
import { sendFileDownloadQuery, sendTextToSpeechQuery } from '@/queries/sendMessageQuery';
import { PlayIcon } from '../icons/PlayIcon';
import { PauseIcon } from '../icons/PauseIcon';

type Props = {
  message: string;
  apiHost?: string;
  fileAnnotations?: any;
  showAvatar?: boolean;
  avatarSrc?: string;
  backgroundColor?: string;
  textColor?: string;
};

const defaultBackgroundColor = '#f7f8ff';
const defaultTextColor = '#303235';

Marked.setOptions({ isNoP: true });

export const BotBubble = (props: Props) => {
  let botMessageEl: HTMLDivElement | undefined;

  const [isPlaying, setIsPlaying] = createSignal(false);
  const [audioBlob, setAudioBlob] = createSignal<Blob>();
  const [isLoadingSpeech, setIsLoadingSpeech] = createSignal(false);

  const downloadFile = async (fileAnnotation: any) => {
    try {
      const response = await sendFileDownloadQuery({
        apiHost: props.apiHost,
        body: { question: '', history: [], fileName: fileAnnotation.fileName },
      });
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileAnnotation.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  onMount(() => {
    if (botMessageEl) {
      botMessageEl.innerHTML = Marked.parse(props.message);
      if (props.fileAnnotations && props.fileAnnotations.length) {
        for (const annotations of props.fileAnnotations) {
          const button = document.createElement('button');
          button.textContent = annotations.fileName;
          button.className =
            'py-2 px-4 mb-2 justify-center font-semibold text-white focus:outline-none flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 file-annotation-button';
          button.addEventListener('click', function () {
            downloadFile(annotations);
          });
          const svgContainer = document.createElement('div');
          svgContainer.className = 'ml-2';
          svgContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-download" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" /></svg>`;

          button.appendChild(svgContainer);
          botMessageEl.appendChild(button);
        }
      }
    }
  });

  let audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  function playBlob(blob: Blob) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const reader = new FileReader();
    reader.onload = function () {
      const buffer = reader.result as ArrayBuffer;

      // Step 3: Decode the audio data
      audioContext.decodeAudioData(buffer, function (decodedData) {
        // Step 4: Create an audio buffer source node
        const source = audioContext.createBufferSource();
        source.buffer = decodedData;

        // Step 5: Connect the source to the audio context's destination (speakers)
        source.connect(audioContext.destination);

        // Step 6: Start playing the sound
        source.start();

        source.onended = () => {
          setIsPlaying(false);
        };
        setIsPlaying(true);
      });
    };

    reader.readAsArrayBuffer(blob);
  }

  async function stopPlayingBlob() {
    if (audioContext.state === 'running' || audioContext.state === 'suspended') {
      setIsPlaying(false);
      audioContext.suspend();
    }
  }

  async function handlePlay() {
    try {
      setIsLoadingSpeech(true);
      let data: Blob;
      if (audioBlob()) {
        data = audioBlob() as Blob;
      } else {
        const response = await sendTextToSpeechQuery({ text: props.message });
        data = response.data;
        setAudioBlob(() => data);
      }

      playBlob(data as Blob);
    } finally {
      setIsLoadingSpeech(false);
    }
  }

  function handlePlayOrPause() {
    if (isPlaying()) {
      return stopPlayingBlob();
    } else {
      handlePlay();
    }
  }

  return (
    <div class="flex justify-start mb-2 items-start host-container" style={{ 'margin-right': '50px' }}>
      <Show when={props.showAvatar}>
        <Avatar initialAvatarSrc={props.avatarSrc} />
      </Show>
      <span
        ref={botMessageEl}
        class="px-4 py-2 ml-2 max-w-full chatbot-host-bubble prose"
        data-testid="host-bubble"
        style={{
          'background-color': props.backgroundColor ?? defaultBackgroundColor,
          color: props.textColor ?? defaultTextColor,
          'border-radius': '6px',
        }}
      />
      <div class="place-self-center cursor-pointer ml-2" onClick={handlePlayOrPause}>
        {isLoadingSpeech() ? (
          <div class="flex items-center">
            <div class="w-1 h-1 mr-1 rounded-full bubble1" />
            <div class="w-1 h-1 mr-1 rounded-full bubble2" />
            <div class="w-1 h-1 rounded-full bubble3" />
          </div>
        ) : isPlaying() ? (
          <PauseIcon />
        ) : (
          <PlayIcon />
        )}
      </div>
    </div>
  );
};
