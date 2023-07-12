import { nightorder } from "./nightorder";
import { Override } from "./overrides";

export const aliceInWonderland: { [key: string]: Override } = {
  cheshirecat: {
    ability: `Each night, choose a player. You control what the Storyteller tells them until tomorrow night, then they die.`,
    firstNight: `The Cheshire Cat points to a player.`,
    homebrew: {
      name: "Cheshire Cat",
      roleType: "demon",
      firstNightIndex: nightorder.firstNight("Pukka"),
    },
  },
  whiterabbit: {
    ability:
      "Each night*, you learn each character type that was late to nominations today.",
    otherNights: "Give each character type that was late to nominations today.",
    homebrew: {
      name: "White Rabbit",
      roleType: "townsfolk",
      otherNightsIndex: nightorder.otherNights("Balloonist"),
    },
  },
  queenofhearts: {
    ability:
      "Once per game during the day, publicly choose a player. You learn their alignment, and if they are executed, you refresh this ability",
    homebrew: {
      name: "Queen of Hearts",
      roleType: "townsfolk",
      otherNightsIndex: nightorder.otherNights("Bounty Hunter"),
    },
  },
  lookingglass: {
    ability:
      "On your first night, choose odd or even. Amnesiac questions might receive false answers on those days.",
    homebrew: {
      name: "Looking Glass",
      roleType: "outsider",
      // most similar to Sweetheart
      firstNightIndex: nightorder.firstNight("Empath"),
    },
  },
  jabberwock: {
    ability: `Each night, choose a player and a statement to be mad about tomorrow, or they might be executed. The statement must rhyme.`,
    nights: `The Jabberwock points to a player and is told to give a rhyming statement. Tell the player they should be mad about the statement.`,
    homebrew: {
      name: "Jabberwock",
      roleType: "minion",
      firstNightIndex: nightorder.firstNight("Cerenovus"),
      otherNightsIndex: nightorder.otherNights("Cerenovus"),
    },
  },
  knaveofhearts: {
    ability:
      `Each night, choose two players. Their abilities are swapped tonight and tomorrow day.` +
      ` If you choose the Cheshire Cat and another Evil player, you may choose to swap permanently.`,
    homebrew: {
      name: "Knave of Hearts",
      roleType: "minion",
    },
  },
  tweedledum: {
    ability:
      "On your first night, choose a player. You receive each other’s Amnesiac answers (even if dead).",
    firstNight: "Tweedledum picks a player. Mark them swapped for answers.",
    homebrew: {
      name: "Tweedledum",
      roleType: "outsider",
      firstNightIndex: nightorder.firstNight("Butler"),
    },
  },
  dodo: {
    ability: `You do nothing. The Storyteller may tell you nonsense in the night or in response to your Amnesiac questions.`,
    nights: `Maybe give the Dodo nonsense`,
    homebrew: {
      name: "Dodo",
      roleType: "outsider",
      firstNightIndex: nightorder.firstNight("Empath"),
      otherNightsIndex: nightorder.otherNights("Undertaker"),
    },
  },
  cook: {
    ability:
      "Two opposing players start with DRINK ME and EAT ME. DRINK ME cannot talk publicly or raise their voice, and is immune to abilities and nominations until dusk. EAT ME must speak publicly and loudly, and has 101 votes until dusk.",
    firstNight: `Mark two opposing players DRINK ME and EAT ME. Wake them and tell them their restrictions.`,
    homebrew: {
      name: "Cook",
      roleType: "townsfolk",
      firstNightIndex: nightorder.firstNight("Chef"),
    },
  },
  playingcard: {
    ability:
      "Each night, pick a card. You have the corresponding Townsfolk ability until dusk. Clubs = TB, Diamonds = BMR, Hearts = S&V, Spades = Experimental.",
    nights:
      "The Playing Card picks a card. Give them the corresponding Townsfolk ability.",
    homebrew: {
      name: "Playing Card",
      roleType: "townsfolk",
      firstNightIndex: nightorder.firstNight("Philosopher"),
      otherNightsIndex: nightorder.otherNights("Philosopher"),
    },
  },
  marchhare: {
    ability:
      "You start knowing a riddle about your own ability. If you die at night, pick a player. You learn a riddle about their ability.",
    firstNight:
      "The March Hare learns a riddle about their ability. (Why is a raven like your ability?)",
    otherNights:
      "If the March Hare died, they point to a player. Give them a riddle about their ability.",
    homebrew: {
      name: "March Hare",
      roleType: "townsfolk",
      firstNightIndex: nightorder.firstNight("Washerwoman"),
      otherNightsIndex: nightorder.otherNights("Ravenkeeper"),
    },
  },
  madhatter: {
    ability:
      "Each night, the Storyteller asks you a yes/no question. Each day, you may ask the Storyteller a yes/no question. If you got the question wrong, the Storyteller answers falsely.",
    homebrew: {
      name: "Mad Hatter",
      roleType: "townsfolk",
    },
  },
  dormouse: {
    ability:
      "Each night, pick a number. You learn the closest Good role and Evil role to an ability that many seats away, one of which is correct.",
    homebrew: {
      name: "Dormouse",
      roleType: "townsfolk",
      firstNightIndex: nightorder.firstNight("Dreamer"),
      otherNightsIndex: nightorder.otherNights("Dreamer"),
    },
  },
  walrus: {
    ability:
      "The first ability each player attempts to activate does something helpful",
    homebrew: {
      name: "Walrus",
      roleType: "townsfolk",
    },
  },
  whitequeen: {
    ability: `Dead players learn that they get their ability "every other day" (ie, with a one-day delay).`,
    homebrew: {
      name: "White Queen",
      roleType: "townsfolk",
    },
  },
  caterpillar: {
    ability:
      `On the first night, look at the Grimoire and choose a Good player:` +
      ` they learn they are smoking with the Caterpillar, and everything they learn is absurd.`,
    homebrew: {
      name: "Caterpillar",
      roleType: "minion",
    },
  },
  humptydumpty: {
    ability:
      "Each night, make a prediction. You die the following night unless it came true. You start knowing to be careful not to fall.",
    homebrew: {
      name: "Humpty Dumpty",
      roleType: "townsfolk",
    },
  },
  mockturtle: {
    ability:
      "You start knowing 3 in-play character names and that you should pretend to be them. Your Amnesiac questions are also answered for every character you are currently pretending to be.",
    firstNight:
      "Show the Mock Turtle 3 in-play character names and tell them to pretend to be them.",
    homebrew: {
      name: "Mock Turtle",
      roleType: "townsfolk",
      firstNightIndex: nightorder.firstNight("Pixie"),
    },
  },
  aliceduchess: {
    ability:
      "Each day, 3 players may visit you for a party. That night, you learn whether any of them was the Cheshire Cat. Players who sneezed today register falsely to you.",
    otherNights: `The Duchess learns whether any of the players who visited them was the Cheshire Cat (or sneezed).`,
    homebrew: {
      name: "Duchess",
      roleType: "townsfolk",
      otherNightsIndex: nightorder.otherNights("Fortune Teller"),
    },
  },
};
