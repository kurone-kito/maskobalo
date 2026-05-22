# Anonymous Mode

## 1. Overview

maskobalo (Esperanto for *masquerade ball*) is a voice chat application
for tabletop role-playing games and impromptu net parties. The
load-bearing differentiator from a generic VC app is **anonymous
mode**: a GM-controlled state in which every member's name and color
are shuffled and live audio is replaced with random-machine-voice
TTS→STT chaining, so no one can identify each other from voice cues
while the mode is on. The mode can be deepened further by handing out
**chameleon** charges that re-mask individual members mid-window. This
document is the durable source of truth for the design; PRs that touch
any of the moving parts below should link to a specific section of
this file in their bodies.

## 2. Session model

A session has one **GM** (game master / host) and zero or more
**members**. The GM creates the session; members join with a free-text
nickname.

Session creation returns **two URLs** at the same time:

- **Join URL** (shareable): `https://maskobalo.app/r/{roomId}`. Anyone
  with this URL joins as a regular member.
- **GM URL** (private):
  `https://maskobalo.app/r/{roomId}#gm={token}`. The GM keeps this;
  loading it grants admin actions (anonymous-mode toggle, kick,
  session end, chameleon grants). The `{token}` is an opaque random
  URL-safe string (≥22 chars, ≥128 bits of entropy), validated by the
  Durable Object on socket auth and on every admin action.

The GM URL is displayed on the session-creation screen with an
explicit "save / bookmark this — without it you cannot reclaim GM"
warning. As a convenience, the GM's browser also stashes
`{ roomId: token }` in localStorage so a same-browser refresh resumes
the GM role transparently. There is no password reset, no email
recovery, no transferable backup phrase for MVP. Losing the GM URL
means losing the GM seat for that session; the session continues
without a GM.

The two-URL model was preferred over the alternatives ("first joiner
becomes GM" → fragile under refresh and race conditions; "GM password
entered at join time" → adds a UX form step) because it cleanly
separates the public share surface from the admin handle and is
auditable from the URL alone.

## 3. Anonymous-mode lifecycle

The GM toggles anonymous mode on or off from the admin UI. Every
transition follows the same pattern:

1. The GM clicks the toggle button.
2. The Durable Object computes `transitionStartAt` (UTC ms epoch,
   3 seconds in the future), and broadcasts a
   `mode-transition-scheduled` message to every connected member.
3. Each client renders a 3-second countdown banner sourced from
   `transitionStartAt` — so the banner is roughly simultaneous across
   clients regardless of jitter.
4. At `transitionStartAt`, the new mode takes effect:
   - **OFF → ON**: live audio cuts for every member subject to
     masking; the TTS→STT path engages for them; each masked
     member's identity triplet
     (`maskedName`, `maskedColor`, `ttsVoiceId`) is regenerated and
     broadcast in an `identity-shuffle` message; the displayed
     identity becomes the masked one for those members. When the
     session was created with **GM is exempt** (§5), the GM is the
     one and only member excluded from this step — their real name,
     color, and live audio continue unchanged through the transition,
     and they are absent from the `identity-shuffle` payload.
   - **ON → OFF**: live audio resumes for every previously-masked
     member; real names and colors come back; any unfired chameleon
     charges expire (see §6.10). Members who were exempt (GM under
     "GM is exempt") see no observable change at this transition.

Inside one ON window each member's triplet is **stable** for the
duration. Toggling OFF and then ON again produces fresh triplets —
there is no continuous mid-window re-shuffle.

The single documented exception to the in-window stability rule is the
[Chameleon extension](#6-chameleon-extension), which intentionally
re-shuffles a single member's triplet mid-window.

## 4. TTS / STT path

The MVP picks the cheapest path that ships: the browser-native Web
Speech API.

- **STT**: `SpeechRecognition` / `webkitSpeechRecognition`. Continuous
  recognition runs while the speaker holds a push-to-talk key (or is
  in voice-activated mode); the resulting transcript is sent over the
  DataChannel as a `tts-utterance` message.
- **TTS**: `speechSynthesis` + `SpeechSynthesisUtterance`. The
  receiving client uses the speaker's currently assigned `ttsVoiceId`
  (from the latest `identity-shuffle` or `chameleon-fired` message) to
  render the transcript.

The random-voice pool is a small allowlist of
`speechSynthesis.getVoices()` entries empirically confirmed to exist
on Windows / macOS / ChromeOS. The list is committed to source (one
place: `packages/web/src/tts/voice-pool.ts` once that package exists)
so every client computes the same shuffle output given the same
`shuffleId` seed.

**Practical browser support is Chromium-first** (Chrome / Edge /
Chromium derivatives). Safari is degraded (Web Speech API behind a
flag, recognition quality is rough); Firefox is unsupported (no
`SpeechRecognition`). The MVP is documented as Chromium-first and the
join page tells unsupported-browser users to switch.

**Privacy posture**: Chrome's `SpeechRecognition` ships audio to
Google. This is the "MVP only" path. The Whisper-WASM (in-browser)
replacement and / or Cloudflare Workers AI Whisper binding live in
separate follow-up issues, not in this doc.

**Voice-pool exhaustion fallback**: when the underlying TTS catalog is
small (e.g., Web Speech API on a stripped OS), the implementation may
re-use a voice but apply a fresh `(pitch, rate)` adjustment so the
audible voice still feels distinct. The optional `voiceAdjust` field
on `identity-shuffle.identities[]` and `chameleon-fired.newIdentity`
carries this when set.

## 5. GM-masked vs GM-exempt

On the session-creation screen the GM picks **one** of:

- **GM is also masked** (suggested default for blind-judgement /
  werewolf-style play): the GM gets a shuffled identity + TTS voice
  like everyone else while anonymous mode is on.
- **GM is exempt** (suggested default for moderator-style play): the
  GM keeps real name / color / live voice; only non-GM members are
  masked.

This choice is bound to the session at start and **does not change
mid-session**. There is no toggle UI for it after session start
(MVP). If the GM wants the other behavior, they end the session and
start a new one.

The `gmExempt: boolean` field on `RoomState.anonymousMode` records the
choice and is immutable across the session lifetime.

## 6. Chameleon extension

While anonymous mode is on, the GM can grant a single member a
**chameleon charge**. When the charge fires, that member's
`(maskedName, maskedColor, ttsVoiceId)` triplet is re-shuffled to
fresh values — a mask within the mask. This is the only mechanism
that modifies a member's identity mid-window; §3's stability rule
still holds for everyone else.

### 6.1 What re-shuffles on chameleon fire

All three of `maskedName`, `maskedColor`, and `ttsVoiceId` are
re-shuffled together as a single atomic event. Picking only one is
not exposed as a UI option.

*Rationale*: an observer who knows two of the three can often infer
the third from cross-correlated history. Atomic re-shuffle keeps the
unit of identity coherent and prevents partial leakage.

### 6.2 Visibility — who sees the activation

The shift itself is **silent for all non-grantees**. They simply
experience the new identity arriving — no banner, no countdown, no
toast. This is the deliberate misdirection surface that makes
chameleon worth shipping.

For the grantee specifically:

| Activation path | Pre-fire announcement | At the moment of the shift |
|---|---|---|
| Member opt-in | Toast to the grantee at grant time ("you can use a chameleon now") | No countdown — the grantee chose the moment |
| GM timed (`3s` / `20s` / `40s` / `60s`) | 3-second self-only countdown to the grantee, regardless of which slot the GM picked | Triggered automatically when `firesAt` is reached |

*Rationale*: the timed path needs the 3-second tail so the grantee
has time to register that they're about to look different. The
opt-in path doesn't — by clicking fire, the grantee has already
registered the change.

### 6.3 Activation modes

The GM picks one mode per grant:

- **Timed**: `3s` / `20s` / `40s` / `60s` slots only. "Immediate"
  collapses to the `3s` slot — there is no zero-latency trigger, so
  the protocol uniformly schedules a `firesAt` timestamp.
- **Opt-in**: the GM hands the charge to the grantee; the grantee
  decides whether and when to fire it. An unfired opt-in charge
  expires unconditionally when anonymous mode ends.

*Rationale*: discrete slots beat a free-form spinner for UX speed at
the table. The `3s` slot replaces a separate "immediate" mode so
every timed grant uses the same `firesAt`-based code path.

### 6.4 Use count

**Single shot per grant.** Once consumed (timer elapsed or grantee
opt-in click), the charge is spent. The GM may re-grant the same
member afterwards.

*Rationale*: a single-shot model is easier to reason about (one
grant, one fire). Multi-shot grants would need a "remaining" counter
in the UI and would complicate the "anonymous-mode OFF expires
unfired grants" rule.

### 6.5 No self-grant

GM cannot grant a chameleon to themselves, regardless of the §5
GM-masked vs GM-exempt choice. Chameleon is strictly an instrument
the GM points at others.

*Rationale*: the no-self-grant rule prevents the GM from using
chameleon as a way to "leave the masquerade" within a "GM is also
masked" session — the §5 decision is the only handle the GM has on
their own visibility.

### 6.6 Voice-pool exhaustion fallback

When the underlying TTS catalog is small (e.g., Web Speech API on a
stripped OS), the implementation may re-use an existing voice but
apply a fresh `(pitch, rate)` adjustment so the audible voice still
feels distinct. The same fallback is also available on the base §3
anonymous-mode shuffle.

The optional `voiceAdjust: { pitch: number; rate: number }` field on
`identity-shuffle.identities[]` and `chameleon-fired.newIdentity`
carries this when set; if absent, the receiver uses the voice
catalogue defaults.

*Rationale*: rather than refusing to chameleon when the voice pool
is exhausted, the fallback degrades audibly but keeps the feature
functional. The misdirection still works because the voice still
sounds different.

### 6.7 Opt-in UX

The grantee receives an in-app toast when the GM grants the charge:

> 🦎 You have a chameleon charge. Tap to use it now.

The toast carries a "Use chameleon now" button. The grantee can
ignore the toast; the charge waits silently in their UI until either
they click fire or anonymous mode ends.

*Rationale*: the toast is visible enough to register, ignorable
enough to not interrupt a turn, and one tap to use.

### 6.8 Simultaneity

Multiple charges may be in flight at the same time. Simultaneity is
bounded by the GM's button-press cadence — the protocol does not
deduplicate or serialize grants, and there is no system-level "only
one grant active" limit. Two activations that resolve in the same
broadcast tick are applied as one batched re-shuffle so the
cross-member uniqueness rule (§6.9) is preserved.

*Rationale*: bounding simultaneity at the UI cadence (rather than
via protocol locking) keeps the implementation simple and lets the
GM deliberately spray the table with chameleons for chaos if that is
the gameplay they want.

### 6.9 Uniqueness rule

The new triplet must avoid colliding with any other member's
currently active triplet at fire time. This is the documented
exception to §3's "triplet stable in ON window" rule — chameleon is
the only mid-window shuffler.

*Rationale*: the masquerade depends on distinct identities. If
chameleon could produce a colliding identity, two members would be
visually indistinguishable, which breaks the in-game vocabulary
("the green mask said X").

### 6.10 Lifecycle

- A grant is created the instant the GM clicks "grant chameleon" on
  a member.
- The grant is consumed when it fires (timer elapsed or grantee
  opt-in click).
- Any unfired grant is dropped when anonymous mode ends. No timer
  fires after the `transitionStartAt` for OFF.

When a chameleon fires, the server emits two distinct messages:

1. A `chameleon-fired` carrying the new identity, **scoped to the GM
   and the grantee only** (see §7 routing).
2. A fresh `identity-shuffle` broadcast to every connected member so
   non-grantees just see the identities list update without learning
   that a chameleon happened. The grant / fire / expire events are
   never visible to non-grantees, which is what makes §6.2's
   misdirection real rather than aspirational.

*Rationale*: tying expiry to the anonymous-mode lifecycle keeps the
state machine compact — there is no separate "charge expiration"
logic to maintain, and no orphaned grants survive a mode flip. The
two-message fire (scoped `chameleon-fired` + broadcast
`identity-shuffle`) keeps non-grantees inside the misdirection while
still updating their displayed identities.

## 7. Protocol

Most DataChannel messages emitted by the Durable Object are broadcast
to every connected member; a small set is **scoped** to specific
recipients to preserve the chameleon misdirection surface (§6.2). The
routing table after the message-shape block below names which is
which.

```ts
type ServerMessage =
  | { type: 'mode-transition-scheduled'; mode: 'on' | 'off'; transitionStartAt: number /* ms epoch */ }
  | {
      type: 'identity-shuffle';
      shuffleId: string;
      identities: Array<{
        memberId: string;
        maskedName: string;
        maskedColor: string;
        ttsVoiceId: string;
        voiceAdjust?: { pitch: number; rate: number }; // pool-exhaustion fallback
      }>;
    }
  | { type: 'tts-utterance'; from: string /* memberId */; text: string; ts: number }
  | {
      type: 'chameleon-granted';
      grantId: string;
      toMember: string;
      mode: 'opt-in' | 'timed-3s' | 'timed-20s' | 'timed-40s' | 'timed-60s';
      firesAt?: number /* ms epoch, present only for timed-* modes */;
    }
  | {
      type: 'chameleon-fired';
      grantId: string;
      member: string;
      newIdentity: {
        maskedName: string;
        maskedColor: string;
        ttsVoiceId: string;
        voiceAdjust?: { pitch: number; rate: number };
      };
    }
  | { type: 'chameleon-expired'; grantId: string; reason: 'anonymous-mode-off' };
```

Client → server (admin paths require the GM token from the WS
handshake):

```ts
type ClientMessage =
  | { type: 'request-mode-toggle'; targetMode: 'on' | 'off' } // GM only
  | { type: 'tts-utterance'; text: string } // any masked speaker, while anonymous mode is on
  | {
      type: 'grant-chameleon';
      toMember: string;
      mode: 'opt-in' | 'timed-3s' | 'timed-20s' | 'timed-40s' | 'timed-60s';
    } // GM only
  | { type: 'fire-opt-in-chameleon'; grantId: string }; // grantee only
```

The self-only 3-second countdown for a timed chameleon is purely a
client-side render based on `firesAt`; the server does not broadcast
a separate "3s before" notice. Likewise the §3 mode-transition
countdown is rendered by clients off `transitionStartAt` — no
separate "3s before" ServerMessage.

### Routing

| Message | Delivery |
|---|---|
| `mode-transition-scheduled` | broadcast to every connected member |
| `identity-shuffle` | broadcast to every connected member |
| `tts-utterance` | broadcast to every connected member |
| `chameleon-granted` | **scoped**: GM + the grantee only |
| `chameleon-fired` | **scoped**: GM + the grantee only (non-grantees receive a fresh `identity-shuffle` instead — see §6.10) |
| `chameleon-expired` | **scoped**: GM + the grantee only |

Scoped messages must be filtered at the Durable Object before send;
the client side must never receive a `chameleon-*` event addressed to
a different member. Implementations that fan all messages out to all
peers and rely on client-side filtering leak the misdirection surface
and violate this contract.

These types are reproduced from RFC #3 with the
`color → maskedColor` and `startsAt → transitionStartAt` renames
locked in by PR #5 (the same PR that landed this doc), and with the
above explicit routing semantics added on top — `chameleon-granted`
and `chameleon-fired` and `chameleon-expired` were originally written
as plain broadcast events in RFC #3, which would have leaked the
misdirection. When `packages/shared` is created, this section is the
input the `feat(shared)` issue uses for the actual TypeScript module,
and the `feat(signaling)` issue must implement the routing filter on
the server side.

## 8. Room state

The Durable Object holding a single session keeps the following
state:

```ts
interface RoomState {
  roomId: string;
  gmToken: string; // never sent to non-GM peers
  members: Map<string /* memberId */, {
    nickname: string; // real
    color: string;    // real
    connectedAt: number;
  }>;
  anonymousMode: {
    active: boolean;
    gmExempt: boolean; // decided at session creation, immutable
    transition?: { targetActive: boolean; transitionStartAt: number };
    currentShuffle?: {
      shuffleId: string;
      perMember: Map<string /* memberId */, {
        maskedName: string;
        maskedColor: string;
        ttsVoiceId: string;
        voiceAdjust?: { pitch: number; rate: number };
      }>;
    };
    chameleons: Map<string /* grantId */, {
      toMember: string;
      mode: 'opt-in' | 'timed-3s' | 'timed-20s' | 'timed-40s' | 'timed-60s';
      grantedAt: number;
      firesAt?: number; // present for timed-* modes
      consumedAt?: number; // set when fired or expired
    }>;
  };
}
```

This is reproduced from RFC #3 with no behavioral drift. When
`packages/signaling` is created, this section is the input the
`feat(signaling)` issue uses for the Durable Object's persistent
shape.

## 9. Out of scope

The following are explicitly **not** in this design and should be
tracked as separate follow-up issues:

- Whisper-WASM in-browser privacy replacement for the STT path.
- Cloudflare Workers AI Whisper binding for the STT path.
- Multi-region scale considerations — single-region Cloudflare for
  MVP.
- Persistent chat history (wizard decision: none for MVP).
- Mobile Safari / Firefox support — degraded by the Web Speech API
  choice; revisits alongside Whisper.
- Recovery flow if the GM token is lost — MVP accepts "session
  continues without GM".
- Mid-session toggle of §5 (GM-masked vs GM-exempt).
- Member-to-member chameleon grants — only the GM may grant.
- Chameleon recall / cancellation — once granted, only the grantee
  or the anonymous-mode lifecycle can end it.
- GM dashboard of the current real-to-masked mapping — useful but
  separate UX work; not blocking the MVP.

## 10. Decision log

| # | Decision | Rationale |
|---|---|---|
| D1 | Nickname and color are both shuffled on every anonymous-mode ON transition. | Color-only would leave the nickname as a stable identity handle, defeating the masquerade. Both must move together. |
| D2 | Triplet (name + color + voice) is stable for the duration of one ON window. | Moving identities mid-conversation is disorienting. Stability lets the in-game vocabulary ("the green mask said X") stay coherent. The single exception is Chameleon, §6. |
| D3 | MVP uses the browser-native Web Speech API. | Cheapest path that ships. Whisper-WASM is the principled replacement and lives in a follow-up issue; doing it now would expand MVP scope by weeks. |
| D4 | Session creation returns two URLs (join + GM). | The single-URL alternatives (first-joiner-becomes-GM, GM-password-at-join) are either fragile or add UX friction. Two URLs cleanly separate the public share surface from the admin handle. |
| D5 | GM-masked vs GM-exempt is a session-creation choice, immutable. | Allowing mid-session toggling adds a state machine with no clear gameplay benefit and lets the GM "leave the masquerade" mid-game, weakening the social contract. |
| D6 | Mode transitions show a 3-second countdown to all members. | Cutting audio without warning leaves half-sentences hanging. 3 seconds gives speakers time to finish and listeners time to brace. |
| C1 | Chameleon re-shuffles name + color + voice atomically. | Partial re-shuffle leaks identity through whichever attribute did not move; atomic keeps the unit coherent. |
| C2 | Chameleon shift is silent for non-grantees; 3-second self-only countdown for timed grantees; no countdown for opt-in fire. | Non-grantee silence is the misdirection. Grantee countdown only applies when the system chose the moment; opt-in grantee already knows because they clicked. |
| C3 | Chameleon timed slots are `3s` / `20s` / `40s` / `60s`; "immediate" collapses to `3s`. | Discrete slots beat a free-form spinner at the table. Collapsing "immediate" into a slot keeps the protocol uniform. |
| C4 | Single shot per grant. | Multi-shot grants need a counter UI and complicate the "anonymous-mode OFF expires unfired grants" rule. |
| C5 | GM cannot grant a chameleon to themselves. | Self-grant would let the GM bypass the §5 GM-masked decision mid-session. |
| C6 | Voice-pool exhaustion falls back to a fresh `(pitch, rate)` adjustment on a reused voice. | Refusing to chameleon when the pool is exhausted breaks the feature; degraded audio keeps it functional. |
| C7 | Opt-in UX is an in-app toast carrying a "Use chameleon now" button. | The toast is visible enough to register, ignorable enough to not interrupt a turn, and one tap to use. |
| C8 | Simultaneous chameleons are allowed; the only gate is the GM's button-press cadence. | Protocol-level locking adds complexity without clear gameplay benefit and prevents the "spray chameleons" chaos mode. |
| C9 | New chameleon triplet must avoid colliding with current triplets. | A collision would make two members visually indistinguishable, breaking the in-game vocabulary. |
| C10 | Unfired chameleon grants expire when anonymous mode ends. | Ties expiry to a lifecycle event we already manage; no orphan grants survive a mode flip. |
