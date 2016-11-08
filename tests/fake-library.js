var FakeLibrary = function (name, value) {
  var self = this;

  self.name = name;
  self.value = value;

  self.forEachChild = function (task) {
    for (var childName in self.value) {
      var child = new FakeLibrary(childName, self.value[childName]);

      if (task(child, childName)) {
        return;
      }
    }
  };

  self.getName = function () {
    return self.name;
  };

  self.validate = function () {
    return self.value;
  }
};