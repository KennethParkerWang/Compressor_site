import React from 'react';
import {useLocalImageUrl, useLocalWallpaperSettings} from '../lib/localPersonalization';

export default function LocalPersonalizationController(): React.ReactElement | null {
  const wallpaperUrl = useLocalImageUrl('wallpaper');
  const settings = useLocalWallpaperSettings();
  const enabled = Boolean(wallpaperUrl && settings.enabled);

  React.useEffect(() => {
    const root = document.documentElement;
    root.dataset.crWallpaper = enabled ? 'true' : 'false';
  }, [enabled]);

  if (!enabled || !wallpaperUrl) return null;

  return (
    <div id="cr-local-wallpaper-layer" aria-hidden="true">
      <div
        className="cr-local-wallpaper-image"
        style={{
          backgroundImage: `url("${wallpaperUrl}")`,
          backgroundPosition: `${settings.positionX}% ${settings.positionY}%`,
          backgroundSize: settings.fit,
          filter: `blur(${settings.blur}px) brightness(${settings.brightness}%)`,
          opacity: settings.opacity,
        }}
      />
      <div className="cr-local-wallpaper-veil" />
    </div>
  );
}
