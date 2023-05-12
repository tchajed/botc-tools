import images from './img/*.png';

class Character {
  name: string;
  details?: string;
  evil?: boolean;
}

const characters: Character[] = [
  {
    name: "Philosopher",
  },
  {
    name: "Poppy Grower",
    details: "If there is a Poppy Grower, skip Minion Info and Demon Info.",
  },
  {
    name: "Minion Info",
    details: `If there are 7 or more players, wake all Minions.
    Show the <strong>THIS IS THE DEMON</strong> token. Point to the Demon.`,
    evil: true,
  },
  {
    name: "Lunatic",
    details: "Do lots of stuff",
  },
  {
    name: "Demon Info",
    details: `If there are 7 or more players, wake the Demon.
    Show the <strong>THESE ARE YOUR MINIONS</strong> token. Point to all Minions.
    Show three bluffs.`,
    evil: true,
  },
  {
    name: "Amnesiac",
  },
  {
    name: "Poisoner",
    evil: true,
  },
];

function iconPath(character: Character): string {
  const iconName = character.name.toLowerCase().replace(" ", "")
  return images[iconName];
}

var charList = document.getElementById("list");
for (var character of characters) {
  var align = "good";
  if (character.evil == true) {
    align = "evil";
  }
  var charHTML = "";
  charHTML += `<div class="direction-line">`;
  if (iconPath(character)) {
    charHTML += `<div class="icon-container">
    <img class="char-icon" src=${iconPath(character)}>
    </div>`;
  } else {
    charHTML += `<div class="img-placeholder"></div>`;
  }
  charHTML += `<div class="char-name ${align}">${character.name}</div>`;
  if (character.details) {
    const details = character.details.replace("\n", "<br/>");
    charHTML += `<div class="directions">${details}</div>`;
  }
  charHTML += `</div>`;
  charList?.insertAdjacentHTML("beforeend", charHTML);
}
