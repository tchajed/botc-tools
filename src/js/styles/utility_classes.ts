import { css } from "@emotion/react";

export const UtilityStyles = css`
  // visually hide accessibility labels
  .visuallyhidden {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
  }

  .bold {
    font-weight: bold;
  }

  .hidden {
    display: none;
  }
`;
