type UserAvatarProps = {
  email: string;
  displayName?: string;
  avatarUrl?: string;
  size?: number;
};

function initialsFromName(email: string, displayName?: string): string {
  const source = (displayName || '').trim() || (email.split('@')[0] || '');
  const clean = source.replace(/[^a-zA-Z0-9._ -]/g, '');
  if (!clean) return '?';
  const parts = clean.split(/[._ -]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.slice(0, 1) || ''}${parts[1]?.slice(0, 1) || ''}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

function colorFromEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i += 1) {
    hash = (hash * 31 + email.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 55% 42%)`;
}

export function UserAvatar({ email, displayName, avatarUrl, size = 32 }: UserAvatarProps) {
  const initials = initialsFromName(email, displayName);
  const bg = colorFromEmail(email);
  const hasImage = Boolean((avatarUrl || '').trim());
  return (
    <span
      className="user-avatar"
      title={email}
      aria-label={`Account avatar for ${email}`}
      style={{ width: `${size}px`, height: `${size}px`, backgroundColor: bg }}
    >
      {hasImage ? (
        <img
          src={avatarUrl}
          alt=""
          aria-hidden
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '999px' }}
        />
      ) : (
        initials
      )}
    </span>
  );
}
