import React from 'react';
import {useLocalImageState, useLocalWallpaperSettings} from '../lib/localPersonalization';

export default function LocalPersonalizationController(): React.ReactElement | null {
  const {url: wallpaperUrl, ready} = useLocalImageState('wallpaper');
  const settings = useLocalWallpaperSettings();
  const enabled = Boolean(settings.enabled && (!ready || wallpaperUrl));

  React.useEffect(() => {
    const root = document.documentElement;
    root.dataset.crWallpaper = enabled ? 'true' : 'false';
    root.dataset.crWallpaperReady = ready ? 'true' : 'false';
  }, [enabled, ready]);

  if (!enabled) return null;

  return (
    <div id="cr-local-wallpaper-layer" data-ready={ready && Boolean(wallpaperUrl)} aria-hidden="true">
      <div
        className="cr-local-wallpaper-image"
        style={{
          backgroundImage: wallpaperUrl ? `url("${wallpaperUrl}")` : undefined,
          backgroundPosition: `${settings.positionX}% ${settings.positionY}%`,
          backgroundSize: settings.fit,
          filter: `blur(${settings.blur}px) brightness(${settings.brightness}%)`,
          opacity: wallpaperUrl ? settings.opacity : 0,
        }}
      />
      <div className="cr-local-wallpaper-veil" />
    </div>
  );
}
