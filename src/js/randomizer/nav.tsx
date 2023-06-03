import classnames from "classnames";
import React, { PropsWithChildren } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import '../icons';

function filename(path: string): string {
  var filename = path;
  var i = filename.lastIndexOf("/");
  if (i >= 0) {
    filename = filename.substring(i + 1);
  }
  i = filename.lastIndexOf("#");
  if (i >= 0) {
    filename = filename.substring(0, i);
  }
  return filename;
}

function PageLink(props: PropsWithChildren<{ currentPage: string, id: number, page: string }>): JSX.Element {
  const { currentPage, id, page } = props;
  return <li className={classnames("nav-item", { current: currentPage == page + ".html" })}>
    <a href={`./${page}.html#${id}`}>{props.children}</a>
  </li>
}

export function Nav(props: { scriptId: number }): JSX.Element {
  const id = props.scriptId;

  const currentPage = filename(window.location.pathname);

  return <div id="nav">
    <ul className="nav-header">
      <li className="nav-item"><a href="./"><FontAwesomeIcon icon="house" /> Scripts</a></li>
      <PageLink currentPage={currentPage} id={id} page="roles"><FontAwesomeIcon icon="list" />Roles</PageLink>
      <PageLink currentPage={currentPage} id={id} page="nightsheet"><FontAwesomeIcon icon="moon" />Night</PageLink>
      <PageLink currentPage={currentPage} id={id} page="randomize"><FontAwesomeIcon icon="dice" />Assign </PageLink>
    </ul>
  </div>;
}
