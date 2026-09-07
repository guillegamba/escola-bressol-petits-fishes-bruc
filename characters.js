/* Original code-native illustrations. Individual limbs and faces are animated by
   CSS, so the characters can inhabit the cards without video or raster layers. */
(function (root) {
  const personalities = ["sporty", "swimmer", "artist", "foodie"];
  function forActivities(activities = []) {
    const text = activities
      .join(" ")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    if (/piscina|natacio|nedar/.test(text)) return "swimmer";
    if (
      /pint|artist|dibuix|color|collage|plastilina|fang|creativ|manualitat/.test(
        text,
      )
    )
      return "artist";
    if (/aigua|aquatic|bomboll/.test(text)) return "swimmer";
    if (
      /psico|esport|circuit|ioga|ball|dansa|moviment|correr|saltar/.test(text)
    )
      return "sporty";
    return "artist";
  }
  function character(kind, small = false) {
    if (!personalities.includes(kind)) kind = "artist";
    const color = {
      sporty: "#42a366",
      swimmer: "#f8d83f",
      artist: "#eaa3c8",
      foodie: "#ffad63",
    }[kind];
    const eyes =
      kind === "swimmer"
        ? `<g class="mascot-eyes"><path d="M54 91h15m66 0h15" stroke="#24593f" stroke-width="6"/><rect x="65" y="76" width="34" height="29" rx="12" fill="#d5f0ed" stroke="#24593f" stroke-width="5"/><rect x="104" y="76" width="34" height="29" rx="12" fill="#d5f0ed" stroke="#24593f" stroke-width="5"/><path d="M99 86h5" stroke="#24593f" stroke-width="5"/><circle cx="86" cy="92" r="5" fill="#163d32"/><circle cx="118" cy="92" r="5" fill="#163d32"/></g>`
        : `<g class="mascot-eyes"><ellipse cx="83" cy="87" rx="11" ry="14" fill="#fffdf3"/><ellipse cx="116" cy="84" rx="11" ry="14" fill="#fffdf3"/><g class="mascot-pupils" fill="#173e30"><ellipse cx="86" cy="89" rx="5" ry="7"/><ellipse cx="119" cy="86" rx="5" ry="7"/></g></g>`;
    const hat =
      kind === "sporty"
        ? `<path d="M51 66Q99 37 147 64L148 76Q99 51 52 80Z" fill="#fffbee"/><path d="M52 72Q99 46 147 70" fill="none" stroke="#f07d55" stroke-width="5"/><path d="M147 67l16 5-11 9" fill="#fffbee"/>`
        : kind === "artist"
          ? `<g class="mascot-hat"><path d="M52 57C42 32 73 17 101 26C133 22 157 38 143 57Z" fill="#405ab7"/><path d="M97 27l6-12" stroke="#283c7c" stroke-width="7" stroke-linecap="round"/><path d="M58 56l79 0" stroke="#283c7c" stroke-width="9" stroke-linecap="round"/></g>`
          : kind === "swimmer"
            ? `<path d="M53 66C69 24 128 21 149 67Q99 49 53 66Z" fill="#3f6fcb"/><path d="M93 39q10-10 21 0" stroke="#fffbee" stroke-width="4" fill="none"/>`
            : `<g class="mascot-hat" fill="#fffdf3" stroke="#ead9b7" stroke-width="2"><path d="M71 61V39h61v22Z"/><path d="M70 42C45 40 53 14 73 21C75 0 104 4 106 18C127 0 151 24 133 41Z"/></g>`;
    const leftArm =
      kind === "swimmer"
        ? "M58 111Q29 99 24 78"
        : kind === "artist"
          ? "M59 114Q33 107 29 91"
          : "M59 113Q29 122 30 100";
    const rightArm =
      kind === "swimmer"
        ? "M144 110Q169 118 179 99"
        : kind === "artist"
          ? "M144 112Q162 100 164 75"
          : kind === "foodie"
            ? "M143 111Q165 103 166 78"
            : "M144 110Q164 124 169 140";
    const prop =
      kind === "sporty"
        ? `<g class="mascot-ball"><circle cx="173" cy="158" r="22" fill="#f9d93d"/><path d="M151 158h44m-22-22q-18 22 0 44m0-44q18 22 0 44" stroke="#ae7f23" stroke-width="2" fill="none"/></g>`
        : kind === "artist"
          ? `<g class="mascot-brush"><path d="M165 86l7-45" stroke="#b67b3d" stroke-width="7" stroke-linecap="round"/><path d="M167 47l2-12 10 2-2 12Z" fill="#fff8e8"/><path d="M169 35q-5-14 8-23q8 19 2 25Z" fill="#3eaa70"/></g><g class="mascot-palette"><path d="M24 97C3 96 1 120 21 129C40 138 53 125 41 116C30 116 39 101 24 97Z" fill="#f7db67"/><circle cx="18" cy="110" r="4" fill="#e87da9"/><circle cx="21" cy="122" r="4" fill="#3f6fcb"/></g>`
          : kind === "foodie"
            ? `<g class="mascot-spoon"><path d="M166 88V53" stroke="#406652" stroke-width="6" stroke-linecap="round"/><ellipse cx="166" cy="44" rx="10" ry="14" fill="#fff9dd" stroke="#406652" stroke-width="3"/></g>`
            : `<g class="mascot-water" fill="none" stroke="#4c92ad" stroke-width="5" stroke-linecap="round"><path d="M27 152q12 9 24 0t24 0t24 0t24 0t24 0t24 0"/><path d="M47 166q12 9 24 0t24 0t24 0t24 0"/></g>`;
    return `<span class="card-mascot mascot-${kind}${small ? " mascot-mini" : ""}" aria-hidden="true"><svg viewBox="0 0 220 200" focusable="false"><g class="mascot-body"><g class="mascot-legs" fill="none" stroke="#24593f" stroke-width="7" stroke-linecap="round"><path d="M82 140l-5 31-13 1"/><path d="M122 140l6 29 14-2"/></g><path class="mascot-left-arm" d="${leftArm}" fill="none" stroke="#24593f" stroke-width="7" stroke-linecap="round"/><path class="mascot-right-arm" d="${rightArm}" fill="none" stroke="#24593f" stroke-width="7" stroke-linecap="round"/><path d="M100 34C136 30 155 58 153 96C156 136 134 157 98 157C62 157 44 133 47 99C43 65 65 37 100 34Z" fill="${color}"/>${hat}${eyes}<path class="mascot-smile" d="M86 114Q101 137 120 110Q104 121 86 114Z" fill="#24593f"/><ellipse cx="69" cy="107" rx="7" ry="4" fill="#ed805e" opacity=".45"/>${kind === "sporty" ? '<path d="M156 42q-8 14 0 14t0-14Z" fill="#67b5d1"/>' : ""}</g>${prop}</svg></span>`;
  }
  const api = { character, forActivities };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.DiaryCharacters = api;
})(globalThis);
