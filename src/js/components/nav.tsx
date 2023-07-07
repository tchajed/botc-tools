import "../icons";
import { Page, pageUrl, saveScroll } from "../routing";
import { Global, Theme, css, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";
import { lighten } from "polished";
import React, { PropsWithChildren } from "react";

const NavItem = styled.a`
  display: flex;
  border: 1px solid #aaa;
  padding: 0.5rem;
  border-radius: 0.3rem;

  &,
  &:visited {
    color: white;
    &.current {
      border-bottom: 0.2rem solid ${(props) => props.theme.color.secondary};
      // box-shadow: 0 0 10px 5px rgb(255, 235, 122);
    }
  }

  &:hover {
    text-decoration: none;
    @media (hover: hover) {
      border-color: rgb(0, 170, 255);
      background-color: ${(props) => lighten(0.2, props.theme.color.primary)};
    }
  }
`;

function PageLink(
  props: PropsWithChildren<{
    currentPage: string;
    id: number;
    page: Page;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  }>,
): JSX.Element {
  const { currentPage, id, page } = props;
  const current = currentPage == page;
  return (
    <NavItem
      className={classnames({ current })}
      href={pageUrl(page, id.toString())}
      onClick={props.onClick}
    >
      {props.children}
    </NavItem>
  );
}

const navStyle = (theme: Theme) => css`
  background-color: ${theme.color.primary};
  padding: 1rem 5px;
  margin: 0 0 1rem 0;
  box-shadow: 0px 3px 3px 0 ${theme.color.primary};

  position: sticky;
  top: 0;
  // make sure sticky bar covers everything
  z-index: 1000;

  @media print {
    display: none;
  }
`;

const navHeaderStyle = css`
  max-width: 550px;
  margin: 0 auto;
  padding: 0;
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  align-items: center;
  list-style: none;
`;

const TabStyles = css`
  .not-visible {
    display: none;
  }

  // TODO: need some trick for removing from the document flow

  // .visible {
  //   visibility: visible;
  //   opacity: 1;
  //   transition: opacity 2s linear;
  // }
  //
  // .not-visible {
  //   visibility: hidden;
  //   opacity: 0;
  //   transition: visibility 0s 2s, opacity 2s linear;
  // }
`;

export function Nav(props: {
  currentPage: Page;
  setCurrentPage: (p: Page) => void;
  scriptId: number;
}): JSX.Element {
  const theme = useTheme();
  const id = props.scriptId;
  const currentPage = props.currentPage;

  function createOnClick(
    dest: Page,
  ): React.MouseEventHandler<HTMLAnchorElement> {
    const newUrl = new URL(
      `${window.location.origin}/script.html?page=${dest}&id=${id}`,
    );
    return (e) => {
      saveScroll(currentPage);
      props.setCurrentPage(dest);
      window.history.pushState(null, "", newUrl);
      e.preventDefault();
    };
  }

  return (
    <div id="nav" css={[navStyle(theme)]}>
      <Global styles={TabStyles} />
      <div css={navHeaderStyle}>
        <NavItem href="./">
          <FontAwesomeIcon icon="house" css={{ fontSize: "110%" }} />
          &nbsp; Scripts
        </NavItem>
        <PageLink
          currentPage={currentPage}
          id={id}
          page="roles"
          onClick={createOnClick("roles")}
        >
          <FontAwesomeIcon icon="list" />
          &nbsp; Roles
        </PageLink>
        <PageLink
          currentPage={currentPage}
          id={id}
          page="night"
          onClick={createOnClick("night")}
        >
          <FontAwesomeIcon icon="moon" />
          &nbsp; Night
        </PageLink>
        <PageLink
          currentPage={currentPage}
          id={id}
          page="assign"
          onClick={createOnClick("assign")}
        >
          <FontAwesomeIcon icon="dice" />
          &nbsp; Assign{" "}
        </PageLink>
      </div>
    </div>
  );
}
