import { UtilityStyles } from "./utility_classes";
import { css } from "@emotion/react";

const ScrollPastEnd = css`
  @media screen {
    html {
      height: auto !important;
      padding-bottom: 300px !important;
    }
  }
`;

const ElementStyles = css`
  body {
    font-family: "Barlow", sans-serif;
    margin: 0;
    padding: 0;

    @media print {
      margin: 0;
    }
  }

  .main {
    position: relative;
    max-width: 550px;
    @media print {
      max-width: 7in;
    }
    margin: 1rem auto;
    padding: 5px;
  }

  a,
  a:visited {
    background-color: transparent;
    color: inherit;
    text-decoration: inherit;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  h1 {
    font-family: "Lobster", serif;
    font-size: 24pt;
    margin-top: 0;
    margin-bottom: 0.5rem;
    width: 100%;
  }

  table {
    border-spacing: 0 5px;
    width: 100%;
  }
`;

// taken from https://www.joshwcomeau.com/css/custom-css-reset/
const Reset = css`
  // more intuitive box-sizing model
  // TODO: requires global testing
  /*
  *, *::before, *::after {
    box-sizing: border-box;
  }
  */

  // remove default margin
  // TODO: requires global testing
  /*
  * {
    margin: 0;
  }
  */

  ul {
    padding: 0;
    margin: 0;
  }

  li {
    list-style-type: none;
  }

  body {
    // TODO: this makes some text look worse (it seems like labels should be
    // bolded), though it should be an overall improvement
    // -webkit-font-smoothing: antialiased;
  }

  input,
  button,
  textarea,
  select {
    font: inherit;
  }
`;

export const GlobalStyle = css`
  ${Reset}
  ${ScrollPastEnd}
  ${ElementStyles}
  ${UtilityStyles}
`;
