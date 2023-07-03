import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { darken } from "polished";

const style = css`
  text-transform: none;
  border-style: none;
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
  border: 2px solid ${darken(0.18, "white")};

  font-size: 120%;
  text-align: center;
  vertical-align: middle;

  &:hover {
    cursor: pointer;
  }

  &:disabled {
    cursor: default;
    opacity: 50%;
  }
`;

export const Button = styled.button<{
  backgroundColor?: string;
  color?: string;
}>(style, (props) => {
  const bg = props.backgroundColor || darken(0.1, "white");
  return css`
    color: ${props.color || "black"};
    background-color: ${bg};
    &:hover {
      @media (hover: hover) {
        background-color: ${darken(0.1, bg)};
      }
    }
    &:disabled {
      opacity: 60%;
      &:hover {
        background-color: ${bg};
      }
    }
  `;
});
