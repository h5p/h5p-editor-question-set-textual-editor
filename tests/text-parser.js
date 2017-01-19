import TextParser from '../src/scripts/text-parser'

/**
 * Picks out the answer based on index in arrays
 *
 * @param {Object} result
 * @param {number} questionKey
 * @param {number} answerKey
 * @returns {Object}
 */
const getAnswerAt = function(result, questionKey, answerKey){
  return result[questionKey].params.answers[answerKey];
};

describe("Text Parser", function () {
  let parser;
  let textLines;

  beforeEach(function () {
    parser = new TextParser();
    textLines = [
      "1. Question one",
      "*Answer 0.0:a:b:c",
      "Answer 0.1",
      "",
      "2. Question two",
      "*Answer 1.0:d:e",
      "*Answer 1.1:::f"
    ].join('\n');
  });

  it("should parse two questions'", function () {
    const result = parser.parse(textLines);
    expect(result[0].params.question).toBe("1. Question one");
    expect(result[1].params.question).toBe("2. Question two");

  });

  it("should parse four answers'", function () {
    const result = parser.parse(textLines);
    expect(getAnswerAt(result, 0, 0).text).toBe("Answer 0.0");
    expect(getAnswerAt(result, 0, 1).text).toBe("Answer 0.1");
    expect(getAnswerAt(result, 1, 0).text).toBe("Answer 1.0");
    expect(getAnswerAt(result, 1, 1).text).toBe("Answer 1.1");
    expect(getAnswerAt(result, 0, 0).correct).toBeTruthy();
    expect(getAnswerAt(result, 0, 1).correct).toBeFalsy();
    expect(getAnswerAt(result, 1, 0).correct).toBeTruthy();
    expect(getAnswerAt(result, 1, 1).correct).toBeTruthy();
  });

  it("should parse 'tip' field'", function () {
    const result = parser.parse(textLines);

    expect(getAnswerAt(result, 0, 0).tipsAndFeedback.tip).toBe("a");
    expect(getAnswerAt(result, 0, 1).tipsAndFeedback.tip).not.toBeDefined();
    expect(getAnswerAt(result, 1, 0).tipsAndFeedback.tip).toBe("d");
    expect(getAnswerAt(result, 1, 1).tipsAndFeedback.tip).not.toBeDefined();
  });

  it("should parse 'chosen feedback' field'", function () {
    const result = parser.parse(textLines);
    expect(getAnswerAt(result, 0, 0).tipsAndFeedback.chosenFeedback).toBe("b");
    expect(getAnswerAt(result, 0, 1).tipsAndFeedback.chosenFeedback).not.toBeDefined();
    expect(getAnswerAt(result, 1, 0).tipsAndFeedback.chosenFeedback).toBe("e");
    expect(getAnswerAt(result, 1, 1).tipsAndFeedback.chosenFeedback).not.toBeDefined();
  });

  it("should parse 'not chosen feedback' field'", function () {
    const result = parser.parse(textLines);
    expect(getAnswerAt(result, 0, 0).tipsAndFeedback.notChosenFeedback).toBe("c");
    expect(getAnswerAt(result, 0, 1).tipsAndFeedback.notChosenFeedback).not.toBeDefined();
    expect(getAnswerAt(result, 1, 0).tipsAndFeedback.notChosenFeedback).not.toBeDefined();
    expect(getAnswerAt(result, 1, 1).tipsAndFeedback.notChosenFeedback).toBe("f");
  });
});