App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasSelected: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Score.json", function(score) {
      App.contracts.Score = TruffleContract(score);
      App.contracts.Score.setProvider(App.web3Provider);
      App.listenForEvents();
      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Score.deployed().then(function(instance) {
      instance.selectedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        App.render();
      });
    });
  },

  render: function() {
    var scoreInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Current Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Score.deployed().then(function(instance) {
      scoreInstance = instance;
      return scoreInstance.studentsNum();
    }).then(function(studentsNum) {
      var studentsResults = $("#studentsResults");
      studentsResults.empty();

      var studentsSelect = $('#studentsSelect');
      studentsSelect.empty();

      var scoresSelect = $('#scoresSelect');
      scoresSelect.empty();

      for (var i = 1; i <= studentsNum; i++) {
        scoreInstance.students(i).then(function(student) {
          var id = student[0];
          var name = student[1];
          var scoredTimes = student[2];
          var scoredSum = student[3];
          var averageScore = Math.floor(scoredSum/scoredTimes);

          // Render student Result
          var studentTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + scoredTimes + "</td><td>" + scoredSum + "</td><td>" + averageScore
          studentsResults.append(studentTemplate);

          // Render student ballot option
          var studentOption = "<option value='" + id + "' >" + name + "</ option>"
          studentsSelect.append(studentOption);

          var scoresOption = "<option value='" + (id*5+70) + "' >" + (id*5+70) + "</ option>"
          scoresSelect.append(scoresOption);

        });
      }

      return scoreInstance.TAs(App.account);
    }).then(function(hasSelected) {
      if(hasSelected) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  castSelect: function() {
    var studentId = $('#studentsSelect').val();
    var scoredVal = $('#scoresSelect').val();
    App.contracts.Score.deployed().then(function(instance) {
      return instance.select(studentId, scoredVal, { from: App.account });
    }).then(function(result) {
      // Wait for selects to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
