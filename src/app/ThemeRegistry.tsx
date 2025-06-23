'use client';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, useTheme } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import { useState } from 'react';
import { NextAppDirEmotionCacheProvider } from './EmotionCache';
import { CssVarsProvider } from '@mui/joy';


export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <NextAppDirEmotionCacheProvider options={{ key: 'joy' }}>
      <CssVarsProvider >
        <CssBaseline />
        {children}
      </CssVarsProvider>
    </NextAppDirEmotionCacheProvider>
  );
}