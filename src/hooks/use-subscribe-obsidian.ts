import {
  OBSIDIAN_ORIGIN,
  ObsidianActionResponse,
  ObsidianActionType,
  isMessageEventFromObsidian,
  obsidianActionSchema,
} from "@/utils/obsidian";
import { useEffect } from "react";

type ResponseWithoutType = Omit<ObsidianActionResponse, "action">;

/**
 * Subscribe to an action called from Obsidian.
 * @param actionType The action type to subscribe to
 * @param callback The callback to call when the action is received
 */
export function useSubscribeObsidian(
  actionType: ObsidianActionType,
  callback: (
    eventData: unknown,
  ) => Promise<ResponseWithoutType> | ResponseWithoutType,
) {
  useEffect(() => {
    const listener = async (event: MessageEvent) => {
      if (!isMessageEventFromObsidian(event)) {
        return;
      }

      const parsed = obsidianActionSchema.safeParse(event.data);
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

      // We don't want to handle actions that are not the one we're looking for
      const data = parsed.data;
      if (!(data.action === actionType)) {
        return;
      }

      const response = await callback(data.data);
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
