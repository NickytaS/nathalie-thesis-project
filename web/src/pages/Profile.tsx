import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { UserAvatar } from '../components/UserAvatar';
import { useAuth } from '../context/AuthContext';

export function Profile() {
  const { user, loading, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName || '');
    setAvatarUrl(user.avatarUrl || '');
  }, [user]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      await updateProfile({ displayName, avatarUrl });
      setMsg('Profile updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update profile.');
    } finally {
      setBusy(false);
    }
  }

  async function fileToDataUrl(file: File): Promise<string> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const value = typeof reader.result === 'string' ? reader.result : '';
        if (!value) reject(new Error('Could not read selected image.'));
        else resolve(value);
      };
      reader.onerror = () => reject(new Error('Could not read selected image.'));
      reader.readAsDataURL(file);
    });
  }

  async function compressImageFile(file: File): Promise<string> {
    const original = await fileToDataUrl(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not decode selected image.'));
      el.src = original;
    });
    const maxSide = 512;
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not process selected image.');
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.82);
  }

  async function onPickAvatarFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Image must be 8MB or smaller.');
      return;
    }
    try {
      const value = await compressImageFile(file);
      if (value.length > 2_800_000) {
        setError('Image is still too large after compression. Try a smaller file.');
        return;
      }
      setError(null);
      setAvatarUrl(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not process selected image.');
    }
  }

  if (loading) {
    return (
      <div className="section page-pad">
        <h1 className="page-title">Profile</h1>
        <p className="page-lead">Loading…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="section page-pad">
      <h1 className="page-title">Profile</h1>
      <p className="page-lead">Manage your account profile details.</p>
      <div className="profile-card" style={{ marginTop: '1.5rem' }}>
        <div className="profile-avatar-row">
          <UserAvatar email={user.email} displayName={displayName} avatarUrl={avatarUrl} size={52} />
          <div>
            <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>{user.email}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Upload an image or keep initials avatar.
            </div>
          </div>
        </div>
        <form onSubmit={(e) => void onSubmit(e)}>
          {error && (
            <p role="alert" style={{ color: 'var(--accent-warm, #c45c3e)', marginBottom: '1rem', fontSize: '0.95rem' }}>
              {error}
            </p>
          )}
          {msg && (
            <p role="status" style={{ color: 'var(--accent-primary)', marginBottom: '1rem', fontSize: '0.95rem' }}>
              {msg}
            </p>
          )}
          <label className="profile-field-label" htmlFor="profile-display-name">
            Display name
          </label>
          <input
            id="profile-display-name"
            className="profile-input"
            value={displayName}
            maxLength={60}
            placeholder="Your name"
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={busy}
          />

          <label className="profile-field-label" htmlFor="profile-avatar-file">
            Avatar image
          </label>
          <input
            id="profile-avatar-file"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onPickAvatarFile(file);
              e.currentTarget.value = '';
            }}
          />
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
            >
              Upload image
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setAvatarUrl('')}
              disabled={busy || !avatarUrl}
            >
              Remove image
            </button>
          </div>
          <p className="profile-hint">Any image up to 8MB; it is resized/compressed automatically before saving.</p>

          <button type="submit" className="btn btn-primary profile-save" disabled={busy}>
            {busy ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
