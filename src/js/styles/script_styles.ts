import { css } from "@emotion/react";

export const ScriptStyles = css`
  h1 {
    // TODO: this is apparently an important difference between script.html and
    // index.html
    display: inline-block;
  }

  h2 {
    font-size: 120%;
    margin: 0.5rem 0;
  }

  .main {
    font-size: 13pt;

    @media print {
      font-size: 9pt;
    }
  }

  @media (max-width: 500px) {
    td {
      border-bottom: 1px dotted #bbb;
    }
  }
`;
