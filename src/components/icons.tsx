import React from 'react';

export const PoopIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    className={className}
    fill="currentColor"
  >
    <path d="M491.5,224.2c2.6-14.4-1-28.7-10.5-39.2c-10.1-11-24.6-16.7-39.8-16.7c-13.2,0-26.1,3.8-37.2,11.3 C381.5,123,322.6,83,256,83c-66.6,0-125.5,40-148.5,96.8c-11.1-7.5-24-11.3-37.2-11.3c-15.3,0-29.7,5.7-39.8,16.7 c-9.5,10.5-13,24.8-10.5,39.2c-2.2,12.3-2.3,25.3-0.2,38.5c1.6,10.2,5.2,19.9,10.5,28.8c11.9,20.1,28.9,35,49.8,43.2 c-12.7,21.5-19.1,46-18.2,71.2c1,28.2,12.3,55,32.7,75.4C198.2,504,226.1,512,256,512s57.8-8,81.4-23.8 c20.4-20.4,31.7-47.2,32.7-75.4c0.9-25.2-5.5-49.7-18.2-71.2c20.9-8.2,37.9-23,49.8-43.2c5.3-8.9,8.9-18.6,10.5-28.8 C493.8,249.5,493.7,236.5,491.5,224.2z M176.4,320.4c-17.7,0-32-14.3-32-32s14.3-32,32-32s32,14.3,32,32S194,320.4,176.4,320.4z M335.6,320.4c-17.7,0-32-14.3-32-32s14.3-32,32-32s32,14.3,32,32S353.2,320.4,335.6,320.4z"/>
  </svg>
);

export const GlobeIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 21l5.25-11.25L21 21m-9-3.75h.008v.008H12v-.008zM12 15h.008v.008H12v-.008zm0 2.25h.008v.008H12v-.008zM3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
    />
  </svg>
);

export const SpinnerIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);