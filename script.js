$(function() {
  checkAndUpdatePetInfoInHtml();

  $('.treat-button').click(clickedTreatButton);
  $('.play-button').click(clickedPlayButton);
  $('.exercise-button').click(clickedExerciseButton);
  $('.water-button').click(clickedWaterButton);

  /*
   * MY jQuery METHOD #1: .dblclick(handler)
   * https://api.jquery.com/dblclick/
   * --------------------------------------------------------------
   * .dblclick() attaches a function that runs only when the user
   * double-clicks an element (two fast clicks). A single click does
   * nothing, which makes it good for a "secret" action.
   *
   * Here: double-clicking the Groot image runs grootDance(), which
   * makes him dance and gives him +1 happiness.
   */
  $('.pet-image').dblclick(grootDance);

  grootSays("I am Groot!", "hi! take care of me");
  addToLog("Groot woke up");
});

var pet_info = { name: "Groot", weight: 8, happiness: 10, water: 5 };
var maxWater = 10;

function clickedTreatButton() {
  pet_info.happiness += 2;
  pet_info.weight += 1;
  beep(660, 0.15);
  bounce();
  grootSays("I am Groot!", pick(["more snacks please", "best treat ever", "yummm"]));
  addToLog("Treat: +2 happiness, +1 lb");
  checkAndUpdatePetInfoInHtml();
}

function clickedPlayButton() {
  if (pet_info.water <= 0) return tooThirsty();

  pet_info.happiness += 3;
  pet_info.weight -= 1;
  pet_info.water -= 2;
  beep(880, 0.15);
  bounce();
  grootSays("I am Groot!!", pick(["again! again!", "this is so fun", "you're my best friend"]));
  addToLog("Play: +3 happiness, -1 lb, -2 water");
  checkAndUpdatePetInfoInHtml();
}

function clickedExerciseButton() {
  if (pet_info.water <= 0) return tooThirsty();

  pet_info.happiness -= 2;
  pet_info.weight -= 2;
  pet_info.water -= 3;
  beep(330, 0.2);
  shake();
  grootSays("I am... Groot.", pick(["my branches hurt", "are we done yet?", "I'd rather be dancing"]));
  addToLog("Exercise: -2 happiness, -2 lbs, -3 water");
  checkAndUpdatePetInfoInHtml();
}

// new button - he's a tree so he needs water
function clickedWaterButton() {
  if (pet_info.water >= maxWater) {
    shake();
    return grootSays("I am Groot.", "I'm full, no more water");
  }

  pet_info.water += 4;
  pet_info.happiness += 1;
  beep(520, 0.3);
  grootSays("I am Groot :)", pick(["ahh refreshing", "I feel taller already", "thank you!"]));
  addToLog("Water: +4 water, +1 happiness");
  checkAndUpdatePetInfoInHtml();
}

function tooThirsty() {
  beep(150, 0.25);
  shake();
  grootSays("I am Groot...", "too thirsty, water me first");
  addToLog("Groot is too thirsty to move");
}

// secret dance from the double-click
function grootDance() {
  pet_info.happiness += 1;
  $('.pet-image').addClass('dancing');
  setTimeout(function() {
    $('.pet-image').removeClass('dancing');
  }, 1200);
  beep(990, 0.1);
  grootSays("I AM GROOT!", "dance party!!");
  addToLog("Secret dance: +1 happiness");
  checkAndUpdatePetInfoInHtml();
}

function checkAndUpdatePetInfoInHtml() {
  checkWeightAndHappinessBeforeUpdating();
  updatePetInfoInHtml();
}

// don't let stats go negative
function checkWeightAndHappinessBeforeUpdating() {
  if (pet_info.weight < 0) pet_info.weight = 0;
  if (pet_info.happiness < 0) pet_info.happiness = 0;
  if (pet_info.water < 0) pet_info.water = 0;
  if (pet_info.water > maxWater) pet_info.water = maxWater;
}

function updatePetInfoInHtml() {
  $('.name').text(pet_info.name);
  $('.weight').text(pet_info.weight);
  $('.happiness').text(pet_info.happiness);
  $('.water').text(pet_info.water + " / " + maxWater);

  var h = pet_info.happiness;
  var mood = "Wilting";
  if (h >= 15) mood = "Ecstatic";
  else if (h >= 8) mood = "Happy";
  else if (h >= 3) mood = "Meh";
  $('.mood').text(mood);

  // gray him out when he's sad
  $('.pet-image').toggleClass('sad', h < 3);
}

// speech bubble - Groot only says "I am Groot" so there's a translation under it
function grootSays(line, meaning) {
  $('.groot-line').text(line);
  $('.translation').text("(translation: " + meaning + ")");
  $('.speech-bubble').stop(true, true).fadeIn(200);

  clearTimeout(grootSays.timer);
  grootSays.timer = setTimeout(function() {
    $('.speech-bubble').fadeOut(600);
  }, 2500);
}

/*
 * MY jQuery METHOD #2: .appendTo(target)
 * https://api.jquery.com/appendTo/
 * --------------------------------------------------------------
 * .appendTo() takes the element you selected or created and adds
 * it to the END of the target element you pass in.
 *
 * Here: $('<li>') creates a new list item, .text() puts the message
 * in it, and .appendTo('.log') sticks it at the bottom of the
 * activity log list. Every button press adds a new line.
 *
 * It does the same thing as .append(), just written the other way
 * around: $(target).append(item) vs $(item).appendTo(target).
 * That lets you create the element and add it in one chain.
 */
function addToLog(message) {
  var time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  $('<li>').text(time + " - " + message).appendTo('.log');

  // only keep the last 6 entries so the list doesn't get huge
  if ($('.log li').length > 6) {
    $('.log li:first').remove();
  }
}

// jumps up and down
function bounce() {
  $('.pet-image').stop(true, true)
    .animate({ top: "-=25px" }, 150)
    .animate({ top: "+=25px" }, 150);
}

// shakes side to side
function shake() {
  $('.pet-image').stop(true, true)
    .animate({ left: "-=10px" }, 60)
    .animate({ left: "+=20px" }, 60)
    .animate({ left: "-=10px" }, 60);
}

// quick beep sounds w/ web audio so I don't need sound files
var audio;
function beep(freq, length) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    var osc = audio.createOscillator();
    var gain = audio.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.2, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + length);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + length);
  } catch (e) {}
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
