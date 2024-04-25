import { Show, createSignal, onMount } from 'solid-js';
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
let audioRef: HTMLAudioElement;

Marked.setOptions({ isNoP: true });

export const BotBubble = (props: Props) => {
  let botMessageEl: HTMLDivElement | undefined;

  const [isPlaying, setIsPlaying] = createSignal(false);
  const [alreadyLoaded, setAlreadyLoaded] = createSignal(false);
  const [audioResponse, setAudioResponse] = createSignal<Response>();
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

  async function playStreamResponse(res: Response) {
    const audio = audioRef;
    audio.controls = true;

    if (!alreadyLoaded()) {
      setAlreadyLoaded(true);
      const mediaSource = new MediaSource();
      audio.src = URL.createObjectURL(mediaSource);

      mediaSource.addEventListener('sourceopen', function () {
        const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg'); // Specify the correct MIME type

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const reader = res.body!.getReader();
        async function push() {
          const { done, value } = await reader.read();
          if (done) {
            mediaSource.endOfStream();
            return;
          }
          sourceBuffer.appendBuffer(value);
          sourceBuffer.addEventListener('updateend', push, { once: true });
        }
        push();
      });
    }

    audio.currentTime = 0;
    audio.play();
    setIsPlaying(true);
    audio.onended = () => {
      setIsPlaying(false);
    };
  }

  async function stopPlayingBlob() {
    if (!audioRef.paused) {
      setIsPlaying(false);
      audioRef.pause();
    }
  }

  async function handlePlay() {
    try {
      setIsLoadingSpeech(true);
      let data: Response;
      if (audioResponse()) {
        data = audioResponse() as Response;
      } else {
        const response = await sendTextToSpeechQuery({ text: props.message });
        data = response;
        setAudioResponse(() => data);
      }

      playStreamResponse(data as Response);
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
      <audio ref={audioRef} controls={false} class="hidden" />
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
