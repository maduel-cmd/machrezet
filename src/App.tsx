import { useCallback, useEffect, useState } from 'react';
import { PRODUCT_LABELS } from './data/beads';
import { COPY_CHALLENGES, REQUEST_CHALLENGES, getCopyChallenge, getRequestChallenge } from './data/challenges';
import { StrandEditor } from './components/StrandEditor';
import { StrandReadonly } from './components/StrandPreview';
import { RequestProgressChecklist } from './components/RequestProgressChecklist';
import { PlayerProfileScreen, ProfileChip, LocalLoginScreen } from './components/PlayerProfileScreen';
import { InstallAppButton } from './components/InstallAppButton';
import { OfflineUpdateButton } from './components/OfflineUpdateButton';
import { CelebrationBurst } from './components/CelebrationBurst';
import { ExportShareButtons } from './components/ExportShareButtons';
import { ThemeAmbient } from './components/ThemeAmbient';
import { ThemeSwitcher, useSyncedPrefs } from './components/ThemeSwitcher';
import { defaultCreationName, isDefaultCreationName } from './lib/creationName';
import { matchCopy } from './lib/copyMatch';
import {
  isSessionUnlocked,
  lockSession,
  profileHasCredentials,
  unlockSession,
} from './lib/profileAuth';
import { scoreMessage, scoreRequest } from './lib/scoring';
import {
  addCreation,
  deleteCreation,
  loadCreations,
  loadProfile,
  profileIsSet,
  saveProfile,
} from './lib/storage';
import { playBoxOpen, playCelebrateFanfare } from './lib/craftSounds';
import { subscribePwaUpdate } from './lib/pwaUpdate';
import type { BeadDef, Creation, PlacedBead, PlayerProfile, ProductKind, Screen } from './lib/types';
import './styles.css';
import './themes.css';

function newInstance(bead: BeadDef): PlacedBead {
  return {
    instanceId: `${bead.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    beadId: bead.id,
  };
}

export default function App() {
  const { themeId, soundMuted, setThemeId, setMuted } = useSyncedPrefs();
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [kind, setKind] = useState<ProductKind>('bracelet');
  const [cordColor, setCordColor] = useState('#E8E4DC');
  const [beads, setBeads] = useState<PlacedBead[]>([]);
  const [closed, setClosed] = useState(false);
  const [gallery, setGallery] = useState<Creation[]>([]);
  const [profile, setProfile] = useState<PlayerProfile>(() => loadProfile());
  const [saveName, setSaveName] = useState(() => defaultCreationName('bracelet', loadProfile().displayName));
  const [toast, setToast] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [lastSaved, setLastSaved] = useState<Creation | null>(null);
  const [unlocked, setUnlocked] = useState(() => {
    const p = loadProfile();
    return !profileHasCredentials(p) || isSessionUnlocked(p.username);
  });

  const refreshGallery = useCallback(() => {
    setGallery(loadCreations());
  }, []);

  useEffect(() => {
    refreshGallery();
    const p = loadProfile();
    setProfile(p);
    setUnlocked(!profileHasCredentials(p) || isSessionUnlocked(p.username));
  }, [refreshGallery]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const resetEditor = (nextKind: ProductKind = 'bracelet', nextCord = '#E8E4DC') => {
    setKind(nextKind);
    setCordColor(nextCord);
    setBeads([]);
    setClosed(false);
    setSaveName(defaultCreationName(nextKind, profile.displayName));
  };

  const changeKind = (nextKind: ProductKind) => {
    setKind(nextKind);
    setSaveName((prev) =>
      isDefaultCreationName(prev, profile.displayName)
        ? defaultCreationName(nextKind, profile.displayName)
        : prev,
    );
  };

  const addBead = (bead: BeadDef) => {
    setClosed(false);
    setBeads((prev) => [...prev, newInstance(bead)]);
  };
  const removeAt = (index: number) => {
    setClosed(false);
    setBeads((prev) => prev.filter((_, i) => i !== index));
  };
  const undo = () => {
    setClosed(false);
    setBeads((prev) => prev.slice(0, -1));
  };
  const clear = () => {
    setClosed(false);
    setBeads([]);
  };

  const persist = (source: Creation['source'], score?: number, forceClosed?: boolean) => {
    const name = saveName.trim() || defaultCreationName(kind, profile.displayName);
    const closedAtSave = forceClosed ?? closed;
    const created = addCreation({
      name,
      kind,
      beads,
      cordColor,
      source,
      score,
      closed: closedAtSave,
    });
    refreshGallery();
    setLastSaved(created);
    setToast(`נשמר לנצח במכשיר: ${created.name}`);
    return created;
  };

  const triggerCelebration = () => {
    playCelebrateFanfare();
    setCelebrate(true);
    window.setTimeout(() => setCelebrate(false), 2200);
  };

  const goGallery = () => {
    playBoxOpen();
    refreshGallery();
    setScreen({ name: 'gallery' });
  };

  const namePlaceholder = defaultCreationName(kind, profile.displayName);

  const handleSaveProfile = (next: PlayerProfile) => {
    const saved = saveProfile(next);
    setProfile(saved);
    if (profileHasCredentials(saved)) {
      unlockSession(saved.username);
      setUnlocked(true);
    } else {
      lockSession();
      setUnlocked(true);
    }
    setToast(profileIsSet(saved) ? 'הפרופיל נשמר במכשיר' : 'הפרופיל אופס');
    setScreen({ name: 'home' });
  };

  if (!unlocked) {
    return (
      <div className="app" data-theme={themeId}>
        <ThemeAmbient themeId={themeId} />
        <header className="topbar">
          <div className="brand">
            <img className="brand-logo" src="/logo.png" alt="" width={36} height={36} />
            <span className="brand-mark">מחרזת</span>
          </div>
          <div className="topbar-actions">
            <ThemeSwitcher
              themeId={themeId}
              onThemeChange={setThemeId}
              soundMuted={soundMuted}
              onSoundMutedChange={setMuted}
            />
          </div>
        </header>
        <main className="main">
          <LocalLoginScreen
            profile={profile}
            onUnlock={() => {
              setUnlocked(true);
              setToast('ברוכים הבאים!');
            }}
          />
        </main>
        {toast ? <div className="toast" role="status">{toast}</div> : null}
      </div>
    );
  }

  return (
    <div className="app" data-theme={themeId}>
      <ThemeAmbient themeId={themeId} />
      <header className="topbar">
        <button type="button" className="brand" onClick={() => setScreen({ name: 'home' })}>
          <img className="brand-logo" src="/logo.png" alt="" width={36} height={36} />
          <span className="brand-mark">מחרזת</span>
        </button>
        <div className="topbar-actions">
          <ThemeSwitcher
            themeId={themeId}
            onThemeChange={setThemeId}
            soundMuted={soundMuted}
            onSoundMutedChange={setMuted}
          />
          {screen.name === 'home' ? (
            <>
              <ProfileChip profile={profile} onClick={() => setScreen({ name: 'profile' })} />
              <button
                type="button"
                className="gallery-chip"
                onClick={goGallery}
              >
                תיבת התכשיטים ({gallery.length})
              </button>
            </>
          ) : null}
          {screen.name !== 'home' ? (
            <button type="button" className="ghost-btn" onClick={() => setScreen({ name: 'home' })}>
              תפריט
            </button>
          ) : null}
        </div>
      </header>

      <main className="main">
        {screen.name === 'home' ? (
          <Home
            profile={profile}
            onNavigate={(s) => {
              if (s.name === 'gallery') {
                goGallery();
                return;
              }
              if (s.name === 'free' && isDefaultCreationName(saveName, profile.displayName)) {
                setSaveName(defaultCreationName(kind, profile.displayName));
              }
              setScreen(s);
            }}
          />
        ) : null}

        {screen.name === 'profile' ? (
          <PlayerProfileScreen
            profile={profile}
            onSave={handleSaveProfile}
            onBack={() => setScreen({ name: 'home' })}
            onLock={() => {
              lockSession();
              setUnlocked(false);
              setToast('ננעל — הזינו סיסמה לכניסה');
            }}
          />
        ) : null}

        {screen.name === 'free' ? (
          <section className="play-shell play-panel glass-panel">
            <div className="play-context">
              <span className="context-chip">יצירה חופשית</span>
              <p className="play-coach">
                {beads.length === 0
                  ? 'בחרו חרוז מהמגש — הקישו או גררו אל החוט'
                  : closed
                    ? 'מוכן! אפשר לשנות שם ולשמור לתיבה'
                    : 'הוסיפו חרוזים — ואז סיימו לקשור למטה'}
              </p>
            </div>
            <StrandEditor
              kind={kind}
              onKindChange={changeKind}
              cordColor={cordColor}
              onCordChange={setCordColor}
              beads={beads}
              onAdd={addBead}
              onRemoveAt={removeAt}
              onClear={clear}
              onUndo={undo}
              closed={closed}
              onClosedChange={setClosed}
              hideCloseButton
            />
            <SaveBar
              saveName={saveName}
              setSaveName={setSaveName}
              namePlaceholder={namePlaceholder}
              disabled={beads.length === 0}
              onSave={() => {
                const shouldClose = kind !== 'ornament';
                if (shouldClose && !closed) setClosed(true);
                triggerCelebration();
                persist('free', undefined, shouldClose ? true : closed);
              }}
              sticky
              saveLabel={
                kind === 'necklace'
                  ? 'סיימתי! לקשור את השרשרת 🪢'
                  : kind === 'ornament'
                    ? 'סיימתי! שמירה לתיבה 🎁'
                    : 'סיימתי! לקשור את הצמיד 🪢'
              }
            />
            {lastSaved && lastSaved.source === 'free' && beads.length > 0 ? (
              <div className="post-save-export">
                <p className="post-save-export-label">שמור בתיבה — אפשר גם לשתף תמונה:</p>
                <ExportShareButtons
                  input={{
                    name: lastSaved.name,
                    kind: lastSaved.kind,
                    cordColor: lastSaved.cordColor,
                    beads: lastSaved.beads,
                    closed: lastSaved.closed,
                    createdAt: lastSaved.createdAt,
                  }}
                  onDone={(result) =>
                    setToast(result === 'shared' ? 'שותף בהצלחה!' : 'התמונה נשמרה במכשיר')
                  }
                />
              </div>
            ) : null}
          </section>
        ) : null}

        {screen.name === 'copy' && !screen.challengeId ? (
          <ChallengeList
            title="דוגמאות להעתקה"
            subtitle="רואים דוגמה — משחזרים על החוט."
            items={COPY_CHALLENGES.map((c) => ({
              id: c.id,
              title: c.titleHe,
              meta: PRODUCT_LABELS[c.kind],
            }))}
            onPick={(id) => {
              const c = getCopyChallenge(id);
              if (!c) return;
              resetEditor(c.kind, c.cordColor);
              setScreen({ name: 'copy', challengeId: id });
            }}
          />
        ) : null}

        {screen.name === 'copy' && screen.challengeId ? (
          <CopyPlay
            challengeId={screen.challengeId}
            kind={kind}
            cordColor={cordColor}
            beads={beads}
            saveName={saveName}
            setSaveName={setSaveName}
            namePlaceholder={namePlaceholder}
            onKindChange={changeKind}
            onCordChange={setCordColor}
            onAdd={addBead}
            onRemoveAt={removeAt}
            onClear={clear}
            onUndo={undo}
            onBack={() => setScreen({ name: 'copy' })}
            onSubmit={(score, message, creationId) => setScreen({ name: 'result', score, message, creationId })}
            persist={persist}
          />
        ) : null}

        {screen.name === 'request' && !screen.challengeId ? (
          <ChallengeList
            title="משימה קטנה"
            subtitle="מקבלים בקשה — יוצרים ומקבלים ציון."
            items={REQUEST_CHALLENGES.map((c) => ({
              id: c.id,
              title: c.titleHe,
              meta: PRODUCT_LABELS[c.kind],
            }))}
            onPick={(id) => {
              const c = getRequestChallenge(id);
              if (!c) return;
              resetEditor(c.kind, '#E8E4DC');
              setScreen({ name: 'request', challengeId: id });
            }}
          />
        ) : null}

        {screen.name === 'request' && screen.challengeId ? (
          <RequestPlay
            challengeId={screen.challengeId}
            kind={kind}
            cordColor={cordColor}
            beads={beads}
            saveName={saveName}
            setSaveName={setSaveName}
            namePlaceholder={namePlaceholder}
            onKindChange={changeKind}
            onCordChange={setCordColor}
            onAdd={addBead}
            onRemoveAt={removeAt}
            onClear={clear}
            onUndo={undo}
            onBack={() => setScreen({ name: 'request' })}
            onSubmit={(score, message, creationId) => setScreen({ name: 'result', score, message, creationId })}
            persist={persist}
          />
        ) : null}

        {screen.name === 'gallery' ? (
          <Gallery
            items={gallery}
            onCreateNew={() => {
              resetEditor(kind, cordColor);
              if (isDefaultCreationName(saveName, profile.displayName)) {
                setSaveName(defaultCreationName(kind, profile.displayName));
              }
              setScreen({ name: 'free' });
            }}
            onDelete={(id) => {
              setGallery(deleteCreation(id));
              setToast('נמחק מהגלריה');
            }}
            onToast={setToast}
            onLoad={(c) => {
              setKind(c.kind);
              setCordColor(c.cordColor);
              setBeads(c.beads);
              setClosed(Boolean(c.closed));
              setSaveName(c.name);
              setLastSaved(c);
              setScreen({ name: 'free' });
              setToast('נטען לעורך');
            }}
          />
        ) : null}

        {screen.name === 'result' ? (
          <ResultScreen
            score={screen.score}
            message={screen.message}
            onHome={() => setScreen({ name: 'home' })}
            onGallery={goGallery}
          />
        ) : null}
      </main>

      {toast ? <div className="toast" role="status">{toast}</div> : null}
      <CelebrationBurst active={celebrate} />
      {screen.name !== 'home' ? <UpdateReadyFloat /> : null}
    </div>
  );
}

/** באנר צף כשיש עדכון — גם מחוץ לדף הבית */
function UpdateReadyFloat() {
  const [needRefresh, setNeedRefresh] = useState(false);
  useEffect(() => subscribePwaUpdate((s) => setNeedRefresh(s.needRefresh)), []);
  if (!needRefresh) return null;
  return (
    <div className="pwa-update-float">
      <OfflineUpdateButton />
    </div>
  );
}

function Home({
  profile,
  onNavigate,
}: {
  profile: PlayerProfile;
  onNavigate: (s: Screen) => void;
}) {
  const name = profile.displayName.trim();
  return (
    <section className="home hero-panel glass-panel">
      <div className="hero-logo-wrap">
        <img
          className="hero-logo"
          src="/logo.png"
          alt="לוגו מחרזת"
          width={160}
          height={160}
          decoding="async"
        />
      </div>
      <h1 className="hero-brand">מחרזת</h1>
      <p className="hero-tag">שוזרים. יוצרים. שומרים.</p>
      {name ? (
        <p className="hero-hello">
          שלום, <strong>{name}</strong>
          {profile.age != null ? <span className="hero-hello-age"> · גיל {profile.age}</span> : null}
        </p>
      ) : (
        <p className="hero-hello hero-hello--prompt">בואו נכיר — בחרו שם ותמונה</p>
      )}
      <button type="button" className="profile-home-btn" onClick={() => onNavigate({ name: 'profile' })}>
        {profile.photoDataUrl ? (
          <img className="profile-home-btn-photo" src={profile.photoDataUrl} alt="" />
        ) : (
          <span className="profile-home-btn-photo profile-home-btn-photo--empty" aria-hidden>
            {name ? name.slice(0, 1) : '+'}
          </span>
        )}
        <span className="profile-home-btn-copy">
          <strong>{name ? 'הפרופיל שלי' : 'מי משחקת?'}</strong>
          <span>{name ? 'שם, תמונה וגיל' : 'שם + תמונה (רק במכשיר)'}</span>
        </span>
      </button>
      <div className="hero-cta home-game-cards">
        <button type="button" className="primary primary-play home-cta-bounce" onClick={() => onNavigate({ name: 'free' })}>
          <strong>בואו ניצור! ✨</strong>
          <span className="primary-play-sub">יצירה חופשית · בחרו חרוזים</span>
        </button>
        <button type="button" className="home-card home-card--tactile" onClick={() => onNavigate({ name: 'copy' })}>
          <span className="home-card-emoji" aria-hidden>
            🎨
          </span>
          <span className="home-card-copy">
            <strong>דוגמאות להעתקה</strong>
            <span>רואים תכשיט — ועושים כמוהו</span>
          </span>
        </button>
        <button type="button" className="home-card home-card--tactile" onClick={() => onNavigate({ name: 'request' })}>
          <span className="home-card-emoji" aria-hidden>
            🏆
          </span>
          <span className="home-card-copy">
            <strong>משימה קטנה</strong>
            <span>בקשה קטנה · מקבלים ציון</span>
          </span>
        </button>
        <button type="button" className="home-card home-card--tactile home-card--box" onClick={() => onNavigate({ name: 'gallery' })}>
          <span className="home-card-emoji" aria-hidden>
            🎁
          </span>
          <span className="home-card-copy">
            <strong>תיבת התכשיטים שלי</strong>
            <span>כל היצירות השמורות במכשיר</span>
          </span>
        </button>
        <InstallAppButton />
        <OfflineUpdateButton />
      </div>
    </section>
  );
}

function ChallengeList({
  title,
  subtitle,
  items,
  onPick,
}: {
  title: string;
  subtitle: string;
  items: Array<{ id: string; title: string; meta: string }>;
  onPick: (id: string) => void;
}) {
  return (
    <section className="panel glass-panel">
      <h1>{title}</h1>
      <p className="lede">{subtitle}</p>
      <ul className="challenge-list">
        {items.map((item) => (
          <li key={item.id}>
            <button type="button" onClick={() => onPick(item.id)}>
              <strong>{item.title}</strong>
              <span>{item.meta}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SaveBar({
  saveName,
  setSaveName,
  namePlaceholder = 'שם ליצירה…',
  disabled,
  onSave,
  saveLabel = 'שמירה לנצח',
  sticky = false,
}: {
  saveName: string;
  setSaveName: (v: string) => void;
  namePlaceholder?: string;
  disabled: boolean;
  onSave: () => void;
  saveLabel?: string;
  sticky?: boolean;
}) {
  return (
    <div className={`save-bar${sticky ? ' sticky-save' : ''}`}>
      <input
        type="text"
        placeholder={namePlaceholder}
        value={saveName}
        onChange={(e) => setSaveName(e.target.value)}
        maxLength={40}
        aria-label="שם ליצירה"
      />
      <button type="button" className="primary" disabled={disabled} onClick={onSave}>
        {saveLabel}
      </button>
    </div>
  );
}

function CopyPlay({
  challengeId,
  kind,
  cordColor,
  beads,
  saveName,
  setSaveName,
  namePlaceholder,
  onKindChange,
  onCordChange,
  onAdd,
  onRemoveAt,
  onClear,
  onUndo,
  onBack,
  onSubmit,
  persist,
}: {
  challengeId: string;
  kind: ProductKind;
  cordColor: string;
  beads: PlacedBead[];
  saveName: string;
  setSaveName: (v: string) => void;
  namePlaceholder: string;
  onKindChange: (k: ProductKind) => void;
  onCordChange: (c: string) => void;
  onAdd: (b: BeadDef) => void;
  onRemoveAt: (i: number) => void;
  onClear: () => void;
  onUndo: () => void;
  onBack: () => void;
  onSubmit: (score: number, message: string, creationId?: string) => void;
  persist: (source: Creation['source'], score?: number) => Creation;
}) {
  const challenge = getCopyChallenge(challengeId);
  if (!challenge) return <p>אתגר לא נמצא</p>;

  return (
    <section className="play-shell play-panel glass-panel">
      <button type="button" className="ghost-btn back-link" onClick={onBack}>
        ← חזרה
      </button>
      <div className="play-context">
        <span className="context-chip">העתיקו את הדוגמה</span>
        <h1 className="play-title">{challenge.titleHe}</h1>
      </div>
      <div className="target-box target-compact">
        <p className="target-label">דוגמה</p>
        <StrandReadonly beadIds={challenge.beadIds} cordColor={challenge.cordColor} kind={challenge.kind} />
      </div>
      <p className="stage-label">היצירה שלכם</p>
      <StrandEditor
        kind={kind}
        onKindChange={onKindChange}
        cordColor={cordColor}
        onCordChange={onCordChange}
        beads={beads}
        onAdd={onAdd}
        onRemoveAt={onRemoveAt}
        onClear={onClear}
        onUndo={onUndo}
        lockedKind
      />
      <div className="action-row">
        <SaveBar
          saveName={saveName}
          setSaveName={setSaveName}
          namePlaceholder={namePlaceholder}
          disabled={beads.length === 0}
          onSave={() => persist('copy')}
          saveLabel="שמירה לנצח"
        />
        <button
          type="button"
          className="primary"
          disabled={beads.length === 0}
          onClick={() => {
            const result = matchCopy(beads, challenge.beadIds);
            const created = persist('copy', result.score);
            onSubmit(result.score, result.exact ? 'התאמה מושלמת!' : result.notes.join(' · '), created.id);
          }}
        >
          בדוק התאמה
        </button>
      </div>
    </section>
  );
}

function RequestPlay({
  challengeId,
  kind,
  cordColor,
  beads,
  saveName,
  setSaveName,
  namePlaceholder,
  onKindChange,
  onCordChange,
  onAdd,
  onRemoveAt,
  onClear,
  onUndo,
  onBack,
  onSubmit,
  persist,
}: {
  challengeId: string;
  kind: ProductKind;
  cordColor: string;
  beads: PlacedBead[];
  saveName: string;
  setSaveName: (v: string) => void;
  namePlaceholder: string;
  onKindChange: (k: ProductKind) => void;
  onCordChange: (c: string) => void;
  onAdd: (b: BeadDef) => void;
  onRemoveAt: (i: number) => void;
  onClear: () => void;
  onUndo: () => void;
  onBack: () => void;
  onSubmit: (score: number, message: string, creationId?: string) => void;
  persist: (source: Creation['source'], score?: number) => Creation;
}) {
  const challenge = getRequestChallenge(challengeId);
  if (!challenge) return <p>אתגר לא נמצא</p>;

  return (
    <section className="play-shell play-panel glass-panel">
      <button type="button" className="ghost-btn back-link" onClick={onBack}>
        ← חזרה
      </button>
      <div className="play-context">
        <span className="context-chip context-chip--request">בקשה מיוחדת</span>
        <h1 className="play-title">{challenge.titleHe}</h1>
      </div>
      <div className="brief-box brief-invite">
        <p className="brief-kicker">ההזמנה שלכם</p>
        <p className="brief-text">{challenge.briefHe}</p>
      </div>
      <RequestProgressChecklist beads={beads} rules={challenge.rules} />
      <StrandEditor
        kind={kind}
        onKindChange={onKindChange}
        cordColor={cordColor}
        onCordChange={onCordChange}
        beads={beads}
        onAdd={onAdd}
        onRemoveAt={onRemoveAt}
        onClear={onClear}
        onUndo={onUndo}
        lockedKind
        maxBeads={challenge.rules.maxBeads}
      />
      <div className="action-row">
        <SaveBar
          saveName={saveName}
          setSaveName={setSaveName}
          namePlaceholder={namePlaceholder}
          disabled={beads.length === 0}
          onSave={() => persist('request')}
          saveLabel="שמירה לנצח"
        />
        <button
          type="button"
          className="primary"
          disabled={beads.length === 0}
          onClick={() => {
            const result = scoreRequest(beads, challenge.rules);
            const msg = `${scoreMessage(result.score)} ${result.notes.slice(0, 3).join(' · ')}`;
            const created = persist('request', result.score);
            onSubmit(result.score, msg, created.id);
          }}
        >
          שלח לניקוד
        </button>
      </div>
    </section>
  );
}

function Gallery({
  items,
  onDelete,
  onLoad,
  onCreateNew,
  onToast,
}: {
  items: Creation[];
  onDelete: (id: string) => void;
  onLoad: (c: Creation) => void;
  onCreateNew: () => void;
  onToast: (msg: string) => void;
}) {
  const [focusedId, setFocusedId] = useState<string | null>(null);

  return (
    <section className="panel jewelry-box glass-panel">
      <header className="jewelry-box-header">
        <h1>תיבת התכשיטים</h1>
        <p className="lede">היצירות שלכם נשמרות לנצח במכשיר הזה.</p>
      </header>

      {items.length === 0 ? (
        <div className="jewelry-box-empty jewelry-box-empty--visual">
          <img
            className="jewelry-box-empty-art"
            src="/ui/jewelry-box-ref.jpg"
            alt=""
            width={280}
            height={210}
            decoding="async"
          />
          <p className="jewelry-box-empty-title">התיבה מחכה לתכשיט הראשון שלך!</p>
          <p className="jewelry-box-empty-hint">צרו צמיד או שרשרת — והוא יופיע כאן בתיבה.</p>
          <button type="button" className="primary jewelry-box-empty-cta" onClick={onCreateNew}>
            להכין תכשיט חדש ✨
          </button>
        </div>
      ) : null}

      <ul className="jewelry-box-grid">
        {items.map((c) => {
          const focused = focusedId === c.id;
          const created = new Date(c.createdAt);
          const dateLabel = created.toLocaleDateString('he-IL', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
          return (
            <li key={c.id}>
              <article
                className={`jewel-piece${focused ? ' is-focused' : ''}${c.closed ? ' is-closed-piece' : ''}`}
              >
                <button
                  type="button"
                  className="jewel-piece-stage"
                  onClick={() => setFocusedId((id) => (id === c.id ? null : c.id))}
                  aria-expanded={focused}
                  aria-label={`${c.name} — ${focused ? 'סגירה' : 'הגדלה'}`}
                >
                  <span className={`jewel-kind-badge kind-${c.kind}`}>{PRODUCT_LABELS[c.kind]}</span>
                  <span className="jewel-forever-badge">לנצח</span>
                  <div className="jewel-piece-preview">
                    <StrandReadonly
                      beadIds={c.beads.map((b) => b.beadId)}
                      cordColor={c.cordColor}
                      kind={c.kind}
                      closed={Boolean(c.closed)}
                      hero
                    />
                  </div>
                  {focused ? <span className="jewel-sparkles" aria-hidden /> : null}
                </button>

                <div className="jewel-piece-meta">
                  <strong className="jewel-piece-name jewel-name-tag">{c.name}</strong>
                  <span className="jewel-piece-sub">
                    <time dateTime={new Date(c.createdAt).toISOString()}>{dateLabel}</time>
                    {c.score != null ? ` · ציון ${c.score}` : ''}
                  </span>
                  <ExportShareButtons
                    compact
                    input={{
                      name: c.name,
                      kind: c.kind,
                      cordColor: c.cordColor,
                      beads: c.beads,
                      closed: c.closed,
                      createdAt: c.createdAt,
                    }}
                    onDone={(result) =>
                      onToast(result === 'shared' ? 'שותף בהצלחה!' : 'התמונה נשמרה במכשיר')
                    }
                  />
                  <div className="jewel-piece-actions">
                    <button type="button" className="primary" onClick={() => onLoad(c)}>
                      פתיחה בעורך
                    </button>
                    <button type="button" className="ghost-btn" onClick={() => onDelete(c.id)}>
                      מחק
                    </button>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ResultScreen({
  score,
  message,
  onHome,
  onGallery,
}: {
  score: number;
  message: string;
  onHome: () => void;
  onGallery: () => void;
}) {
  return (
    <section className="panel result-panel glass-panel">
      <p className="result-label">הציון שלכם</p>
      <p className="result-score" aria-live="polite">
        {score}
      </p>
      <p className="lede">{message}</p>
      <div className="hero-cta">
        <button type="button" className="primary" onClick={onGallery}>
          לתיבת התכשיטים
        </button>
        <button type="button" className="secondary" onClick={onHome}>
          לתפריט
        </button>
      </div>
    </section>
  );
}
