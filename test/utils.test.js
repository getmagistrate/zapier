/* globals describe, it, expect */

const { unflatten, descendsFromOptionalHandler } = require("../creates/utils");

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

  it("descendsFromOptionalHandler works as expected", async () => {
    const inputFields = [
      {
        key: "a",
        label: "A",
        required: true,
        descendsFromOptional: null,
      },
      {
        key: "b",
        label: "B",
        required: false,
        type: "boolean",
        descendsFromOptional: null,
      },
      {
        key: "b.c",
        label: "B.C",
        required: true,
        type: "string",
        descendsFromOptional: "b",
      },
    ];

    const expected = inputFields.map((v) => {
      const { descendsFromOptional, ...rest } = v;
      return rest;
    });

    let bundle = { inputData: {} };
    expect(descendsFromOptionalHandler(inputFields, bundle)).toEqual(expected);

    bundle = { inputData: { a: "hello", b: true } };
    expect(descendsFromOptionalHandler(inputFields, bundle)).toEqual(expected);

    bundle = { inputData: { a: "hello", b: false } };
    expect(descendsFromOptionalHandler(inputFields, bundle)).toEqual(
      expected.slice(0, 2)
    );
  });
});
