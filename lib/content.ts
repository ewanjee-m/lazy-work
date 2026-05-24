import introNote from '@/content/intro-note.md';
import bio from '@/content/bio.md';
import persona from '@/content/persona.md';
import qaData from '@/content/qa.json';

export type QAEntry = {
  q: string;
  a: string;
  tags?: string[];
};

const qa = qaData as QAEntry[];

if (!introNote || introNote.trim().length === 0) {
  throw new Error('content/intro-note.md is empty');
}
if (!bio || bio.trim().length === 0) {
  throw new Error('content/bio.md is empty');
}
if (!persona || persona.trim().length === 0) {
  throw new Error('content/persona.md is empty');
}
if (!Array.isArray(qa) || qa.length === 0) {
  throw new Error('content/qa.json must be a non-empty array');
}

export const content = { introNote, bio, persona, qa };
