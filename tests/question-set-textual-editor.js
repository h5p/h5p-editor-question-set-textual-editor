import 'expose?H5P!exports?H5P!h5p-view';

var H5PEditor = require("exports?H5PEditor!../src/scripts/question-set-textual-editor");
var Library = require("exports?FakeLibrary!./fake-library");

describe("Question Set Textual Editor", function () {
  var editor;

  beforeEach(function () {
    editor = new H5PEditor.QuestionSetTextualEditor({});
  });

  it("should parse text input to questions", function () {
    var oldQuestions = [];
    var textLines = [
      "1. Question one",
      "*Answer 1.1:a:b:c",
      "Answer 1.2",
      "",
      "2. Question two",
      "*Answer 2.1:d:e",
      "*Answer 2.2:::f"
    ];

    // perform parse
    var result = editor.parseTextInput(textLines, oldQuestions);
    var firstQuestion = result[0].params;
    var secondQuestion = result[1].params;

    // Question 1
    expect(firstQuestion.question).toBe("Question one");
    expect(firstQuestion.behaviour.singleAnswer).toBeTruthy();

    // Answer 1.1
    expect(firstQuestion.answers[0].correct).toBeTruthy();
    expect(firstQuestion.answers[0].text).toBe("Answer 1.1");
    expect(firstQuestion.answers[0].tipsAndFeedback.chosenFeedback).toBe("b");
    expect(firstQuestion.answers[0].tipsAndFeedback.notChosenFeedback).toBe("c");
    expect(firstQuestion.answers[0].tipsAndFeedback.tip).toBe("a");

    // Answer 1.2
    expect(firstQuestion.answers[1].correct).toBeFalsy();
    expect(firstQuestion.answers[1].text).toBe("Answer 1.2");

    // Question 2
    expect(secondQuestion.question).toBe("Question two");
    expect(secondQuestion.behaviour.singleAnswer).toBeFalsy();

    // Answer 2.1
    expect(secondQuestion.answers[0].correct).toBeTruthy();
    expect(secondQuestion.answers[0].text).toBe("Answer 2.1");
    expect(secondQuestion.answers[0].tipsAndFeedback.chosenFeedback).toBe("e");
    expect(secondQuestion.answers[0].tipsAndFeedback.notChosenFeedback).toBe("");
    expect(secondQuestion.answers[0].tipsAndFeedback.tip).toBe("d");

    // Answer 2.2
    expect(secondQuestion.answers[1].correct).toBeTruthy();
    expect(secondQuestion.answers[1].text).toBe("Answer 2.2");
    expect(secondQuestion.answers[1].tipsAndFeedback.notChosenFeedback).toBe("f");
  });

  it("should serialize a question to a string", function () {
    var input = {
      "question": "Question one",
      "answers": [{
        "text": "Answer 1.1",
        "correct": true,
        "tipsAndFeedback": {"tip": "a", "chosenFeedback": "b", "notChosenFeedback": "c"}
      },
      {
        "text": "Answer 1.2",
        "correct": false,
        "tipsAndFeedback": {"tip": "", "chosenFeedback": "", "notChosenFeedback": ""}
      }],
      "behaviour": {"singleAnswer": true}
    };

    var text = editor.addMultiChoice(new Library('params', input), 0);

    expect(text).toBe('1. Question one\nAnswer 1.1:a:b:c\nAnswer 1.2\n');
  });
});