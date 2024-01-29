import { JSX } from 'solid-js/jsx-runtime';
const defaultButtonColor = 'rgb(248 113 113)';
export const RecordingIcon = (props: JSX.SvgSVGAttributes<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="19px"
    style={{ fill: props.color ?? defaultButtonColor }}
    {...props}
    class="animate-ping"
  >
    <path d="M19,12C19,15.86 15.86,19 12,19C8.14,19 5,15.86 5,12C5,8.14 8.14,5 12,5C15.86,5 19,8.14 19,12Z" />
  </svg>
);
