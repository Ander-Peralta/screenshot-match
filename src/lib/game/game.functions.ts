import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  claimGuest,
  getOrCreateDaily,
  getOrCreatePractice,
  getStats,
  listConceptsPublic,
  makeGuess,
  resolveOwner,
  takeHint,
} from "./game.server";

const guest = z.string().uuid().nullable().optional();

export const listConcepts = createServerFn({ method: "GET" }).handler(async () => listConceptsPublic());

export const startDaily = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ guestId: guest }).parse(d))
  .handler(async ({ data }) => getOrCreateDaily(await resolveOwner(data.guestId)));

export const startPractice = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ guestId: guest, fresh: z.boolean() }).parse(d))
  .handler(async ({ data }) => getOrCreatePractice(await resolveOwner(data.guestId), data.fresh));

export const submitGuess = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ guestId: guest, gameId: z.string().uuid(), conceptId: z.string().min(1).max(80).regex(/^[a-z0-9_]+$/) }).parse(d),
  )
  .handler(async ({ data }) => makeGuess(await resolveOwner(data.guestId), data.gameId, data.conceptId));

export const requestHint = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ guestId: guest, gameId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => takeHint(await resolveOwner(data.guestId), data.gameId));

export const fetchStats = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ guestId: guest }).parse(d))
  .handler(async ({ data }) => getStats(await resolveOwner(data.guestId)));

export const claimGuestProgress = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ guestId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const o = await resolveOwner(null).catch(() => null);
    if (!o?.userId) throw new Error("Inicia sesión primero.");
    return { moved: await claimGuest(o.userId, data.guestId) };
  });
