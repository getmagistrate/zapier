/* globals describe, it, expect */

const {
  unflatten,
  evaluateExpr,
  fieldMap,
  enumerateAncestors,
  descendantMap,
} = require("../creates/utils");

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

  it("fieldMap plus Boolean filter works as expected", async () => {
    let result;
    const fields = [
      { key: "a", required: true, disallowed: false },
      { key: "b", required: false, disallowed: true },
      { key: "c", required: '["ne", "a", 5]', disallowed: '["eq", "a", 5]' },
      { key: "d", type: "object", required: true, disallowed: false },
      { key: "e", type: "object", required: false, disallowed: true },
      { key: "f", type: "object", required: false, disallowed: false },
      { key: "f.g", type: "object", required: false, disallowed: true },
      { key: "f.g.h", type: "string", required: false, disallowed: false },
      { key: "f.g.h.i", type: "string", required: false, disallowed: false },
    ];
    const inputData = {};

    result = fields.map((field) => fieldMap(field, inputData)).filter(Boolean);

    expect(result).toEqual([
      { key: "a", required: true },
      { key: "c", required: true },
      { key: "d", type: "copy", required: false },
      { key: "f", type: "boolean", required: true },
      { key: "f.g.h", type: "string", required: false },
      { key: "f.g.h.i", type: "string", required: false },
    ]);
  });

  it("descendantMap plus Boolean filter works as expected", async () => {
    const fields = [
      { key: "a", required: true },
      { key: "c", required: false },
      { key: "d", type: "copy", required: false },
      { key: "f", type: "boolean", required: true },
      { key: "f.g.h", type: "string", required: false },
      { key: "f.g.h.i", type: "string", required: false },
      { key: "j", type: "boolean", required: false },
      { key: "j.k", type: "string", required: false },
    ];
    const inputData = {
      a: 1,
      c: 2,
      f: true,
      "f.g.h": "Hello",
      "f.g.h.i": "World",
      j: false,
      "j.k": "kipp",
    };
    const remainingFieldKeys = fields.map((field) => field.key);

    const result = fields
      .map((field) => descendantMap(field, inputData, remainingFieldKeys))
      .filter(Boolean);

    expect(result).toEqual([
      { key: "a", required: true },
      { key: "c", required: false },
      { key: "d", type: "copy", required: false },
      { key: "f", type: "boolean", required: true },
      { key: "j", type: "boolean", required: false },
    ]);
  });

  it("enumerateAncestors works as expected", async () => {
    expect(enumerateAncestors("a.b.c")).toEqual(["a", "a.b"]);
    expect(enumerateAncestors("a")).toEqual([]);
  });
});
