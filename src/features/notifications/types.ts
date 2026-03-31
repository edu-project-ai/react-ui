// Discriminated union for typed notification payloads received from the server
// via SignalR. The `Record<string, unknown>` arm provides forward compatibility
// for server-sent types not yet modelled client-side — without resorting to `any`.
export type NotificationPayload =
  | { type: "roadmap_ready"; roadmapId: string }
  | { type: "roadmap_progress"; correlationId: string; status: string }
  | { type: "error"; message: string }
  | Record<string, unknown>;
