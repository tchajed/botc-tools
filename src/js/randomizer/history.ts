import { Ranking } from "./ranking";
import { SelAction } from "./selection";
import { ScriptState } from "./state";
import { Dispatch, SetStateAction } from "react";

const MAX_SIZE = 20;

export interface History<T> {
  back: T[];
  forward: T[];
}

// these actions don't produce any new states, they only interact with the
// history
type PureHistoryAction<T> =
  | { type: "push"; state: T }
  | { type: "replace"; state: T };

export type HistoryAction<T> =
  | PureHistoryAction<T>
  | { type: "pop" }
  | { type: "forward" };

function historyPush<T>(h: History<T>, s: T): History<T> {
  const newBack = [...h.back];
  newBack.push(s);
  while (newBack.length > MAX_SIZE) {
    newBack.shift();
  }
  return { back: newBack, forward: [] };
}

function historyReplace<T>(h: History<T>, s: T): History<T> {
  const newBack = [...h.back];
  newBack.pop(); // throw away current state
  newBack.push(s);
  return { back: newBack, forward: [...h.forward] };
}

function historyPop<T>(h: History<T>): { h: History<T>; state?: T } {
  const newH = { back: [...h.back], forward: [...h.forward] };
  const s = newH.back.pop();
  if (s === undefined) {
    return { h };
  }
  newH.forward.unshift(s);
  // get the new state (if we have one)
  if (newH.back.length > 0) {
    return { h: newH, state: newH.back[newH.back.length - 1] };
  }
  return { h: newH };
}

function historyForward<T>(h: History<T>): { h: History<T>; state?: T } {
  const newH = { back: [...h.back], forward: [...h.forward] };
  const s = newH.forward.shift();
  if (s === undefined) {
    return { h };
  }
  newH.back.push(s);
  // the top of the back list is s, so return that
  return { h: newH, state: s };
}

function historyStep<T>(
  h: History<T>,
  a: HistoryAction<T>,
): { h: History<T>; state?: T } {
  switch (a.type) {
    case "push":
      window.history.pushState(a.state, "");
      return { h: historyPush(h, a.state) };
    case "replace":
      window.history.replaceState(a.state, "");
      return { h: historyReplace(h, a.state) };
    case "pop": {
      return historyPop(h);
    }
    case "forward": {
      return historyForward(h);
    }
  }
}

export type SetHistory = Dispatch<
  SetStateAction<History<Partial<ScriptState>>>
>;

export function pureHistoryApply<T>(
  setHistory: Dispatch<SetStateAction<History<Partial<T>>>>,
  a: PureHistoryAction<Partial<T>>,
) {
  setHistory((h) => historyStep(h, a).h);
}

export function restoreState(
  setRanking: (r: Ranking) => void,
  selectionDispatch: (a: SelAction) => void,
  bluffsDispatch: (a: SelAction) => void,
  state: Partial<ScriptState>,
) {
  if (state.ranking) {
    setRanking(state.ranking);
  }
  if (state.selection) {
    selectionDispatch({ type: "set all", ids: state.selection });
  }
  if (state.bluffs) {
    bluffsDispatch({ type: "set all", ids: state.bluffs });
  }
}

export function historyApply(
  setRanking: (r: Ranking) => void,
  selectionDispatch: (a: SelAction) => void,
  bluffsDispatch: (a: SelAction) => void,
  h: History<Partial<ScriptState>>,
  setHistory: SetHistory,
  a: HistoryAction<Partial<ScriptState>>,
) {
  const { h: newH, state } = historyStep(h, a);
  if (state) {
    restoreState(setRanking, selectionDispatch, bluffsDispatch, state);
  }
  setHistory(newH);
}
