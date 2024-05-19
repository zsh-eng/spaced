import {
  OBSIDIAN_ORIGIN,
  ObsidianActionRequest,
  ObsidianActionResponse,
  ObsidianAction,
  isMessageEventFromObsidian,
  obsidianActionRequestSchema,
} from "@/utils/obsidian";
import { useEffect } from "react";

type ResponseWithoutType = Omit<ObsidianActionResponse, "action">;

/**
 * Subscribe to an action called from Obsidian.
 * @param actionType The action type to subscribe to
 * @param callback The callback to call when the action is received
 */
export function useSubscribeObsidian<TActionKey extends ObsidianAction>(
  actionType: TActionKey,
  callback: (
    eventData: Extract<ObsidianActionRequest, { action: TActionKey }>["data"],
  ) => Promise<ResponseWithoutType> | ResponseWithoutType,
) {
  useEffect(() => {
    const listener = async (event: MessageEvent) => {
      if (!isMessageEventFromObsidian(event)) {
        return;
      }

      if (event.data?.action !== actionType) {
        return;
      }

      const parsed = obsidianActionRequestSchema.safeParse(event.data);
      if (!parsed.success) {
        const errorResponse = {
          success: false,
          data: parsed.error,
          action: actionType,
        };
        event.source.postMessage(errorResponse, {
          targetOrigin: OBSIDIAN_ORIGIN,
        });
        return;
      }

      const data = parsed.data.data;
      // @ts-expect-error We know that the action is the one we're looking for
      const response = await callback(data);
      const responseWithType = { ...response, action: actionType };
      event.source.postMessage(responseWithType, {
        targetOrigin: OBSIDIAN_ORIGIN,
      });
    };

    window.addEventListener("message", listener);
    return () => {
      window.removeEventListener("message", listener);
    };
  }, [actionType, callback]);
}
