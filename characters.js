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
      body: "#a9c5ad",
      ink: "#425b49",
      shape:
        "M111 12C165 7 205 43 207 99C216 151 179 207 118 210C61 217 14 180 12 119C8 67 50 17 111 12Z",
      eyes: '<ellipse cx="72" cy="78" rx="7" ry="10" transform="rotate(12 72 78)"/><ellipse cx="98" cy="73" rx="7" ry="10" transform="rotate(12 98 73)"/>',
      mouth:
        '<path d="M71 100Q87 114 108 94" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
    },
    swimmer: {
      body: "#abc4cb",
      ink: "#43636b",
      shape:
        "M103 13C160 5 201 41 208 99C214 153 177 203 121 211C65 219 19 187 12 129C5 78 43 22 103 13Z",
      eyes: '<path d="M64 76Q72 85 80 74M91 72Q99 81 107 70" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
      mouth: '<ellipse cx="89" cy="103" rx="6" ry="8"/>',
    },
    artist: {
      body: "#cbb3c9",
      ink: "#655269",
      shape:
        "M109 11C166 8 199 47 208 104C220 157 181 206 123 211C65 219 17 183 12 126C5 72 51 19 109 11Z",
      eyes: '<ellipse cx="72" cy="73" rx="7" ry="11" transform="rotate(-12 72 73)"/><ellipse cx="99" cy="83" rx="7" ry="10" transform="rotate(-12 99 83)"/>',
      mouth:
        '<path d="M75 99Q83 112 99 105" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
    },
    foodie: {
      body: "#dbc98e",
      ink: "#71633e",
      shape:
        "M103 12C158 3 206 43 211 101C218 158 183 208 125 210C66 219 20 188 11 130C2 72 43 23 103 12Z",
      eyes: '<path d="M65 79Q73 67 81 78M92 75Q100 64 108 74" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
      mouth: '<path d="M72 95Q88 100 105 91C103 115 80 120 72 95Z"/>',
    },
  };
  function character(kind, small = false) {
    if (!personalities.includes(kind)) kind = "artist";
    const design = designs[kind];
    return `<span class="card-mascot mascot-${kind}${small ? " mascot-mini" : ""}" aria-hidden="true"><svg viewBox="0 0 220 220" focusable="false" style="color:${design.ink}"><g class="mascot-body"><path class="mascot-silhouette" d="${design.shape}" fill="${design.body}"/><g class="mascot-face" fill="currentColor"><g class="mascot-eyes">${design.eyes}</g><g class="mascot-mouth">${design.mouth}</g></g></g></svg></span>`;
  }
  const api = { character, forActivities };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.DiaryCharacters = api;
})(globalThis);
