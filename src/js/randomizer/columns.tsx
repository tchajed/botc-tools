import styled from "@emotion/styled";
import { ReactNode, Children } from "react";

function splitColumns<T>(xs: T[], numColumns: number): T[][] {
  const numPerColumn = Math.ceil(xs.length / numColumns);
  const columns: T[][] = [];
  while (xs.length > 0) {
    const col = xs.splice(0, numPerColumn);
    columns.push(col);
  }
  return columns;
}

export const Column = styled.div`
  flex: 50%;

  &:not(:first-of-type div) {
    margin-left: 0.5rem;
  }
`;

export const ColumnContainer = styled.div`
  display: flex;
`;

export function Columns(props: {
  numColumns: number;
  children: ReactNode[];
}): JSX.Element {
  const cols = splitColumns(Children.toArray(props.children), props.numColumns);
  return (
    <ColumnContainer>
      {cols.map((col, i) => (
        <Column key={i}>{col}</Column>
      ))}
    </ColumnContainer>
  );
}
