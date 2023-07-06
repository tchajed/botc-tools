import { css } from "@emotion/react";
import { theme } from "theme";

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

  td.icon-cell {
    padding-right: 10px;
  }

  td.ability-cell {
    @media print {
      font-size: 10pt;
    }
  }

  td.name-cell {
    font-family: "EB Garamond", "Barlow", serif;
    @media (min-width: 500px) {
      width: 7rem;
      padding-right: 1rem;
    }
  }

  tr.good .name-cell,
  span.good {
    color: ${theme.color.good};
  }

  tr.evil .name-cell,
  span.evil {
    color: ${theme.color.evil};
  }
`;
