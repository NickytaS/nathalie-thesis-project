import { describe, expect, it } from 'vitest';
import { emptyScores, maxQuizScores, pickWinner, questions } from './thesis';

describe('maxQuizScores', () => {
  it('sums per-tool maxima across all questions', () => {
    const max = maxQuizScores();
    let manual = emptyScores();
    for (const q of questions) {
      manual.pgloader += Math.max(...q.options.map((o) => o.scores.pgloader));
      manual.mrm += Math.max(...q.options.map((o) => o.scores.mrm));
      manual.mongify += Math.max(...q.options.map((o) => o.scores.mongify));
    }
    expect(max).toEqual(manual);
  });

  it('has strictly positive caps for each tool', () => {
    const max = maxQuizScores();
    expect(max.pgloader).toBeGreaterThan(0);
    expect(max.mrm).toBeGreaterThan(0);
    expect(max.mongify).toBeGreaterThan(0);
  });
});

describe('pickWinner', () => {
  it('defaults to pgloader when all scores are zero', () => {
    expect(pickWinner(emptyScores())).toBe('pgloader');
  });

  it('picks mongify when it strictly leads', () => {
    expect(pickWinner({ pgloader: 2, mrm: 2, mongify: 10 })).toBe('mongify');
  });

  it('picks mrm when it leads and beats mongify tie-break vs pgloader', () => {
    expect(pickWinner({ pgloader: 1, mrm: 8, mongify: 2 })).toBe('mrm');
  });

  it('picks pgloader when pgloader leads over both others', () => {
    expect(pickWinner({ pgloader: 20, mrm: 5, mongify: 5 })).toBe('pgloader');
  });

  it('when pgloader and mrm tie for the lead, keeps pgloader as default', () => {
    expect(pickWinner({ pgloader: 5, mrm: 5, mongify: 2 })).toBe('pgloader');
  });

  it('prefers mongify over pgloader when both beat mrm', () => {
    expect(pickWinner({ pgloader: 3, mrm: 1, mongify: 4 })).toBe('mongify');
  });
});
