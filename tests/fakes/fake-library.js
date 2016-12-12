export default class FakeLibrary {
  /**
   * A fake library class that can be used in testing
   * @constructor
   * @class
   *
   * @param {string} name
   * @param {object} value
   */
  constructor(name, value) {
    this.name = name;
    this.value = value;
  }

  forEachChild(task) {
    for (let childName in this.value) {
      let child = new FakeLibrary(childName, this.value[childName]);

      if (task(child, childName)) {
        return;
      }
    }
  }

  getName() {
    return this.name;
  }

  validate() {
    return this.value || '';
  }
}