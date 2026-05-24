export type Expression =
  | 'idle'
  | 'thinking'
  | 'talking'
  | 'smiling'
  | 'serious'
  | 'blank';

const SMILING_PATTERNS = [
  /😊|😄|🙂|☺️|ㅎㅎ|하하/,
  /재밌/,
  /좋아해/,
  /웃긴/,
  /신나/,
];

const SERIOUS_PATTERNS = [
  /진심/,
  /고민/,
  /사실은|사실 그/,
  /솔직히/,
  /오래(전부터|도록)/,
  /중요한/,
];

export function expressionFromText(text: string): Expression {
  if (!text) return 'idle';
  if (SERIOUS_PATTERNS.some((p) => p.test(text))) return 'serious';
  if (SMILING_PATTERNS.some((p) => p.test(text))) return 'smiling';
  return 'idle';
}
