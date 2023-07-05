import styled from "@emotion/styled";

const FullscreenModal = styled.div`
  position: fixed;
  // needs to go on top of nav
  z-index: 1001;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: white;
  overflow: hidden;
  text-align: center;
  font-size: 250%;
`;

const FullscreenContents = styled.div`
  position: relative;
  // center within fullscreen
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

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
    return <div className="hidden"></div>;
  }

  function handleClick() {
    props.setData(null);
  }

  return (
    <FullscreenModal onClick={handleClick}>
      <FullscreenContents>{props.render(props.data)}</FullscreenContents>
    </FullscreenModal>
  );
}
