import 'expose?H5P!exports?H5P!h5p-view';

var H5PEditor = require("exports?H5PEditor!../src/scripts/question-set-textual-editor");
var Library = require("exports?FakeLibrary!./fake-library");

/**
 * Picks out the answer based on index in arrays
 *
 * @param {Object} result
 * @param {number} questionKey
 * @param {number} answerKey
 * @returns {Object}
 */
var getAnswerAt = function(result, questionKey, answerKey){
  return result[questionKey].params.answers[answerKey];
};

describe("Question Set Textual Editor", function () {
  var editor;
  var textLines;
  var multiChoiceData;

  beforeEach(function () {
    editor = new H5PEditor.QuestionSetTextualEditor({});
    textLines = [
      "1. Question one",
      "*Answer 0.0:a:b:c",
      "Answer 0.1",
      "",
      "2. Question two",
      "*Answer 1.0:d:e",
      "*Answer 1.1:::f"
    ];

    multiChoiceData = {
      "question": "Question one",
      "answers": [{
        "text": "Answer 1",
        "correct": true,
        "tipsAndFeedback": {"tip": "a", "chosenFeedback": "b", "notChosenFeedback": "c"}
      },
        {
          "text": "Answer 2",
          "correct": false,
          "tipsAndFeedback": {"tip": "", "chosenFeedback": "", "notChosenFeedback": ""}
        },
        {
          "text": "Answer 3",
          "correct": false
        }],
      "behaviour": {"singleAnswer": true}
    };
  });

  it("should parse two questions'", function () {
    var result = editor.parseTextInput(textLines, []);
    expect(result[0].params.question).toBe("Question one");
    expect(result[1].params.question).toBe("Question two");
  });

  it("should parse four answers'", function () {
    var result = editor.parseTextInput(textLines, []);
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
    var result = editor.parseTextInput(textLines, []);
    expect(getAnswerAt(result, 0, 0).tipsAndFeedback.tip).toBe("a");
    expect(getAnswerAt(result, 0, 1).tipsAndFeedback.tip).toBe("");
    expect(getAnswerAt(result, 1, 0).tipsAndFeedback.tip).toBe("d");
    expect(getAnswerAt(result, 1, 1).tipsAndFeedback.tip).toBe("");
  });

  it("should parse 'chosen feedback' field'", function () {
    var result = editor.parseTextInput(textLines, []);
    expect(getAnswerAt(result, 0, 0).tipsAndFeedback.chosenFeedback).toBe("b");
    expect(getAnswerAt(result, 0, 1).tipsAndFeedback.chosenFeedback).toBe("");
    expect(getAnswerAt(result, 1, 0).tipsAndFeedback.chosenFeedback).toBe("e");
    expect(getAnswerAt(result, 1, 1).tipsAndFeedback.chosenFeedback).toBe("");
  });

  it("should parse 'not chosen feedback' field'", function () {
    var result = editor.parseTextInput(textLines, []);
    expect(getAnswerAt(result, 0, 0).tipsAndFeedback.notChosenFeedback).toBe("c");
    expect(getAnswerAt(result, 0, 1).tipsAndFeedback.notChosenFeedback).toBe("");
    expect(getAnswerAt(result, 1, 0).tipsAndFeedback.notChosenFeedback).toBe("");
    expect(getAnswerAt(result, 1, 1).tipsAndFeedback.notChosenFeedback).toBe("f");
  });

  it("should serialize a question to a string", function () {
    var text = editor.addMultiChoice(new Library('params', multiChoiceData), 0);
    expect(text).toBe('1. Question one\n*Answer 1:a:b:c\nAnswer 2\nAnswer 3\n');
  });

  it("should handle serializing roundtrip", function () {
    var result = editor.parseTextInput(textLines, []);
    var text = editor.addMultiChoice(new Library('params', result[0].params), 0);
    var resultTextLines = text.split('\n');

    expect(textLines[0]).toBe(resultTextLines[0]);
    expect(textLines[1]).toBe(resultTextLines[1]);
    expect(textLines[2]).toBe(resultTextLines[2]);
  });
});