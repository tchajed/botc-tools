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
  return <a className={classnames("nav-item", { current: currentPage == page + ".html" })} href={`./${page}.html#${id}`}>
    {props.children}
  </a>
}

export function Nav(props: { scriptId: number }): JSX.Element {
  const id = props.scriptId;

  const currentPage = filename(window.location.pathname);

  return <div id="nav">
    <div className="nav-header">
      <a className="nav-item" href="./"><FontAwesomeIcon icon="house" />&nbsp; Scripts</a>
      <PageLink currentPage={currentPage} id={id} page="roles"><FontAwesomeIcon icon="list" />&nbsp; Roles</PageLink>
      <PageLink currentPage={currentPage} id={id} page="nightsheet"><FontAwesomeIcon icon="moon" />&nbsp; Night</PageLink>
      <PageLink currentPage={currentPage} id={id} page="randomize"><FontAwesomeIcon icon="dice" />&nbsp; Assign </PageLink>
    </div>
  </div>;
}
