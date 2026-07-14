import Pusher from "pusher";

// Initialize Pusher server-side client
// Ensure env variables are checked before instantiating to avoid crashes if they're missing during dev

const globalForPusher = global as unknown as { pusherServer: Pusher | undefined };

export const pusherServer =
  globalForPusher.pusherServer ||
  new Pusher({
    appId: process.env.PUSHER_APP_ID || "",
    key: process.env.NEXT_PUBLIC_PUSHER_KEY || "",
    secret: process.env.PUSHER_SECRET || "",
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
    useTLS: true,
  });

if (process.env.NODE_ENV !== "production") globalForPusher.pusherServer = pusherServer;
