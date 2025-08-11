import { css } from "@emotion/react";
import React from "react";
import { theme } from "theme";

/**
 * Maximum number of messages to queue in the message bar.
 * If there are more messages, the earliest messages will be dropped in favor of the latest ones.
 */
const MAX_MESSAGES = 3;

const messageBarBaseStyle = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: center;

  // Same position setting as Nav
  position: sticky;

  // This should be lower than the Nav's z-index so this can hide beneath
  z-index: 500;

  background-color: ${theme.color.messageBar};
  box-shadow: 0px 3px 3px 0 ${theme.color.messageBar};
  color: white;
  text-align: center;

  height: 1.5em;
  text-overflow: ellipsis;

  @media print {
    display: none;
  }
`;

/**
 * Slide into view when a message is displayed
 */
const messageBarVisibleStyle = css`
  translate: 0 0;
  transition: translate 1000ms;
`;

/**
 * Slide back out of view after displaying the message
 */
const messageBarInvisibleStyle = css`
  translate: 0 -100%;
  transition: translate 1000ms;
`;

export interface MessageBarHandle {
  /**
   * Call this function to display a message for a few seconds at the top of the page.
   *
   * @param message The message you want to display in the message bar
   */
  sendMessage: (message: string) => void;
}

/**
 * Nest components within this context so they can access the MessageBar.
 *
 * From within any component, you can call `useContext()` on this to access the `sendMessage()` function.
 */
export const MessageBarHandleContext =
  React.createContext<React.RefObject<MessageBarHandle | null> | null>(null);

type BarState = {
  shouldShow: boolean;
  isSliding: boolean;
  messages: string[];
};

type BarAction =
  | {
      type: "add_message";
      message: string;
    }
  | {
      type: "mark_slide_start";
    }
  | {
      type: "mark_slide_end";
    }
  | {
      type: "mark_slide_cancel";
    };

function barReducer(state: BarState, action: BarAction): BarState {
  const nextState = { ...state };
  const { shouldShow, isSliding, messages } = state;
  switch (action.type) {
    case "add_message":
      // Save the most recent messages
      nextState.messages = messages.slice(-MAX_MESSAGES + 1);
      nextState.messages.push(action.message);

      // If the bar is hidden and motionless, wake it up
      nextState.shouldShow = shouldShow || !isSliding;
      break;
    case "mark_slide_start":
      // Mark that the bar is sliding
      nextState.isSliding = true;
      break;
    case "mark_slide_end":
      nextState.isSliding = false;
      if (shouldShow) {
        // We finished sliding in, so set the state to start sliding out again
        nextState.shouldShow = false;
      } else {
        // We finished sliding out

        // Clear the message that we just finished displaying
        nextState.messages = messages.slice(1);

        if (messages.length > 1) {
          // There's another message to display, so trigger the bar to display the next message
          nextState.shouldShow = true;
        }
      }
      break;
    case "mark_slide_cancel":
      // Reset the bar to avoid getting in a broken state
      nextState.isSliding = false;
      nextState.shouldShow = false;
      break;
  }
  return nextState;
}

/**
 * Hides below the Nav component and displays messages when the user takes actions.
 */
export function MessageBar({
  ref,
}: {
  ref: React.Ref<MessageBarHandle>;
}): React.JSX.Element {
  const [{ messages, shouldShow }, barDispatch] = React.useReducer(barReducer, {
    shouldShow: false,
    isSliding: false,
    messages: [],
  });

  React.useImperativeHandle(
    ref,
    () => ({
      sendMessage(message: string): void {
        barDispatch({ type: "add_message", message });
      },
    }),
    [],
  );

  const cssStyles = [
    messageBarBaseStyle,
    shouldShow ? messageBarVisibleStyle : messageBarInvisibleStyle,
  ];

  return (
    <div
      ref={(node) => {
        if (!node) {
          return;
        }

        /**
         * Fires when the message bar starts sliding in or out
         */
        const onSlideStart = (ev: TransitionEvent) => {
          // Make sure this event corresponds to sliding
          if (ev.propertyName !== "translate") {
            return;
          }

          barDispatch({ type: "mark_slide_start" });
        };

        /**
         * Fires when the message bar finishes sliding in or out
         */
        const onSlideEnd = (ev: TransitionEvent) => {
          // Make sure this event corresponds to sliding
          if (ev.propertyName !== "translate") {
            return;
          }

          barDispatch({ type: "mark_slide_end" });
        };

        /**
         * Fires when the message bar slide is canceled, such as by sending a message while the bar is visible
         */
        const onSlideCancel = (ev: TransitionEvent) => {
          // Make sure this event corresponds to sliding
          if (ev.propertyName !== "translate") {
            return;
          }

          barDispatch({ type: "mark_slide_cancel" });
        };

        node.addEventListener("transitionstart", onSlideStart);
        node.addEventListener("transitionend", onSlideEnd);
        node.addEventListener("transitioncancel", onSlideCancel);
        return function cleanupAnimationListeners() {
          node.removeEventListener("transitioncancel", onSlideCancel);
          node.removeEventListener("transitionend", onSlideEnd);
          node.removeEventListener("transitionstart", onSlideStart);
        };
      }}
      css={cssStyles}
    >
      {messages[0]}
    </div>
  );
}
