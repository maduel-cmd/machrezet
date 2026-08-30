import { useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { compressImageFile } from '../lib/profilePhoto';
import { hashPassword, profileHasCredentials, unlockSession, verifyPassword } from '../lib/profileAuth';
import {
  PROFILE_AGE_MAX,
  PROFILE_AGE_MIN,
  PROFILE_NAME_MAX,
  PROFILE_PASSWORD_MAX,
  PROFILE_USERNAME_MAX,
  profileIsSet,
  validatePasswordInput,
  validateUsernameInput,
} from '../lib/storage';
import type { PlayerProfile } from '../lib/types';

type Props = {
  profile: PlayerProfile;
  onSave: (next: PlayerProfile) => void;
  onBack: () => void;
  onLock?: () => void;
};

export function PlayerProfileScreen({ profile, onSave, onBack, onLock }: Props) {
  const nameId = useId();
  const usernameId = useId();
  const passwordId = useId();
  const password2Id = useId();
  const ageId = useId();
  const photoId = useId();
  const fileRef = useRef<HTMLInputElement>(null);

  const hadCredentials = profileHasCredentials(profile);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [clearPassword, setClearPassword] = useState(false);
  const [ageText, setAgeText] = useState(profile.age != null ? String(profile.age) : '');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(profile.photoDataUrl);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onPickPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const url = await compressImageFile(file);
      setPhotoDataUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת התמונה');
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const name = displayName.trim().slice(0, PROFILE_NAME_MAX);
    const userErr = validateUsernameInput(username);
    if (userErr) {
      setError(userErr);
      return;
    }
    const user = username.trim().slice(0, PROFILE_USERNAME_MAX);

    let age: number | null = null;
    if (ageText.trim()) {
      const n = Number.parseInt(ageText.trim(), 10);
      if (!Number.isFinite(n) || n < PROFILE_AGE_MIN || n > PROFILE_AGE_MAX) {
        setError(`הגיל צריך להיות בין ${PROFILE_AGE_MIN} ל־${PROFILE_AGE_MAX}`);
        return;
      }
      age = n;
    }

    let passwordSalt = profile.passwordSalt;
    let passwordHash = profile.passwordHash;

    if (clearPassword) {
      passwordSalt = null;
      passwordHash = null;
    } else if (password || password2) {
      if (!user) {
        setError('לסיסמה נדרש גם שם משתמש');
        return;
      }
      const passErr = validatePasswordInput(password, { required: true });
      if (passErr) {
        setError(passErr);
        return;
      }
      if (password !== password2) {
        setError('הסיסמאות אינן תואמות');
        return;
      }
      setBusy(true);
      try {
        const hashed = await hashPassword(password);
        passwordSalt = hashed.salt;
        passwordHash = hashed.hash;
      } catch {
        setError('לא ניתן לשמור את הסיסמה');
        setBusy(false);
        return;
      }
      setBusy(false);
    } else if (user && !hadCredentials) {
      // שם משתמש חדש בלי סיסמה — מותר, בלי נעילה
      passwordSalt = null;
      passwordHash = null;
    } else if (!user) {
      passwordSalt = null;
      passwordHash = null;
    }

    onSave({
      displayName: name,
      username: user,
      age,
      photoDataUrl,
      passwordSalt,
      passwordHash,
      updatedAt: Date.now(),
    });
  };

  const clearPhoto = () => setPhotoDataUrl(null);

  return (
    <section className="panel profile-panel">
      <button type="button" className="ghost-btn back-link" onClick={onBack}>
        ← חזרה
      </button>
      <header className="profile-header">
        <h1>הפרופיל שלי</h1>
        <p className="lede">
          שם, תמונה, גיל, שם משתמש וסיסמה נשמרים רק במכשיר הזה — בלי ענן.
        </p>
      </header>

      <form className="profile-form" onSubmit={(e) => void submit(e)}>
        <div className="profile-photo-block">
          <div className="profile-avatar" aria-hidden={!photoDataUrl}>
            {photoDataUrl ? (
              <img src={photoDataUrl} alt="" />
            ) : (
              <span className="profile-avatar-fallback">{initials(displayName || username)}</span>
            )}
          </div>
          <div className="profile-photo-actions">
            <input
              ref={fileRef}
              id={photoId}
              type="file"
              accept="image/*"
              capture="user"
              className="sr-only"
              onChange={onPickPhoto}
              disabled={busy}
            />
            <button
              type="button"
              className="secondary"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              {busy ? 'מעבד…' : photoDataUrl ? 'החלפת תמונה' : 'הוספת תמונה'}
            </button>
            {photoDataUrl ? (
              <button type="button" className="ghost-btn" onClick={clearPhoto} disabled={busy}>
                הסרת תמונה
              </button>
            ) : null}
          </div>
        </div>

        <label className="profile-field" htmlFor={nameId}>
          <span>השם שלי</span>
          <input
            id={nameId}
            type="text"
            maxLength={PROFILE_NAME_MAX}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="למשל: מאיה"
            autoComplete="nickname"
          />
        </label>

        <label className="profile-field" htmlFor={ageId}>
          <span>הגיל שלי</span>
          <input
            id={ageId}
            type="number"
            inputMode="numeric"
            min={PROFILE_AGE_MIN}
            max={PROFILE_AGE_MAX}
            value={ageText}
            onChange={(e) => setAgeText(e.target.value)}
            placeholder={`${PROFILE_AGE_MIN}–${PROFILE_AGE_MAX}`}
          />
        </label>

        <fieldset className="profile-creds">
          <legend>כניסה במכשיר</legend>
          <p className="profile-creds-hint">
            אופציונלי — אם תגדירו סיסמה, תידרשו להתחבר בפתיחת האפליקציה.
          </p>
          <label className="profile-field" htmlFor={usernameId}>
            <span>שם משתמש</span>
            <input
              id={usernameId}
              type="text"
              maxLength={PROFILE_USERNAME_MAX}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="כינוי או אימייל"
              autoComplete="username"
              dir="ltr"
            />
          </label>
          <label className="profile-field" htmlFor={passwordId}>
            <span>{hadCredentials && !clearPassword ? 'סיסמה חדשה (ריק = בלי שינוי)' : 'סיסמה'}</span>
            <input
              id={passwordId}
              type="password"
              maxLength={PROFILE_PASSWORD_MAX}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setClearPassword(false);
              }}
              placeholder="לפחות 4 תווים"
              autoComplete="new-password"
              dir="ltr"
              disabled={clearPassword}
            />
          </label>
          <label className="profile-field" htmlFor={password2Id}>
            <span>אימות סיסמה</span>
            <input
              id={password2Id}
              type="password"
              maxLength={PROFILE_PASSWORD_MAX}
              value={password2}
              onChange={(e) => {
                setPassword2(e.target.value);
                setClearPassword(false);
              }}
              placeholder="שוב את אותה סיסמה"
              autoComplete="new-password"
              dir="ltr"
              disabled={clearPassword}
            />
          </label>
          {hadCredentials ? (
            <label className="profile-check">
              <input
                type="checkbox"
                checked={clearPassword}
                onChange={(e) => {
                  setClearPassword(e.target.checked);
                  if (e.target.checked) {
                    setPassword('');
                    setPassword2('');
                  }
                }}
              />
              <span>הסרת סיסמה (ביטול נעילה)</span>
            </label>
          ) : null}
        </fieldset>

        {error ? (
          <p className="profile-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="profile-actions">
          <button type="submit" className="primary" disabled={busy}>
            שמירת פרופיל
          </button>
          {profileIsSet(profile) ? (
            <button
              type="button"
              className="ghost-btn"
              disabled={busy}
              onClick={() => {
                setDisplayName('');
                setUsername('');
                setPassword('');
                setPassword2('');
                setClearPassword(false);
                setAgeText('');
                setPhotoDataUrl(null);
                onSave({
                  displayName: '',
                  username: '',
                  age: null,
                  photoDataUrl: null,
                  passwordSalt: null,
                  passwordHash: null,
                  updatedAt: Date.now(),
                });
              }}
            >
              איפוס פרופיל
            </button>
          ) : null}
          {hadCredentials && onLock ? (
            <button type="button" className="ghost-btn" disabled={busy} onClick={onLock}>
              נעילה ויציאה
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}

export function LocalLoginScreen({
  profile,
  onUnlock,
}: {
  profile: PlayerProfile;
  onUnlock: () => void;
}) {
  const userId = useId();
  const passId = useId();
  const [username, setUsername] = useState(profile.username);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!profile.passwordSalt || !profile.passwordHash) {
      onUnlock();
      return;
    }
    const u = username.trim();
    if (u.toLowerCase() !== profile.username.trim().toLowerCase()) {
      setError('שם משתמש או סיסמה שגויים');
      return;
    }
    setBusy(true);
    try {
      const ok = await verifyPassword(password, profile.passwordSalt, profile.passwordHash);
      if (!ok) {
        setError('שם משתמש או סיסמה שגויים');
        return;
      }
      unlockSession(profile.username);
      onUnlock();
    } catch {
      setError('שגיאה בהתחברות');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel profile-panel login-panel">
      <header className="profile-header">
        <h1>ברוכים השבים</h1>
        <p className="lede">הזינו שם משתמש וסיסמה כדי להמשיך (נשמר במכשיר בלבד).</p>
      </header>
      <form className="profile-form" onSubmit={(e) => void submit(e)}>
        <label className="profile-field" htmlFor={userId}>
          <span>שם משתמש</span>
          <input
            id={userId}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            dir="ltr"
            autoFocus
          />
        </label>
        <label className="profile-field" htmlFor={passId}>
          <span>סיסמה</span>
          <input
            id={passId}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            dir="ltr"
          />
        </label>
        {error ? (
          <p className="profile-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="profile-actions">
          <button type="submit" className="primary" disabled={busy}>
            {busy ? 'בודק…' : 'כניסה'}
          </button>
        </div>
      </form>
    </section>
  );
}

export function ProfileChip({
  profile,
  onClick,
}: {
  profile: PlayerProfile;
  onClick: () => void;
}) {
  const label = profile.displayName.trim() || profile.username.trim() || 'הפרופיל שלי';
  return (
    <button type="button" className="profile-chip" onClick={onClick} title="עריכת פרופיל">
      <span className="profile-chip-avatar" aria-hidden>
        {profile.photoDataUrl ? (
          <img src={profile.photoDataUrl} alt="" />
        ) : (
          <span>{initials(profile.displayName || profile.username)}</span>
        )}
      </span>
      <span className="profile-chip-text">
        <strong>{label}</strong>
        {profile.username.trim() ? (
          <span className="profile-chip-user" dir="ltr">
            @{profile.username.trim()}
          </span>
        ) : profile.age != null ? (
          <span>גיל {profile.age}</span>
        ) : (
          <span>הוסיפו פרטים</span>
        )}
      </span>
    </button>
  );
}

function initials(name: string): string {
  const t = name.trim();
  if (!t) return '?';
  return t.slice(0, 1);
}
