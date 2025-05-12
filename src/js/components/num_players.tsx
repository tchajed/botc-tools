import "../icons";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Distribution,
  distributionForCount,
  zeroDistribution,
} from "botc/setup";
import { Button } from "randomizer/components/button";
import { SetStateAction } from "react";
import React from "react";

export function Distr({ dist }: { dist: Distribution }): React.JSX.Element {
  const Num = styled.span`
    // make each number fixed-width
    display: inline-block;
    min-width: 1rem;
    text-align: center;
  `;
  return (
    <span>
      <Num className="good">{dist.townsfolk}</Num>/
      <Num className="good">{dist.outsider}</Num>/
      <Num className="evil">{dist.minion}</Num>/
      <Num className="evil">{dist.demon}</Num>
    </span>
  );
}

function BaseDistr({ numPlayers }: { numPlayers: number }): React.JSX.Element {
  const dist =
    5 <= numPlayers && numPlayers <= 15
      ? distributionForCount(numPlayers)
      : zeroDistribution();
  return <Distr dist={dist} />;
}

const NumPlayerBtn = styled(Button)`
  padding: 0;
  width: 2rem;
  line-height: 2rem;
  font-size: 100%;
  margin-bottom: 2px;
`;

export function NumPlayerSelector(props: {
  numPlayers: number;
  setNumPlayers: React.Dispatch<SetStateAction<number>>;
  teenysville: boolean;
}): React.JSX.Element {
  const { numPlayers } = props;
  function handleIncDec(delta: number): () => void {
    return () => {
      props.setNumPlayers((n) => n + delta);
    };
  }

  const maxPlayers = props.teenysville ? 6 : 15;

  return (
    <div
      css={css`
        font-size: 120%;
      `}
    >
      <label htmlFor="minus-player-btn" className="visuallyhidden">
        subtract one player
      </label>
      <NumPlayerBtn
        id="minus-player-btn"
        title="subtract one player"
        disabled={numPlayers <= 5}
        onClick={handleIncDec(-1)}
      >
        <FontAwesomeIcon icon="minus" />
      </NumPlayerBtn>
      <span
        css={css`
          padding: 0 0.5rem;
          line-height: 1.5em;
          text-align: right;
          vertical-align: middle;
          margin: 2px;
        `}
      >
        <span
          css={css`
            display: inline-block;
            min-width: 1.3rem;
            margin-right: 0.5rem;
          `}
        >
          {numPlayers}
        </span>
        players
      </span>
      <label htmlFor="plus-player-btn" className="visuallyhidden">
        add one player
      </label>
      <NumPlayerBtn
        id="plus-player-btn"
        title="add one player"
        disabled={numPlayers >= maxPlayers}
        onClick={handleIncDec(+1)}
      >
        <FontAwesomeIcon icon="plus" />
      </NumPlayerBtn>
      <div>
        <BaseDistr numPlayers={numPlayers} />
      </div>
    </div>
  );
}
