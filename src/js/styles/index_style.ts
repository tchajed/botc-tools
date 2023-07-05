import { css } from "@emotion/react";

// These styles need to override the global styles
export const IndexStyles = css`
  h2 {
    margin-top: 0;
    margin-bottom: 1rem;
  }

  a,
  a:visited {
    color: rgb(16, 93, 216);
  }

  ul.help {
    margin: 0;
    margin-top: 3rem;

    li:not(:last-child) {
      padding-bottom: 1rem;
    }
  }
`;
