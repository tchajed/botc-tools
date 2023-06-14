import React from "react";

/**
 * A component for showing fullscreen modals that are dismissed on click.
 *
 * This is written as a higher-order component using a render method, which
 * doesn't seem like the right approach.
 *
 * TODO: come up with a better API.
 */
export function Fullscreen<T>(props: {
  data: T | null;
  setData: (r: null) => void;
  render: (x: T) => JSX.Element;
}): JSX.Element {
  if (props.data == null) {
    return <div className="fullscreen hidden"></div>;
  }

  function handleClick() {
    props.setData(null);
  }

  return (
    <div className="fullscreen" onClick={handleClick}>
      <div className="contents">{props.render(props.data)}</div>
    </div>
  );
}
