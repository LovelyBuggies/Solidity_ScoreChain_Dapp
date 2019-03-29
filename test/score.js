var Score = artifacts.require("./Score.sol");

contract("Score", function(accounts) {
  var scoreInstance;

  it("initializes with six students", function() {
    return Score.deployed().then(function(instance) {
      return instance.studentsNum();
    }).then(function(count) {
      assert.equal(count, 6);
    });
  });

  it("it initializes the students with the correct values", function() {
    return Score.deployed().then(function(instance) {
      scoreInstance = instance;
      return scoreInstance.students(1);
    }).then(function(student) {
      assert.equal(student[0], 1, "contains the correct id");
      assert.equal(student[2], 0, "contains the correct selects count");
      return scoreInstance.students(2);
    }).then(function(student) {
      assert.equal(student[0], 2, "contains the correct id");
      assert.equal(student[2], 0, "contains the correct selects count");
      return scoreInstance.students(3);
    }).then(function(student) {
      assert.equal(student[0], 3, "contains the correct id");
      assert.equal(student[2], 0, "contains the correct selects count");
      return scoreInstance.students(4);
    }).then(function(student) {
      assert.equal(student[0], 4, "contains the correct id");
      assert.equal(student[2], 0, "contains the correct selects count");
      return scoreInstance.students(5);
    }).then(function(student) {
      assert.equal(student[0], 5, "contains the correct id");
      assert.equal(student[2], 0, "contains the correct selects count");
      return scoreInstance.students(6);
    }).then(function(student) {
      assert.equal(student[0], 6, "contains the correct id");
      assert.equal(student[2], 0, "contains the correct selects count");
    });
  });

  it("allows a TA to cast a select", function() {
    return Score.deployed().then(function(instance) {
      scoreInstance = instance;
      studentId = 1;
      scoreVal = 80
      return scoreInstance.select(studentId, scoreVal, { from: accounts[0] });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "an event was triggered");
      assert.equal(receipt.logs[0].event, "selectedEvent", "the event type is correct");
      assert.equal(receipt.logs[0].args._studentId.toNumber(), studentId, "the student id is correct");
      return scoreInstance.TAs(accounts[0]);
    }).then(function(selected) {
      assert(selected, "the TA was marked as selected");
      return scoreInstance.students(studentId);
    }).then(function(student) {
      var scoredTimes = student[2];
      assert.equal(scoredTimes, 1, "increments Alex's select count");
    })
  });

  it("throws an exception for invalid students", function() {
    return Score.deployed().then(function(instance) {
      scoreInstance = instance;
      return scoreInstance.select(99, 80, { from: accounts[1] })
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return scoreInstance.students(1);
    }).then(function(student1) {
      var scoredTimes = student1[2];
      assert.equal(scoredTimes, 1, "Alex receive one select");
      return scoreInstance.students(2);
    }).then(function(student2) {
      var scoredTimes = student2[2];
      assert.equal(scoredTimes, 0, "Bobby did not receive any selects");
      return scoreInstance.students(3);
    }).then(function(student3) {
      var scoredTimes = student3[2];
      assert.equal(scoredTimes, 0, "Cinderalla did not receive any selects");
      return scoreInstance.students(4);
    }).then(function(student4) {
      var scoredTimes = student4[2];
      assert.equal(scoredTimes, 0, "Mary did not receive any selects");
      return scoreInstance.students(5);
    }).then(function(student5) {
      var scoredTimes = student5[2];
      assert.equal(scoredTimes, 0, "Nino did not receive any selects");
      return scoreInstance.students(6);
    }).then(function(student6) {
      var scoredTimes = student6[2];
      assert.equal(scoredTimes, 0, "Sara did not receive any selects");
    });
  });

});
