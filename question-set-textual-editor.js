/** @namespace H5PEditor */
var H5PEditor = H5PEditor || {};

H5PEditor.QuestionSetTextualEditor = (function ($) {

  /**
   * Creates a text input widget for editing question sets
   *
   * @class
   * @param {List} list
   */
  function QuestionSetTextualEditor(list) {
    var self = this;
    var entity = list.getEntity();
    var recreation = false;
    var warned = false;

    /**
     * Instructions as to how this editor widget is used.
     * @public
     */
    self.helpText = t('helpText');

    // Create list html
    var $input = $('<textarea/>', {
      rows: 20,
      css: {
        resize: 'none'
      },
      placeholder: t('example'),
      on: {
        change: function () {
          if (warned || confirm(t('warning'))) {
            warned = true;
            recreateList();
          }
        }
      }
    });

    // Used to convert HTML to text and vice versa
    var $cleaner = $('<div/>');

    /**
     * Clears all items from the list, processes the text and add the items
     * from the text. This makes it possible to switch to another widget
     * without losing datas.
     *
     * @private
     */
    var recreateList = function () {
      // Get text input
      var textLines = $input.val().split(LB);
      textLines.push(''); // Add separator

      // Get current list (to re-use values)
      var oldQuestions = list.getValue();

      // Reset list
      list.removeAllItems();
      recreation = true;

      /* In the future it should be possobile to create group structures without
      appending them. Because then we could drop the recreation process, and
      just add back to the textarea like a validation. */

      // Go through text lines and add statements to list
      var question, corrects, numQuestions = 0;
      for (var i = 0; i < textLines.length; i++) {
        var textLine = textLines[i].trim();
        if (textLine === '') {
          // Question seperator
          if (question !== undefined) {
            // Add previous question to list
            list.addItem(question);
            question = undefined;
          }
          continue;
        }

        // Convert text to html
        $cleaner.text(textLine);

        if (question === undefined) {
          numQuestions++;

          // Find out if we should re-use values from an old question
          var matches = textLine.match(/^(\d+)\.\s?(.+)$/);
          if (matches !== null && matches.length === 3) {
            // Get old question
            question = oldQuestions[matches[1] - 1];
            textLine = matches[2];
          }

          if (question === undefined) {
            // Create new question
            question = {
              library: 'H5P.MultiChoice 1.0',
              params: {}
            };
          }

          // Update question numbering in textarea
          textLines[i] = numQuestions + '. ' + textLine;

          // Update question text using first text line
          question.params.question = textLine;

          // Reset alternatives
          delete question.params.answers;
          corrects = 0;
        }
        else {
          // Add line as answer
          if (question.params.answers === undefined) {
            question.params.answers = [];
          }

          var correct = (textLine.substr(0, 1) === '*');
          question.params.answers.push({
            text: (correct ? textLine.substr(1) : textLine),
            correct: correct
          });

          if (correct) {
            corrects++;
          }
          if (question.params.singleAnswer === undefined && corrects > 1) {
            question.params.singleAnswer = false;
          }
        }
      }

      $input.val(textLines.join(LB));
      recreation = false;
    };

    /**
     * Find the name of the given field.
     *
     * @private
     * @param {Object} field
     * @return {String}
     */
    var getName = function (field) {
     return (field.field !== undefined ? field.field.name : field.getName());
    };

    /**
     * Strips down value to make it text friendly
     *
     * @private
     * @param {(String|Boolean)} value To work with
     * @param {String} [prefix] Added before value
     */
    var strip = function (value, prefix) {
      if (!value) {
        return '';
      }

      value = value.replace(/(<[^>]*>|\r\n|\n|\r)/gm, '').trim();
      if (value !== '') {
        if (prefix) {
          // Add given prefix to value
          value = prefix + value;
        }

        // Add line break to non-empty values
        value += LB;
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
    var addMultiChoice = function (item, id) {
      var question = '';

      item.forEachChild(function (child) {
        switch (getName(child)) {
          case 'question':
            // Strip value to make it text friendly
            question = strip(child.validate(), (id + 1) + '. ') + question;
            break;

          case 'answers':
            // Loop through list of answers
            child.forEachChild(function (listChild) {

              // Loop through group of answer properties
              var answer = '';
              listChild.forEachChild(function (groupChild) {
                switch (getName(groupChild)) {
                  case 'text':
                    answer += strip(groupChild.validate());
                    break;

                  case 'correct':
                    if (groupChild.value) {
                      answer = '*' + answer; // Correct answer
                    }
                    break;
                }
              });

              // Add answer to question
              question += answer;
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
        case 'H5P.MultiChoice 1.0':
          question = addMultiChoice(item, id);
          break;

        default:
          // Not multi choice question
          question = (id + 1) + '. ' + t('unknownQuestionType') + LB;
          break;
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

  /**
   * Helps localize strings.
   *
   * @private
   * @param {String} identifier
   * @param {Object} [placeholders]
   * @returns {String}
   */
  var t = function (identifier, placeholders) {
    return H5PEditor.t('H5PEditor.QuestionSetTextualEditor', identifier, placeholders);
  };

  /**
   * Line break.
   *
   * @private
   * @constant {String}
   */
  var LB = '\n';

  return QuestionSetTextualEditor;
})(H5P.jQuery);


// Add translations
H5PEditor.language['H5PEditor.QuestionSetTextualEditor'] = {
  'libraryStrings': {
    'helpText': 'Use an empty line to separate questions.',
    'example': 'What number is PI?\n*3.14\n9.82\n\nWhat is 4 * 0?\n1\n4\n*0',
    'warning': 'Warning! All rich text formatting(incl. line breaks) will be removed. Continue?',
    'unknownQuestionType': 'Non-editable question'
  }
};
