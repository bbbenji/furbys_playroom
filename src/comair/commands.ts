/**
 * Known ComAir command/response meanings, transcribed from the community
 * dictionary in Furby::Command (Hacksby project): https://github.com/iafan/Hacksby
 *
 * Only entries with an actual documented meaning are included — the full
 * [0..1023] space is mostly unmapped. Entries marked `sendable: true` are
 * flagged in the source ("!") as working when sent by the official app;
 * everything else is documented as something Furby sends *to* the app
 * (an event or a status report) and is included here only so incoming
 * responses can be labeled.
 *
 * Important correction vs. naive assumptions: 900-911 are Furby reporting
 * its *current* personality (e.g. after accepting food), not a command you
 * can send to force a personality change on demand — personality drifts
 * over time based on how Furby is treated, it cannot be set instantly.
 */
import { lookupPhrase } from './phrasebook'

export interface CommandInfo {
  id: number
  label: string
  description: string
  sendable: boolean
}

function entry(id: number, label: string, description: string, sendable: boolean): CommandInfo {
  return { id, label, description, sendable }
}

export const KEEP_ALIVE_COMMAND = 820
/** How often the official app re-sent the keep-alive in practice. */
export const KEEP_ALIVE_INTERVAL_MS = 35_000

export const ACTIONS: CommandInfo[] = [
  entry(862, 'Sleep', 'Furby goes to sleep for several seconds', true),
  entry(863, 'Laugh', 'Furby laughs', true),
  entry(864, 'Burp', 'Furby burps', true),
  entry(865, 'Fart', 'Furby farts', true),
  entry(866, 'Purr', 'Furby purrs', true),
  entry(867, 'Sneeze', 'Furby does a long sneeze', true),
  entry(868, 'Sing', 'Furby sings', true),
  entry(869, 'Talk', 'Furby talks', true),
]

export const FOOD: CommandInfo[] = [
  entry(350, 'Food (plain)', 'Generic tasty food ("mmm, yum")', true),
  entry(352, 'Small tasty snack', 'Any small eatable tasty stuff (like a peanut)', true),
  entry(353, 'Big soft tasty snack', 'Any bigger soft eatable tasty stuff (like a banana)', true),
  entry(354, 'Tasty & suckable', 'Any suckable tasty stuff (like oysters, spaghetti)', true),
  entry(355, 'Tasty drink', 'Any drinkable tasty stuff', true),
  entry(356, 'Hard, not tasty', 'Any hard eatable but not tasty stuff (like a chicken bone)', true),
  entry(358, 'Small, not tasty', 'Any small not-tasty stuff (like pepperoni)', true),
  entry(359, 'Big soft, not tasty', 'Any bigger soft not-tasty stuff (like asparagus)', true),
  entry(360, 'Suckable, not tasty', 'Any suckable but not-tasty stuff', true),
  entry(372, 'Beans', 'Suckable tasty stuff (like beans) — "ooh!"', true),
  entry(417, 'Non-edible object', 'Toilet paper, pillow, etc.', true),
]

export const REQUESTS: CommandInfo[] = [
  entry(813, 'Ask personality', "Request Furby's current personality (starts the handshake)", true),
]

export const PERSONALITY_RESPONSES: CommandInfo[] = [
  entry(900, 'No personality yet', 'Furby has no personality developed yet', false),
  entry(901, 'Princess', "I'm a princess!", false),
  entry(902, 'Diva', "I'm a diva!", false),
  entry(903, 'Warrior', "I'm a warrior!", false),
  entry(904, 'Joker', "I'm a joker!", false),
  entry(905, 'Gossip Queen', "I'm a gossip queen!", false),
  entry(906, 'Snuggleby', 'Personality #906 [SNUGGLEBY]', false),
  entry(907, 'Sassby', 'Personality #907 [SASSBY]', false),
  entry(908, 'Scoffby', 'Personality #908 [SCOFFBY]', false),
  entry(909, 'Chuckleby', 'Personality #909 [CHUCKLEBY]', false),
  entry(910, 'Gassby', 'Personality #910 [GASSBY]', false),
  entry(911, 'Lateby', 'Personality #911 [LATEBY]', false),
]

export const EVENTS: CommandInfo[] = [
  entry(700, "I'm bored / sleepy", 'Sent when idle; reaction depends on personality', false),
  entry(701, 'Burp', 'Spontaneous burp event', false),
  entry(702, 'Chew-chew', 'Chewing event', false),
  entry(703, 'Tipped over', 'You touched my head/side, or turned me on my side', false),
  entry(704, 'Fart', 'Spontaneous fart event', false),
  entry(705, 'Woke up', 'Sent on wakeup, before the "Good morning" phrase', false),
  entry(710, 'Happy', 'Also sent when head or back is touched', false),
  entry(711, 'Cough', 'Coughing event', false),
  entry(712, 'Hungry', 'Me hungry! / Kah Ay-tay!', false),
  entry(713, 'Tummy touched', 'You touched my tummy', false),
  entry(716, 'Happy (touched)', 'You touched my side, back, or head', false),
  entry(717, 'Achoo', 'Sneeze event', false),
  entry(718, 'Yawn', "Going to sleep; sent automatically twice entering deep sleep", true),
  entry(719, 'Whisper', 'Whisper, whisper, he-he-he', false),
  entry(721, 'Handshake song A', 'Response to 706; as a command, sings that song', true),
  entry(722, 'Handshake song B', 'Response to 707; as a command, sings that song', true),
  entry(723, 'Handshake song C', 'Response to 708; as a command, sings that song', true),
  entry(724, 'Handshake song D', 'Response to 709; as a command, sings that song', true),
]

/**
 * Sendable commands whose effect is only vaguely documented ("!" in the
 * source but no real description, or a description with a "?"). Kept
 * separate from ACTIONS/FOOD so the UI can present them as exploratory
 * rather than implying a known result.
 */
export const EXPERIMENTAL: CommandInfo[] = [
  entry(718, 'Yawn', 'Documented as sendable; normally happens automatically before deep sleep', true),
  entry(721, 'Song A', 'Documented as sendable; normally Furby\'s response to event 706', true),
  entry(722, 'Song B', 'Documented as sendable; normally Furby\'s response to event 707', true),
  entry(723, 'Song C', 'Documented as sendable; normally Furby\'s response to event 708', true),
  entry(724, 'Song D', 'Documented as sendable; normally Furby\'s response to event 709', true),
  entry(830, 'Unknown (830)', 'Marked as working from the official app; effect undocumented', true),
  entry(832, 'Unknown (832)', 'Marked as working from the official app; effect undocumented', true),
  entry(880, 'Dislike motion', 'Motion reaction, generally negative/dislike', true),
  entry(882, 'Pleased purr', '"Ah ha me bee dey, nice good!" + purr', true),
  entry(887, 'Startled', '"Aaah" exclamation; changes eyes to "burning" in warrior mode', true),
  entry(889, 'Ahh-tahoo', 'Motion + sings "ahh-tahoo"', true),
]

export function isPersonalityResponse(id: number): boolean {
  return id >= 900 && id <= 911
}

export const ALL_KNOWN_COMMANDS: CommandInfo[] = [
  ...REQUESTS,
  entry(KEEP_ALIVE_COMMAND, 'Keep-alive / listen mode', 'Puts Furby in app-listening mode for ~60s; responds with current personality (90x)', true),
  ...ACTIONS,
  ...FOOD,
  ...EVENTS,
  ...EXPERIMENTAL,
  ...PERSONALITY_RESPONSES,
]

const BY_ID = new Map(ALL_KNOWN_COMMANDS.map((c) => [c.id, c]))

/**
 * Looks up a command's meaning: the curated table first, falling back to the
 * Furbish phrasebook — mirroring how Furby::Command::description() itself
 * falls back to Furby::Command::Dictionary in the original Perl.
 */
export function describeCommand(id: number): CommandInfo | undefined {
  const known = BY_ID.get(id)
  if (known) return known

  const phrase = lookupPhrase(id)
  if (phrase) return entry(id, phrase.english, phrase.furbish, false)

  return undefined
}
