
var interval;
var seconds = 0;
var currentLetter = '';
var letters = ['q','w','e','a','s','d','z','x','c'];

var totalPoints = 15;
var freeData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var timedData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var plot;

var currentData = timedData;

var currentPoint = 1;

var best = 0;
var average = 0;
var attempts = 0;
var breaks = 0;
  
window.onload = function() {
  var data = [ { label: "Successful Pulls Per Attempt", data: indexData(timedData) }];
  plot = $.plot($("#flot"), data, {
    points: {show: true},
    lines: {show: true},
    yaxis: {
      min: 0
    },
    xaxis: {
      show: false
    }
  });
  update();
};
   
function addDataPoint(data, point) {
  if (data.length > 0)
    data = data.slice(1);

  data.push(point);
  return data;
}

function updateLastDataPoint(data, point) {
  data[data.length-1] = point;
  return data;
}


function indexData(data) {
  var res = [];
  for (var i = data.length-totalPoints; i < data.length; ++i) {
    res.push([i-data.length, data[i]])
  }

  return res;
}


function update() {
  
  plot.setData([indexData(currentData)]);

  plot.setupGrid();

  plot.draw();
  setTimeout(update, 100);
}



$('#start').click(function(){
  startGame();
});

$('#freePlay').click(function(){
  if($('#freePlay')[0].checked){
    clearInterval(interval);
    seconds = 0;
    startGame();
    $("#timeInput").prop('disabled', true);
    $("#gameTimer").css('visibility', 'hidden');
  }
  else {
    $("#timeInput").prop('disabled', false);
    $("#gameTimer").css('visibility', 'inherit');
    $('#gameTimer').html("");
    removeSecond();
  }
  
});

function countdown() {
  clearInterval(interval);
  removeSecond();
  interval = setInterval(function() {
    removeSecond();
  }, 1000);
}

function removeSecond() {
  if(seconds == 0) {
    $('#gameTimer').html("Finished with " + currentPoint + " pulls!");
    $("#gameText").text("Press Space to Begin");
    if(currentPoint > 0) {
      recordGame(false);
    }
    currentLetter = "";
    updateLastDataPoint(currentData, currentPoint);
    clearInterval(interval);
    return;
  }
  var second_text = seconds > 1 ? 'seconds' : 'second';
  $('#gameTimer').html("Time Remaining: " + seconds + " " + second_text);
  seconds--;
}


$(document).on("keypress", function(e){registerKeypress(e)});

function startGame() {
  
  if(!$('#freePlay')[0].checked) {
    seconds = $("#timeInput").val();
    if(currentPoint != 0){
      currentData= addDataPoint(currentData, 0);
    }
    currentPoint = 0;
    updateLastDataPoint(currentData, currentPoint);
    countdown();
  }
  else {

  }
  challengeLetter();
}

function registerKeypress(key){
  if(key.which==32 && !$('#freePlay')[0].checked)
  {
    if(seconds > 0) {
      currentPoint = 0;
    }
    startGame();
  }
  else if(String.fromCharCode(key.which).toLowerCase() == currentLetter){
    $("#gameText").css("color", "green");
    currentLetter = "";
    setTimeout(function(){
      $("#gameText").css("color", "black");
      if(seconds > 0 || $('#freePlay')[0].checked) {
        challengeLetter();
      }
    }, 250);
    
    currentPoint++;
    if(!$('#freePlay')[0].checked) {
      updateLastDataPoint(currentData, currentPoint);
    }
  }
  else if(seconds > 0 || $('#freePlay')[0].checked) {
    if(!$('#freePlay')[0].checked) {
      var tempPoint = currentPoint;
      seconds = 0;
      currentLetter = "";
      updateLastDataPoint(currentData, currentPoint);
      clearInterval(interval);
      $("#gameText").text("Press Space to Begin");
      if(tempPoint > 0) {
        recordGame(true);
      }
      $('#gameTimer').html("<span style='color: red'>Line Broke after " + tempPoint + " pulls!</span>");
    }
    else {
      $('#gameTimer').html("<span style='color: red'>Line Broke after " + currentPoint + " pulls!</span>");
      $('#gameTimer').css('visibility', 'inherit');
      currentPoint = 0;
      $("#gameTimer").removeClass('newLetter');
        setTimeout(function(){
                $("#gameTimer").addClass('newLetter');
           },0);
      setTimeout(function(){$('#gameTimer').css('visibility', 'hidden'); $("#gameTimer").removeClass('newLetter');}, 1000);
      challengeLetter();
    }
  }
}

function challengeLetter() {
  currentLetter = letters[Math.floor((Math.random() * 9))];
  $("#gameText").text("Press " + currentLetter.toUpperCase());
}

function recordGame(broke) {
  if(broke) {
    breaks++;
  }
  if(currentPoint > best) {
    best = currentPoint;
  }
  attempts++;
  average = ((average * (attempts-1)) + currentPoint) / attempts;
  var lastFive = currentData.filter(function(val){return val != 0;})
  lastFive = lastFive.slice(Math.max(lastFive.length - 5, 0));
  var lastFiveSum = 0;
  for( var i = 0; i < lastFive.length; i++ ){
    lastFiveSum += lastFive[i];
  }
  $("#statsBest").html(best);
  $("#statsAverage").html(average.toFixed(1) + "<br>(Last 5: " + (lastFiveSum/lastFive.length).toFixed(1) + ")");
  $("#statsAttempts").html(attempts);
  $("#statsBreaks").html(breaks + "<br>(" + Math.round(breaks / attempts * 100) + "%)")
}