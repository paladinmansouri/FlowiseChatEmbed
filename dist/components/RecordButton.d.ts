import { JSX } from 'solid-js/jsx-runtime';
type RecordButtonProps = {
    buttonColor?: string;
    isDisabled?: boolean;
    isLoading?: boolean;
    disableIcon?: boolean;
    isRecording?: boolean;
    onRecordToggle?: () => void;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;
export declare function RecordButton(props: RecordButtonProps): JSX.Element;
export {};
//# sourceMappingURL=RecordButton.d.ts.map