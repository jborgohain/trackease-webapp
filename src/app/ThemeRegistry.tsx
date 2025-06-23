'use client';
import CssBaseline from '@mui/joy/CssBaseline';
import { NextAppDirEmotionCacheProvider } from './EmotionCache';
import { CssVarsProvider } from '@mui/joy';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <NextAppDirEmotionCacheProvider options={{ key: 'joy' }}>
      <CssVarsProvider>
        <CssBaseline />
        {children}
      </CssVarsProvider>
    </NextAppDirEmotionCacheProvider>
  );
}