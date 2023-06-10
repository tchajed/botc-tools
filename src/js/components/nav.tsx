import "../icons";
import { Page, pageUrl } from "../routing";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";
import React, { PropsWithChildren } from "react";

function PageLink(
  props: PropsWithChildren<{
    currentPage: string;
    id: number;
    page: Page;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  }>
): JSX.Element {
  const { currentPage, id, page } = props;
  const current = currentPage == page;
  return (
    <a
      className={classnames("nav-item", { current })}
      href={pageUrl(page, id.toString())}
      onClick={props.onClick}
    >
      {props.children}
    </a>
  );
}

export function Nav(props: {
  currentPage: Page;
  setCurrentPage: (Page) => void;
  scriptId: number;
}): JSX.Element {
  const id = props.scriptId;
  const currentPage = props.currentPage;

  function createOnClick(
    dest: Page
  ): React.MouseEventHandler<HTMLAnchorElement> {
    const newUrl = new URL(
      `${window.location.origin}/script.html?page=${dest}&id=${id}`
    );
    return (e) => {
      props.setCurrentPage(dest);
      window.history.pushState(null, "", newUrl);
      e.preventDefault();
    };
  }

  return (
    <div id="nav">
      <div className="nav-header">
        <a className="nav-item" href="./">
          <FontAwesomeIcon icon="house" />
          &nbsp; Scripts
        </a>
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
