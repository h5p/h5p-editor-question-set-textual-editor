var FakeLibrary = function (name, val) {
  var self = this;

  self.name = name;
  self.val = val;

  self.forEachChild = function (task) {
    for (var childName in self.val) {
      var child = new FakeLibrary(childName, self.val[childName]);

      if (task(child, childName)) {
        return;
      }
    }
  };

  self.getName = function () {
    return self.name;
  };

  self.validate = function () {
    return self.val;
  }
};