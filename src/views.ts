import images from '../assets/img/*.png';

export function iconPath(id: string): string {
  return images[`Icon_${id}`];
}
