import "../icons";
import { Page, pageUrl } from "../routing";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";
import React, { PropsWithChildren } from "react";

function filename(path: string): string {
  let filename = path;
  let i = filename.lastIndexOf("/");
  if (i >= 0) {
    filename = filename.substring(i + 1);
  }
  i = filename.lastIndexOf("#");
  if (i >= 0) {
    filename = filename.substring(0, i);
  }
  return filename;
}

function PageLink(
  props: PropsWithChildren<{ currentPage: string; id: number; page: Page }>
): JSX.Element {
  const { currentPage, id, page } = props;
  const current = currentPage == page || currentPage == page + ".html";
  return (
    <a
      className={classnames("nav-item", { current })}
      href={pageUrl(page, id.toString())}
    >
      {props.children}
    </a>
  );
}

export function Nav(props: { scriptId: number }): JSX.Element {
  const id = props.scriptId;

  const currentPage = filename(window.location.pathname);

  return (
    <div id="nav">
      <div className="nav-header">
        <a className="nav-item" href="./">
          <FontAwesomeIcon icon="house" />
          &nbsp; Scripts
        </a>
        <PageLink currentPage={currentPage} id={id} page="roles">
          <FontAwesomeIcon icon="list" />
          &nbsp; Roles
        </PageLink>
        <PageLink currentPage={currentPage} id={id} page="nightsheet">
          <FontAwesomeIcon icon="moon" />
          &nbsp; Night
        </PageLink>
        <PageLink currentPage={currentPage} id={id} page="randomize">
          <FontAwesomeIcon icon="dice" />
          &nbsp; Assign{" "}
        </PageLink>
      </div>
    </div>
  );
}
