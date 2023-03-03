/* globals describe, it, expect */

const { unflatten, evaluateExpr, fieldMap } = require("../creates/utils");

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

  it("evaluateExpr works as expected", async () => {
    let result;

    result = evaluateExpr('["exists", "a.b"]', {});
    expect(result).toBe(false);

    result = evaluateExpr('["exists", "a.b"]', { "a.b": false });
    expect(result).toBe(true);

    result = evaluateExpr('["not_exist", "a.b"]', {});
    expect(result).toBe(true);

    result = evaluateExpr('["not_exist", "a.b"]', { "a.b": false });
    expect(result).toBe(false);

    result = evaluateExpr('["eq", "a.b", 5]', { "a.b": 4 });
    expect(result).toBe(false);

    result = evaluateExpr('["eq", "a.b", 5]', { "a.b": 5 });
    expect(result).toBe(true);

    result = evaluateExpr('["ne", "a.b", 5]', { "a.b": 4 });
    expect(result).toBe(true);

    result = evaluateExpr('["ne", "a.b", 5]', { "a.b": 5 });
    expect(result).toBe(false);

    result = evaluateExpr('["and", ["exists", "a.b"], ["eq", "a.b", 5]]', {
      "a.b": 5,
    });
    expect(result).toBe(true);

    result = evaluateExpr('["and", ["exists", "a.b"], ["eq", "a.b", 5]]', {
      "a.b": 0,
    });
    expect(result).toBe(false);

    result = evaluateExpr('["or", ["eq", "a.b", 5], ["eq", "a.c", 6]]', {
      "a.c": 6,
      "a.b": 0,
    });
    expect(result).toBe(true);

    result = evaluateExpr('["or", ["eq", "a.b", 5], ["eq", "a.c", 6]]', {
      "a.b": 0,
      "a.c": 0,
    });
    expect(result).toBe(false);

    result = evaluateExpr('["or", true, false]');
    expect(result).toBe(true);
  });

  it("fieldMap works as expected", async () => {
    let result;
    const fields = [
      { key: "a", required: true, disallowed: false },
      { key: "b", required: false, disallowed: true },
      { key: "c", required: '["ne", "a", 5]', disallowed: '["eq", "a", 5]' },
    ];
    const inputData = {};

    result = fields.map((field) => fieldMap(field, inputData)).filter(Boolean);

    expect(result).toEqual([
      { key: "a", required: true, disallowed: false },
      { key: "c", required: true, disallowed: false },
    ]);
  });
});
