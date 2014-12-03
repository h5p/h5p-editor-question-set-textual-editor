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
          recreateList();
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
      var textLines = $input.val().split("\n");
      textLines.push(''); // Add separator

      // Reset list
      list.removeAllItems();
      recreation = true;
      /* In the future recreation can be dropped when it's possible to create
      group structures without it being appended. That way the fields can
      just be added back to the textarea like a validation. */

      // Go through text lines and add statements to list
      var question, corrects;
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
          // Add first line as question text
          question = {
            library: 'H5P.MultiChoice 1.0',
            params: {
              question: textLine
            }
          };
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
          if (corrects > 1) {
            question.params.singleAnswer = false;
          }
        }
      }

      recreation = false;
    };

    /**
     * Add items to the text input.
     *
     * @public
     * @param {Object} item instance
     */
    self.addItem = function (item) {
      if (recreation || !(item instanceof H5PEditor.Library) ||
          item.currentLibrary !== 'H5P.MultiChoice 1.0') {
        return; // Not a multi choice question, or recreation in progress.
      }

      var question = '';
      item.forEachChild(function (child) {
        if (child.field !== undefined) {
          if (child.field.name === 'question') {
            var html = child.validate();
            if (html !== false) {
              // Strip all html tags and remove line breaks.
              question = html.replace(/(<[^>]*>|\r\n|\n|\r)/gm, '') + '\n' + question;
            }
          }
        }
        else if (child.getName() === 'answers') {
          // Loop through list of answers
          child.forEachChild(function (listChild) {
            if (!(listChild instanceof H5PEditor.Group)) {
              return;
            }

            // Loop through group of answer properties
            var answer = '';
            listChild.forEachChild(function (groupChild) {
              if (groupChild.field === undefined) {
                return; // Ignore
              }

              switch (groupChild.field.name) {
                case 'text':
                  var html = groupChild.validate();
                  if (html !== false) {
                    // Strip all html tags and remove line breaks.
                    answer = html.replace(/(<[^>]*>|\r\n|\n|\r)/gm, '') + '\n';
                  }
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
        }
      });

      if (question !== '') {
        // Convert all escaped html to text
        $cleaner.html(question);
        question = $cleaner.text();

        // Append text
        var current = $input.val();
        if (current !== '') {
          current += '\n';
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

  return QuestionSetTextualEditor;
})(H5P.jQuery);


// Add translations
H5PEditor.language['H5PEditor.QuestionSetTextualEditor'] = {
  'libraryStrings': {
    'helpText': 'Use an empty line to separate questions.',
    'example': 'What number is PI?\n*3.14\n9.82\n\nWhat is 4 * 0?\n1\n4\n*0'
  }
};
