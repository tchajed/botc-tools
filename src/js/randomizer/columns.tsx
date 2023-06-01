import React, { ReactNode, Children } from "react";

function splitColumns<T>(xs: T[], numColumns: number): T[][] {
  const numPerColumn = Math.ceil(xs.length / numColumns);
  var columns: T[][] = [];
  while (xs.length > 0) {
    let col = xs.splice(0, numPerColumn);
    columns.push(col);
  }
  return columns;
}

export function Columns(props: { numColumns: number, children: ReactNode[] }): JSX.Element {
  const cols = splitColumns(Children.toArray(props.children), props.numColumns);
  return <>
    {cols.map((col, i) =>
      <div className="column" key={i}>
        {col}
      </div>
    )}
  </>;
}
