export default class TextParser {
  /**
   * Creates a text input widget for editing question sets
   * @constructor
   * @class
   *
   * @param {string} multiChoiceLibrary The multichoice library to use
   */
  constructor(multiChoiceLibrary) {
    this.multiChoiceLibrary = multiChoiceLibrary;
    // Used to convert HTML to text and vice versa
    this.$cleaner = H5P.jQuery('<div/>');
  }

  /**
   * Parses text to objects
   *
   * @param {String} text
   * @public
   * @return {MultiChoiceQuestion[]}
   */
  parse(text){
    return this.parseTextLines(text.split('\n'));
  }

  /**
   * Parses text lines to objects
   *
   * @param {String[]} textLines
   * @private
   * @return {MultiChoiceQuestion[]}
   */
  parseTextLines(textLines){
    return textLines
      .reduce(this.parseTextLine.bind(this), [])
      .map(this.finalizeQuestion);
  }

  /**
   * Parse a single line
   *
   * @param {MultiChoiceQuestion[]} questions
   * @param {String} textLine
   * @param {Number} index
   * @param {String[]} arr
   * @private
   * @return {MultiChoiceQuestion[]}
   */
  parseTextLine(questions, textLine, index, arr) {
    if(!this.isBlankLine(textLine)) {
      if (this.isQuestion(arr, index)) {
        questions.push(this.parseQuestion(textLine));
      }
      else { // answer
        const question = questions[questions.length - 1];
        const answer = this.parseAnswer(textLine);
        question.params.answers.push(answer);
      }
    }

    return questions;
  }

  /**
   * Parse a String to a question
   *
   * @param {String} textLine
   * @private
   * @return {MultiChoiceQuestion}
   */
  parseQuestion(textLine) {
    /**
     * @typedef {Object} MultiChoiceQuestion
     * @property {String} library
     * @property {Object} params
     * @property {String} params.question
     * @property {MultiChoiceAnswer[]} params.answers
     * @property {Boolean} params.behaviour.singleAnswer
     */
    return {
      library: this.multiChoiceLibrary,
      params: {
        question: this.cleanTextLine(textLine),
        answers: [],
        behaviour: {
          singleAnswer: true
        }
      }
    };
  }

  /**
   * Parse a String to an answer
   *
   * @param {String} textLine
   * @private
   * @return {MultiChoiceAnswer}
   */
  parseAnswer(textLine){
    const parts = this.splitAnswerString(this.cleanTextLine(textLine));
    const text = this.trim(parts[0]);

    /**
     * @typedef {Object} MultiChoiceAnswer
     * @property {String} text
     * @property {Boolean} correct
     * @property {String} tipsAndFeedback.tip
     * @property {String} tipsAndFeedback.chosenFeedback
     * @property {String} tipsAndFeedback.notChosenFeedback
     */
    return {
      text: this.removeLeadingAsterisk(text),
      correct: this.hasLeadingAsterisk(text),
      tipsAndFeedback: {
        tip: this.trim(parts[1]),
        chosenFeedback: this.trim(parts[2]),
        notChosenFeedback: this.trim(parts[3])
      }
    };
  }

  /**
   * Trims a String if it's not undefined
   *
   * @param {String} str
   * @private
   * @return {string}
   */
  trim(str){
    if(str !== undefined && str.length > 0) {
      return str.trim();
    }
  }

  /**
   * Adds a boolean to behaviour saying if the question expects a single answer (or multipe).
   *
   * @param {MultiChoiceQuestion} question
   * @private
   * @return {MultiChoiceQuestion}
   */
  finalizeQuestion(question){
    const corrects = question.params.answers.reduce(answer => (answer.correct ? 1 : 0), 0);
    question.params.behaviour.singleAnswer = corrects <= 1;
    return question;
  }

  /**
   * Is a String a blank line
   *
   * @param {String} textLine
   * @private
   * @return {boolean}
   */
  isBlankLine(textLine){
    return textLine !== undefined && textLine.length === 0;
  }

  /**
   * Is a array entry a question. Returns true if first line,
   * or the line before was blank
   *
   * @param {String[]} arr
   * @param {Number} index
   * @private
   * @return {boolean}
   */
  isQuestion(arr, index){
    return index === 0 || this.isBlankLine(arr[index - 1]);
  }

  /**
   * Remove Html elements from a string
   *
   * @param {String} str
   * @private
   * @return {String}
   */
  cleanTextLine(str){
    return this.$cleaner.text(str).html();
  }

  /**
   * Removes a leading asterisk if it exists
   *
   * @param {string} str
   * @private
   * @return {string}
   */
  removeLeadingAsterisk(str){
    if(this.hasLeadingAsterisk(str)) {
      return str.trim().substr(1, str.length)
    }
    else {
      return str;
    }
  }

  /**
   * Returns true if a String has a leading asterisk
   *
   * @param {string} str
   * @private
   * @return {boolean}
   */
  hasLeadingAsterisk(str) {
    return str != undefined && str.substr(0, 1) === '*';
  }

  /**
   * Cleans and splits an answer string, using the ':'-delimiter.
   *
   * @param {String} str
   * @private
   * @return {String[]}
   */
  splitAnswerString(str){
    return str.replace(/\\:/g, '¤').split(':', 4);
  }
}