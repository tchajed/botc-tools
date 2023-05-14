import images from '../assets/img/*.png';

import h from 'hyperscript';

export function iconPath(id: string): string {
  return images[`Icon_${id}`];
}

export function htmlToElements(html: string): ChildNode[] {
  var template = document.createElement('template');
  html = html.trimStart(); // Avoid creating a whitespace node
  template.innerHTML = html;
  return Array.from(template.content.childNodes);
}

export function characterIconElement(character: { id: string }): HTMLElement[] {
  if (!iconPath(character.id)) {
    return [];
  }
  return [h("div.img-container",
    h("img.char-icon", { src: iconPath(character.id) })
  )];
}
