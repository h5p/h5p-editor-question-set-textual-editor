import TextParser from './text-parser'

var $ = H5P.jQuery;
var H5PEditor = H5PEditor || window.H5PEditor || {};
// Add translations
H5PEditor.language = H5PEditor.language || {};
H5PEditor.language['H5PEditor.QuestionSetTextualEditor'] = {
  'libraryStrings': {
    'helpText': 'Use an empty line to separate each question. In multi choice the first line is the question and the next lines are the answer alternatives. The correct alternatives are prefixed with an asterisk(*), tips and feedback can also be added: *alternative:tip:feedback if chosen:feedback if not chosen. Example:',
    'example': 'What number is PI?\n*3.14\n9.82\n\nWhat is 4 * 0?\n1\n4\n*0',
    'warning': 'Warning! If you change the tasks in the textual editor all rich text formatting(incl. line breaks) will be removed.',
    'unknownQuestionType': 'Non-editable question'
  }
};

/**
 * Helps localize strings.
 *
 * @private
 * @param {String} identifier
 * @param {Object} [placeholders]
 * @returns {String}
 */
var t = function (identifier, placeholders) {
  if(H5PEditor.t !== undefined) {
    return H5PEditor.t('H5PEditor.QuestionSetTextualEditor', identifier, placeholders);
  }
};

/**
 * Line break.
 *
 * @private
 * @constant {String}
 */
var LB = '\n';

/**
 * Warn user the first time he uses the editor.
 */
var warned = false;

export default class QuestionSetTextualEditor {
  /**
   * Creates a text input widget for editing question sets
   *
   * @class
   * @param {object[]} list
   */
  constructor(list) {
    const self = this;

    //var entity = list.getEntity();
    var recreation = false;
    var shouldWarn = false;

    self.textParser = new TextParser();

    /**
     * Instructions as to how this editor widget is used.
     * @public
     */
    self.helpText = t('helpText') + '<pre>' + t('example') + '</pre>';

    // Create list html
    var $input = $('<textarea/>', {
      rows: 20,
      css: {
        resize: 'none'
      },
      placeholder: t('example'),
      on: {
        change: function () {
          recreateList();
        }
      }
    });

    // Used to convert HTML to text and vice versa
    var $cleaner = $('<div/>');

    /**
     * Clever variant of trim that can trim undefined values.
     *
     * @private
     * @param {String} value
     * @returns {String} Trimmed string, empty string if value is undefined.
     */
    var trim = function (value) {
      if (value === undefined) {
        return '';
      }

      return value.trim().replace('¤', ':');
    };

    /**
     * Clears all items from the list, processes the text and add the items
     * from the text. This makes it possible to switch to another widget
     * without losing datas.
     *
     * @private
     */
    var recreateList = function () {
      // Get current list (to re-use values)
      var oldQuestions = list.getValue();

      // Reset list
      list.removeAllItems();

      // Parse to questions, and add to list
      self.textParser.parse($input.val())
        .forEach(function(entry){
          let item = self.recycleQuestion(oldQuestions, entry);
          list.addItem(item);
        });
    };

    /**
     * Find out if we should re-use values from an old question
     *
     * @param {MultiChoiceQuestion[]} oldQuestions
     * @param {MultiChoiceQuestion} question
     * @return {MultiChoiceQuestion}
     */
    self.recycleQuestion = function(oldQuestions, question){
      const parts = self.splitQuestionText(question.params.question);

      if (self.canRecycleQuestion(parts)) {
        const index = parts[1] - 1;
        const text = parts[2];
        const recycledQuestion = oldQuestions[index] || question; // picks out the numbered question

        if(recycledQuestion.library === 'H5P.MultiChoice 1.8'){
          recycledQuestion.params.question = text;
          recycledQuestion.params.answers = question.params.answers;
          recycledQuestion.params.behaviour.singleAnswer = question.params.behaviour.singleAnswer;
        }

        return recycledQuestion;
      }
      else {
        return question;
      }
    };

    /**
     * Checks if the question is recyclable
     *
     * @param {String|Number} arr
     * @return {boolean}
     */
    self.canRecycleQuestion = function(arr){
      return arr !== null && arr.length === 3;
    };

    /**
     * Splits a question string into component parts
     *
     * @param {string} questionText
     * @return {*|Array|{index: number, input: string}}
     */
    self.splitQuestionText = function(questionText){
      return questionText.match(/^(\d+)\.\s?(.+)$/);
    };

    /**
     * Find the name of the given field.
     *
     * @private
     * @param {Object} field
     * @return {String}
     */
    var getName = function (field) {
      return (field.getName !== undefined ? field.getName() : field.field.name);
    };

    /**
     * Strips down value to make it text friendly
     *
     * @private
     * @param {(String|Boolean)} value To work with
     * @param {String} [prefix] Prepended to value
     * @param {String} [suffix] Appended to value
     */
    var strip = function (value, prefix, suffix) {
      if (!value) {
        return '';
      }

      value = value.replace(/(<[^>]*>|\r\n|\n|\r)/gm, '').trim();
      if (value !== '') {
        if (prefix) {
          // Add given prefix to value
          value = prefix + value;
        }
        if (suffix) {
          // Add given suffix to value
          value += suffix;
        }
      }

      return value;
    };

    /**
     * Get multi choice question in text friendly format.
     *
     * @private
     * @param {Object} item Field instance
     * @param {Number} id Used for labeling
     */
    self.addMultiChoice = function (item, id) {
      var question = '';

      item.forEachChild(function (child) {
        switch (getName(child)) {
          case 'question':
            // Strip value to make it text friendly
            question = strip(child.validate(), (id + 1) + '. ', LB) + question;
            break;

          case 'answers':
            // Loop through list of answers
            child.forEachChild(function (listChild) {

              // Loop through group of answer properties
              var answer = '';
              var feedback = '';
              var tip = '';
              listChild.forEachChild(function (groupChild) {
                switch (getName(groupChild)) {
                  case 'text':
                    // Add to end
                    answer += strip(groupChild.validate()).replace(/:/g, '\\:');
                    break;

                  case 'correct':
                    if (groupChild.value) {
                      // Add to beginning
                      answer = '*' + answer; // Correct answer
                    }
                    break;

                  case 'tipsAndFeedback':
                    groupChild.forEachChild(function(tipOrFeedback){
                      switch (getName(tipOrFeedback)) {
                        case 'chosenFeedback':
                          // Add to beginning
                          feedback = strip(tipOrFeedback.validate()).replace(/:/g, '\\:') + (feedback == undefined ? '' : feedback);
                          break;

                        case 'notChosenFeedback':
                          // Add to end
                          feedback += strip(tipOrFeedback.validate().replace(/:/g, '\\:'), ':');
                          break;

                        case 'tip':
                          tip = strip(tipOrFeedback.validate()).replace(/:/g, '\\:');
                          break;
                      }
                    });

                    break;
                }
              });

              if (feedback !== '') {
                // Add feedback to tip
                tip += ':' + feedback;
              }
              if (tip !== '') {
                // Add tip to answer
                answer += ':' + tip;
              }
              if (answer !== '') {
                // Add answer to question
                question += answer + LB;
              }

            });
            break;
        }
      });

      return question;
    };

    /**
     * Add items to the text input.
     *
     * @public
     * @param {Object} item Field instance added
     * @param {Number} id Used for labeling
     */
    self.addItem = function (item, id) {
      if (recreation) {
        return;
      }

      var question;

      // Get question text formatting
      switch (item.currentLibrary)  {
        case 'H5P.MultiChoice 1.8':
          question = self.addMultiChoice(item, id);
          break;

        default:
          // Not multi choice question
          question = (id + 1) + '. ' + t('unknownQuestionType') + LB;
          break;

        case undefined:
      }

      if (!warned && item.currentLibrary !== undefined && !shouldWarn) {
        shouldWarn = true;
      }

      // Add question to text field
      if (question) {
        // Convert all escaped html to text
        $cleaner.html(question);
        question = $cleaner.text();

        // Append text
        var current = $input.val();
        if (current !== '') {
          current += LB;
        }
        $input.val(current + question);
      }
    };

    /**
     * Puts this widget at the end of the given container.
     *
     * @public
     * @param {jQuery} $container
     */
    self.appendTo = function ($container) {
      $input.appendTo($container);
      if (shouldWarn && !warned) {
        alert(t('warning'));
        warned = true;
      }
    };

    /**
     * Remove this widget from the editor DOM.
     *
     * @public
     */
    self.remove = function () {
      $input.remove();
    };
  }
}
