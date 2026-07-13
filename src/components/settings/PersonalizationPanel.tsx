import React from 'react';
import Link from '@docusaurus/Link';
import {ArrowRight, Check, CheckCircle2, ImagePlus, Palette, RotateCcw, Save, Trash2, UserRound} from 'lucide-react';
import {Button} from '../ui/button';
import {
  DEFAULT_WALLPAPER_SETTINGS,
  addLocalWallpaper,
  deleteLocalImage,
  deleteLocalWallpaper,
  getLocalImage,
  getLocalWallpapers,
  getWallpaperSettings,
  saveLocalImage,
  saveWallpaperSettings,
  selectDefaultTheme,
  selectLocalWallpaper,
  type LocalImageKind,
  type WallpaperSettings,
} from '../../lib/localPersonalization';
import styles from './PersonalizationPanel.module.css';
import {useSiteAdminAccess} from '../../lib/useSiteAdminAccess';
import {safeSupabaseError, useSupabaseBrowserClient} from '../../lib/supabaseClient';
import {getAccountDisplayName} from '../../lib/accountProfile';

interface WallpaperPreview {
  id: string;
  name: string;
  createdAt: string;
  url: string;
}

export default function PersonalizationPanel(): React.ReactElement {
  const {client, config} = useSupabaseBrowserClient();
  const {session, loading: accountLoading} = useSiteAdminAccess();
  const wallpaperInput = React.useRef<HTMLInputElement | null>(null);
  const avatarInput = React.useRef<HTMLInputElement | null>(null);
  const previewUrlsRef = React.useRef<string[]>([]);
  const [settings, setSettings] = React.useState<WallpaperSettings>(DEFAULT_WALLPAPER_SETTINGS);
  const [wallpapers, setWallpapers] = React.useState<WallpaperPreview[]>([]);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<{kind: 'success' | 'error'; text: string} | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [displayName, setDisplayName] = React.useState('');
  const [savingName, setSavingName] = React.useState(false);

  const loadPreviews = React.useCallback(async (): Promise<void> => {
    const [assets, avatar] = await Promise.all([getLocalWallpapers(), getLocalImage('avatar')]);
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    const nextWallpapers = assets.map((asset) => ({...asset, blob: undefined, url: URL.createObjectURL(asset.blob)}));
    const nextAvatar = avatar ? URL.createObjectURL(avatar) : null;
    previewUrlsRef.current = [...nextWallpapers.map((asset) => asset.url), ...(nextAvatar ? [nextAvatar] : [])];
    setWallpapers(nextWallpapers.map(({id, name, createdAt, url}) => ({id, name, createdAt, url})));
    setAvatarPreview(nextAvatar);
  }, []);

  React.useEffect(() => {
    setSettings(getWallpaperSettings());
    void loadPreviews();
    return () => previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, [loadPreviews]);

  React.useEffect(() => {
    if (session) setDisplayName(getAccountDisplayName(session.user));
  }, [session]);

  const updateSetting = <K extends keyof WallpaperSettings>(key: K, value: WallpaperSettings[K]): void => {
    const next = {...settings, [key]: value};
    setSettings(next);
    saveWallpaperSettings(next);
  };

  const upload = async (kind: LocalImageKind, file?: File): Promise<void> => {
    if (!file || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      if (kind === 'wallpaper') await addLocalWallpaper(file);
      else await saveLocalImage(kind, file);
      await loadPreviews();
      setSettings(getWallpaperSettings());
      setMessage({kind: 'success', text: kind === 'wallpaper' ? '新壁纸已加入本地壁纸库，原有壁纸仍然保留。' : '本地头像已更新。'});
    } catch (error) {
      setMessage({kind: 'error', text: error instanceof Error ? error.message : '图片保存失败。'});
    } finally {
      setBusy(false);
      if (kind === 'wallpaper' && wallpaperInput.current) wallpaperInput.current.value = '';
      if (kind === 'avatar' && avatarInput.current) avatarInput.current.value = '';
    }
  };

  const removeWallpaper = async (id: string): Promise<void> => {
    if (busy) return;
    setBusy(true);
    try {
      await deleteLocalWallpaper(id);
      await loadPreviews();
      setSettings(getWallpaperSettings());
      setMessage({kind: 'success', text: '壁纸已从本地壁纸库删除。'});
    } catch (error) {
      setMessage({kind: 'error', text: error instanceof Error ? error.message : '壁纸删除失败。'});
    } finally {
      setBusy(false);
    }
  };

  const removeAvatar = async (): Promise<void> => {
    if (busy) return;
    setBusy(true);
    try {
      await deleteLocalImage('avatar');
      await loadPreviews();
      setMessage({kind: 'success', text: '本地头像已删除。'});
    } catch (error) {
      setMessage({kind: 'error', text: error instanceof Error ? error.message : '本地头像删除失败。'});
    } finally {
      setBusy(false);
    }
  };

  const chooseWallpaper = (id: string): void => {
    selectLocalWallpaper(id);
    setSettings(getWallpaperSettings());
    setMessage({kind: 'success', text: '壁纸已应用到全站背景。'});
  };

  const chooseDefault = (): void => {
    selectDefaultTheme();
    setSettings(getWallpaperSettings());
    setMessage({kind: 'success', text: '已切换为默认主题，已保存的壁纸不会被删除。'});
  };

  const reset = (): void => {
    const next = {...DEFAULT_WALLPAPER_SETTINGS, enabled: settings.enabled, activeWallpaperId: settings.activeWallpaperId};
    setSettings(next);
    saveWallpaperSettings(next);
    setMessage({kind: 'success', text: '壁纸显示参数已恢复默认。'});
  };

  const saveDisplayName = async (): Promise<void> => {
    const name = displayName.trim();
    if (!session) {
      setMessage({kind: 'error', text: '请先登录，再设置账户名称。'});
      return;
    }
    if (!name) {
      setMessage({kind: 'error', text: '账户名称不能为空。'});
      return;
    }
    if (name.length > 40) {
      setMessage({kind: 'error', text: '账户名称不能超过 40 个字符。'});
      return;
    }
    setSavingName(true);
    setMessage(null);
    const {error} = await client.auth.updateUser({data: {display_name: name}});
    if (error) setMessage({kind: 'error', text: safeSupabaseError(error, config)});
    else setMessage({kind: 'success', text: '账户名称已保存，顶部账户入口已同步更新。'});
    setSavingName(false);
  };

  const selectedWallpaperId = settings.activeWallpaperId ?? wallpapers[0]?.id ?? null;
  const selectedWallpaper = wallpapers.find((item) => item.id === selectedWallpaperId) ?? wallpapers[0];
  const wallpaperActive = Boolean(settings.enabled && selectedWallpaper);

  return (
    <div className={styles.personalization}>
      {message ? <p className={styles.message} data-kind={message.kind}>{message.text}</p> : null}
      <section className={styles.wallpaperSection}>
        <div className={styles.assetPreview} data-empty={!wallpaperActive}>
          {wallpaperActive && selectedWallpaper ? <img src={selectedWallpaper.url} alt={`当前壁纸：${selectedWallpaper.name}`} /> : <span><Palette size={24} />当前使用默认主题</span>}
        </div>
        <div className={styles.wallpaperStatus} data-active={wallpaperActive}>
          <CheckCircle2 size={18} />
          <div><strong>全站主背景</strong><span>{wallpaperActive ? `正在使用：${selectedWallpaper?.name}` : '当前使用默认主题'}</span></div>
          <Link to="/">在首页查看 <ArrowRight size={14} /></Link>
        </div>

        <div className={styles.assetActions}>
          <div><strong>本地壁纸库</strong><span>新壁纸会追加保存，不会覆盖旧壁纸；单张最大 15MB。</span></div>
          <input ref={wallpaperInput} hidden type="file" accept="image/*" onChange={(event) => void upload('wallpaper', event.target.files?.[0])} />
          <Button type="button" onClick={() => wallpaperInput.current?.click()} disabled={busy}><ImagePlus size={15} />添加壁纸</Button>
        </div>

        <div className={styles.wallpaperLibrary}>
          <button type="button" className={styles.defaultThemeCard} data-selected={!settings.enabled} onClick={chooseDefault}>
            <span><Palette size={24} /></span>
            <strong>默认主题</strong>
            <small>无壁纸背景</small>
            {!settings.enabled ? <Check className={styles.selectedMark} size={16} /> : null}
          </button>
          {wallpapers.map((wallpaper) => {
            const selected = settings.enabled && wallpaper.id === selectedWallpaperId;
            return (
              <article key={wallpaper.id} className={styles.wallpaperCard} data-selected={selected}>
                <button type="button" className={styles.wallpaperChoice} onClick={() => chooseWallpaper(wallpaper.id)}>
                  <img src={wallpaper.url} alt={wallpaper.name} />
                  <span><strong>{wallpaper.name}</strong><small>{new Date(wallpaper.createdAt).toLocaleDateString()}</small></span>
                  {selected ? <Check className={styles.selectedMark} size={16} /> : null}
                </button>
                <button type="button" className={styles.wallpaperDelete} title={`删除 ${wallpaper.name}`} aria-label={`删除 ${wallpaper.name}`} disabled={busy} onClick={() => void removeWallpaper(wallpaper.id)}><Trash2 size={15} /></button>
              </article>
            );
          })}
        </div>

        <div className={styles.controls} data-disabled={!wallpaperActive}>
          <label><span>模糊度 <b>{settings.blur}px</b></span><input disabled={!wallpaperActive} type="range" min="0" max="24" step="1" value={settings.blur} onChange={(event) => updateSetting('blur', Number(event.target.value))} /></label>
          <label><span>壁纸强度 <b>{Math.round(settings.opacity * 100)}%</b></span><input disabled={!wallpaperActive} type="range" min="8" max="100" step="1" value={Math.round(settings.opacity * 100)} onChange={(event) => updateSetting('opacity', Number(event.target.value) / 100)} /></label>
          <label><span>亮度 <b>{settings.brightness}%</b></span><input disabled={!wallpaperActive} type="range" min="50" max="130" step="1" value={settings.brightness} onChange={(event) => updateSetting('brightness', Number(event.target.value))} /></label>
          <label><span>横向位置 <b>{settings.positionX}%</b></span><input disabled={!wallpaperActive} type="range" min="0" max="100" step="1" value={settings.positionX} onChange={(event) => updateSetting('positionX', Number(event.target.value))} /></label>
          <label><span>纵向位置 <b>{settings.positionY}%</b></span><input disabled={!wallpaperActive} type="range" min="0" max="100" step="1" value={settings.positionY} onChange={(event) => updateSetting('positionY', Number(event.target.value))} /></label>
          <label className={styles.selectControl}><span>缩放方式</span><select disabled={!wallpaperActive} value={settings.fit} onChange={(event) => updateSetting('fit', event.target.value as WallpaperSettings['fit'])}><option value="cover">铺满</option><option value="contain">完整显示</option><option value="auto">原始尺寸</option></select></label>
          <button type="button" className={styles.resetButton} onClick={reset} disabled={!wallpaperActive}><RotateCcw size={14} />恢复默认参数</button>
        </div>
      </section>

      <section className={styles.avatarSection}>
        <div className={styles.avatarPreview}>{avatarPreview ? <img src={avatarPreview} alt="当前本地头像预览" /> : <UserRound size={28} />}</div>
        <div className={styles.avatarDetails}>
          <div className={styles.assetActions}>
            <div><strong>本地头像</strong><span>显示在账户入口和后台侧栏，最大 5MB。</span></div>
            <input ref={avatarInput} hidden type="file" accept="image/*" onChange={(event) => void upload('avatar', event.target.files?.[0])} />
            <Button type="button" onClick={() => avatarInput.current?.click()} disabled={busy}><UserRound size={15} />选择头像</Button>
            <Button type="button" variant="outline" onClick={() => void removeAvatar()} disabled={busy || !avatarPreview}><Trash2 size={15} />删除</Button>
          </div>
          <div className={styles.profileName}>
            <label htmlFor="account-display-name">账户名称</label>
            <input id="account-display-name" value={displayName} disabled={accountLoading || !session || savingName} maxLength={40} onChange={(event) => setDisplayName(event.target.value)} placeholder={session ? '输入显示名称' : '登录后可设置'} />
            <Button type="button" onClick={() => void saveDisplayName()} disabled={accountLoading || !session || savingName}><Save size={14} />{savingName ? '保存中' : '保存名称'}</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
