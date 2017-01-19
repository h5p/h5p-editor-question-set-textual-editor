import 'expose?H5P!exports?H5P!h5p-view';

// add dummy translation
window.H5PEditor = {};
window.H5PEditor.t = function(s){ return s; };

import QuestionSetTextualEditor from '../src/scripts/question-set-textual-editor';
import TextParser from '../src/scripts/text-parser';
import Library from './fakes/fake-library';


describe("Question Set Textual Editor", function () {
  let editor;
  let parser;
  let textLines;
  let data;

  beforeEach(function () {
    editor = new QuestionSetTextualEditor({});
    parser = new TextParser();
    textLines = [
      "1. Question one",
      "*Answer 0.0:a:b:c",
      "Answer 0.1"
    ];

    data = {
      library:'H5P.MultiChoice 1.9',
      params: {
        question: "Question one",
        answers: [{
          text: "Answer 1",
          correct: true,
          tipsAndFeedback: {
            tip: "a",
            chosenFeedback: "b",
            notChosenFeedback: "c"
          }
        },
        {
          text: "Answer 2",
          correct: false,
          tipsAndFeedback: { }
        },
        {
          text: "Answer 3",
          correct: false
        }],
        behaviour: {
          singleAnswer: true
        }
      }
    };
  });

  it("should serialize a question to a string", function () {
    const text = editor.addMultiChoice(new Library('params', data.params), 0);
    expect(text).toBe('1. Question one\n*Answer 1:a:b:c\nAnswer 2\nAnswer 3\n');
  });

  it("should handle serializing roundtrip", function () {
    // Parse to questions, and try to recycle data
    const parsed = parser.parseTextLines(textLines);
    const question = editor.recycleQuestion([data], parsed[0]); // will fill existing data, since textLines is numbered ('1.')

    // Serialize first question to text
    const text = editor.addMultiChoice(new Library('params', question.params), 0);
    const resultTextLines = text.split('\n');

    // check output against input
    expect(textLines[0]).toBe(resultTextLines[0]);
    expect(textLines[1]).toBe(resultTextLines[1]);
    expect(textLines[2]).toBe(resultTextLines[2]);
  });
});