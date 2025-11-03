import React from 'react';
import { Capacitor } from '@capacitor/core';

interface SafeAreaViewProps {
  children: React.ReactNode;
  className?: string;
}

export const SafeAreaView: React.FC<SafeAreaViewProps> = ({ children, className = '' }) => {
  const isNative = Capacitor.isNativePlatform();
  
  return (
    <div 
      className={`
        ${className}
        ${isNative ? 'pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right' : ''}
      `}
      style={{
        paddingTop: isNative ? 'env(safe-area-inset-top)' : undefined,
        paddingRight: isNative ? 'env(safe-area-inset-right)' : undefined,
        paddingBottom: isNative ? 'env(safe-area-inset-bottom)' : undefined,
        paddingLeft: isNative ? 'env(safe-area-inset-left)' : undefined,
      }}
    >
      {children}
    </div>
  );
};