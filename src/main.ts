import images from './img/*.png';

class Character {
  name: string;
  details?: string;
  evil?: boolean;
}

class ScriptData {
  title: string;
  characters: Character[];
}

const tokenNames = new Set([
  "THIS IS THE DEMON",
  "THESE ARE YOUR MINIONS",
  "THESE CHARACTERS ARE NOT IN PLAY",
  "YOU ARE",
  "THIS CHARACTER SELECTED YOU",
  "THIS PLAYER IS",
]);

function iconPath(character: Character): string {
  const iconName = character.name.toLowerCase().replace(" ", "")
  return images[iconName];
}

function alignment(character: Character): "good" | "evil" {
  if (character.evil) {
    return "evil";
  }
  return "good";
}

function setScriptTitle(title: string) {
  document.title = `${title} night sheet`;
  var titleElement = document.getElementById("title");
  if (titleElement) {
    titleElement.innerText = title;
  }
}

function setCharacterList(characters: Character[]) {
  var charList = document.getElementById("list");
  for (var character of characters) {
    const align = alignment(character);
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
      var details = character.details;
      details = details.replace("\n", "<br/>");
      for (const tokenName of tokenNames) {
        details = details.replace(tokenName, '<strong>$&</strong>');
      }
      charHTML += `<div class="directions">${details}</div>`;
    }
    charHTML += `</div>`;
    charList?.insertAdjacentHTML("beforeend", charHTML);
  }
}

export function loadScript(data: ScriptData) {
  setScriptTitle(data.title);
  setCharacterList(data.characters);
}

// Embedded data for Laissez un Carnaval - imagine this came from a JSON file.


const script: ScriptData = {
  title: "Laissez un Carnaval",
  characters: [{
    name: "Philosopher",
  },
  {
    name: "Poppy Grower",
    details: "If there is a Poppy Grower, skip Minion Info and Demon Info.",
  },
  {
    name: "Minion Info",
    details: `If there are 7 or more players, wake all Minions.
    Show the THIS IS THE DEMON token. Point to the Demon.`,
    evil: true,
  },
  {
    name: "Lunatic",
    details: "Do lots of stuff",
  },
  {
    name: "Demon Info",
    details: `If there are 7 or more players, wake the Demon.
    Show the THESE ARE YOUR MINIONS token. Point to all Minions.
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
  ],
};
loadScript(script);
