"use client";

import { useSyncExternalStore } from "react";
import {
  getSessionUserId,
  loadState,
  setSessionUserId,
  subscribe,
} from "./store";
import type { Role, User } from "./types";
import { ROLE_HOME } from "./types";

function serverUserId() {
  return null;
}

export function useSoilLoop() {
  const state = useSyncExternalStore(subscribe, loadState, loadState);
  const userId = useSyncExternalStore(subscribe, getSessionUserId, serverUserId);
  const user = state.users.find((u) => u.user_id === userId) ?? null;
  const block = state.blocks.find((b) => b.block_id === user?.block_id);
  const bin = state.bins.find((b) => b.block_id === user?.block_id);

  return { state, user, block, bin };
}

export function loginAs(user: User) {
  setSessionUserId(user.user_id);
  return ROLE_HOME[user.role];
}

export function loginWith(email: string, password: string) {
  const state = loadState();
  const user = state.users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  );
  if (!user) return null;
  return { href: loginAs(user), user };
}

export function logout() {
  setSessionUserId(null);
}

export function homeFor(role: Role) {
  return ROLE_HOME[role];
}
