/* globals describe, it, expect */

const { unflatten } = require("../creates/utils");

describe("utils", () => {
  it("unflatten handles all the cases", async () => {
    const flat = {
      a: 1,
      "b.c": 2,
      "b.d": 3,
      "b.e.f": 4,
      g: [{ "g._only": 5 }, { "g._only": 6 }],
      "h.i": [{ "h.i._only": 7 }, { "h.i._only": 8 }],
    };
    const unflat = unflatten(flat);
    expect(unflat).toEqual({
      a: 1,
      b: {
        c: 2,
        d: 3,
        e: {
          f: 4,
        },
      },
      g: [5, 6],
      h: {
        i: [7, 8],
      },
    });
  });
});
