/* Original organic silhouettes and subtle facial expressions, cropped into the UI. */
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
  // Two colors only: a muted silhouette and a single facial ink. Personality
  // comes from expression, shape and motion, never from clothing or accessories.
  const designs = {
    sporty: {
      body: "#b2bda0",
      ink: "#414a3e",
      shape:
        "M110 13C166 11 207 52 208 111C210 168 169 210 111 210C52 211 12 173 12 116C10 59 51 15 110 13Z",
      eyes: '<path d="M82 56C82 67 96 68 98 57M112 57C113 68 127 67 127 56"/>',
      mouth: '<path d="M70 75C84 97 124 99 140 74"/>',
      pose: "rotate(-9 110 110)",
    },
    swimmer: {
      body: "#a4b9c0",
      ink: "#3c5054",
      shape:
        "M108 16C161 9 204 48 208 106C214 163 174 208 118 211C59 216 14 177 12 122C9 64 48 22 108 16Z",
      eyes: '<path d="M80 57C81 68 95 68 96 57M111 57C112 68 126 68 127 57"/>',
      mouth: '<path d="M71 76C86 96 121 96 137 76"/>',
      pose: "rotate(12 110 110)",
    },
    artist: {
      body: "#c4a5af",
      ink: "#57424a",
      shape:
        "M112 12C164 10 202 47 207 101C214 157 179 204 122 210C63 217 17 180 12 125C6 67 52 15 112 12Z",
      eyes: '<ellipse cx="88" cy="60" rx="4" ry="7" fill="currentColor" stroke="none"/><ellipse cx="119" cy="64" rx="4" ry="7" fill="currentColor" stroke="none"/>',
      mouth: '<path d="M69 75C79 96 112 106 135 88"/>',
      pose: "rotate(-14 110 110)",
    },
    foodie: {
      body: "#d7a47c",
      ink: "#584637",
      shape:
        "M108 14C165 9 208 49 210 107C215 165 174 208 117 210C57 214 12 174 11 117C9 58 49 17 108 14Z",
      eyes: '<path d="M80 56C80 67 94 68 97 57M111 57C112 68 126 68 128 57"/>',
      mouth: '<path d="M68 76C84 99 125 101 143 75"/>',
      pose: "rotate(-7 110 110)",
    },
  };
  function character(kind, small = false) {
    if (!personalities.includes(kind)) kind = "artist";
    const design = designs[kind];
    return `<span class="card-mascot mascot-${kind}${small ? " mascot-mini" : ""}" aria-hidden="true"><svg viewBox="0 0 220 220" focusable="false" style="color:${design.ink}"><g class="mascot-body"><g transform="${design.pose}"><path class="mascot-silhouette" d="${design.shape}" fill="${design.body}"/><g class="mascot-face" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><g class="mascot-eyes">${design.eyes}</g><g class="mascot-mouth">${design.mouth}</g></g></g></g></svg></span>`;
  }
  const api = { character, forActivities };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.DiaryCharacters = api;
})(globalThis);
