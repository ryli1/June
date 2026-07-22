let extrasMusic;

var heartColor = "#ff7ebe"
function createHeart() {
  const heart = document.createElement('div');
  const randomAngle = Math.random() * 360;
  const randomSpeed = Math.random() * 5 + 3;

  heart.style.setProperty('--start-angle', randomAngle + 'deg');
  heart.classList.add('heart');
  heart.innerHTML = '❤';
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.animationDuration = Math.random() * 3 + 2 + "s"; // 2-5 seconds
  heart.style.opacity = 1;
  heart.style.fontSize = Math.random() * 15 + 5 + "px";
  heart.style.animationDuration = `${randomSpeed}s`;
  heart.style.color = heartColor;

  document.body.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 10000);
}
// Create a new heart every 100ms
setInterval(createHeart, 50);

let currentPlaylistAudio;
let playlistCancelled = false;
let activeAudioTracks = [];

function stopAllAudio() {
  activeAudioTracks.forEach(audio => {
    if (audio) {
      audio.pause();
      audio.volume = 0;
    }
  });
  activeAudioTracks = [];
  currentPlaylistAudio = null;
  if (typeof extrasMusic !== 'undefined') extrasMusic = null;
}

function fadeAudioIn(audioObject, maxVolume = 0.5, fadeDuration = 2000) {
  if (!audioObject) return;
  if (!activeAudioTracks.includes(audioObject)) {
    activeAudioTracks.push(audioObject);
  }
  audioObject.volume = 0;
  audioObject.play().catch(err => console.log("Audio play blocked:", err));

  const fadeIntervalTime = 50;
  const totalSteps = fadeDuration / fadeIntervalTime;
  const volumeStep = maxVolume / totalSteps;

  const fadeInterval = setInterval(function () {
    if (!activeAudioTracks.includes(audioObject) || audioObject.paused) {
      clearInterval(fadeInterval);
      return;
    }
    if (audioObject.volume < maxVolume - volumeStep) {
      audioObject.volume += volumeStep;
    } else {
      audioObject.volume = maxVolume;
      clearInterval(fadeInterval);
    }
  }, fadeIntervalTime);
}

function fadeAudioOut(audioObject, fadeDuration = 2000, onComplete) {
  if (!audioObject || audioObject.paused || audioObject.volume === 0) {
    if (onComplete) onComplete();
    return;
  }
  const startVolume = audioObject.volume;
  const fadeIntervalTime = 50; 
  const totalSteps = fadeDuration / fadeIntervalTime;
  const volumeStep = startVolume / totalSteps;

  const fadeInterval = setInterval(function () {
    if (audioObject.volume > volumeStep) {
      audioObject.volume -= volumeStep;
    } else {
      audioObject.volume = 0;
      audioObject.pause();
      clearInterval(fadeInterval);
      if (onComplete) onComplete();
    }
  }, fadeIntervalTime);
}

function playPlaylist(trackList, volume = 0.5, fadeDuration = 2000, index = 0) {
  if (playlistCancelled) return;

  const track = trackList[index];
  const audio = new Audio(track);
  currentPlaylistAudio = audio;
  activeAudioTracks.push(audio);

  fadeAudioIn(audio, volume, fadeDuration);

  audio.addEventListener('ended', () => {
    if (!activeAudioTracks.includes(audio)) return;
    const nextIndex = (index + 1) % trackList.length; 
    playPlaylist(trackList, volume, fadeDuration, nextIndex);
  });
}
function stopPlaylist(fadeDuration = 2000) {
  playlistCancelled = true;
  if (currentPlaylistAudio) {
    fadeAudioOut(currentPlaylistAudio, fadeDuration);
    currentPlaylistAudio = null;
  }
}

var menuMusic = document.getElementById("flutters");
menuMusic.volume = 0.4;
activeAudioTracks.push(menuMusic);

function updateActiveCard() { //makes sections in game screen update when scrolling through them
  for (let i = 0; i < cards.length; i++) {
    cards[i].classList.remove('active');
  }
  if (cards[section - 1]) {
    cards[section - 1].classList.add('active');
  }
}

const selector = document.getElementsByClassName("triangle")

const startScreen = document.getElementById("screen-menu");
const gameScreen = document.getElementById("screen-game");
const extrasScreen = document.getElementById("screen-extras");
const finalScreen = document.getElementById("screen-final");

var selPos = 0; //Which button am i hovering over
var isGameRunning = false;

//Start Screen Keypress Check
document.addEventListener('keydown', function (e) {
  if (e.repeat) return;
  if (!startScreen.classList.contains('hidden')) {
    const selectSound = new Audio("./assets/wiiselect.wav");
    const chooseSound = new Audio("./assets/wiichoose.wav");
    const fadeSound = new Audio("./assets/SD-BANNER.wav");
    selectSound.volume = 0.3;
    chooseSound.volume = 0.3;
    fadeSound.volume = 0.4;
    if ((e.key === 'ArrowDown' || e.key === 's') && selPos != 1) {
      selector[0].style.top = '55.5%';
      selector[1].style.top = '55.5%';
      selectSound.play();
      selPos = 1;
    }
    if ((e.key === 'ArrowUp' || e.key === 'w') && selPos != 0) {
      selector[0].style.top = '40%';
      selector[1].style.top = '40%';
      selectSound.play();
      selPos = 0;
    }
    if ((e.key === 'Enter' || e.key === 'z')) {
      chooseSound.play();
      fadeSound.play();
      startScreen.classList.add('hidden');
      if (selPos === 0) { //New Game Button
        stopAllAudio();
        gameScreen.classList.remove('hidden');
        document.body.style.backgroundColor = "#87d7eb"; //game background color
        updateActiveCard();
        isGameRunning = true;
        heartColor = "#f3c2d5";
        playlistCancelled = false;
        setTimeout(() => {
          track.style.opacity = "1";
        }, 50);
        playPlaylist([
          './assets/tsundere.mp3',
          './assets/Sorry, I Like You.mp3'], 0.4, 1000);
      }
      if (selPos === 1) { //Extras Button
        stopAllAudio();
        extrasScreen.classList.remove('hidden');
        document.body.style.backgroundColor = "rgb(87, 71, 203)";

        extrasMusic = new Audio('./assets/jinro.mp3'); // no "let"/"const" here — this ASSIGNS to the outer variable instead of creating a new, separately-scoped one
        extrasMusic.loop = true;
        fadeAudioIn(extrasMusic, 0.5, 1000);
      }
      e.stopImmediatePropagation(); //stops click from going to other listeners
    }
  }
});

//game screen interaction

const sectionData = [
  {
    title: "1",
    dialogueSets: [["11/2/2024\nThe first time we hung out on a weekend!\nI think we also shared our first crêpe cake too."],
    ["It felt like a date but I think you just came for the cats...\nJK"],
    ["I was happy that someone wanted to see cats with me,\nbut I was really happy it was you bcause I thought you were super nice."],
    ["I-it's not cause I liked you or anything, you baka!"]],
    image1: "./assets/images/IMG_1.png",
    extraImages: ["./assets/images/IMG_1_2.jpg"],
    customClass: "spam-section"
  },
  {
    title: "3",
    dialogueSets: [["1/18/2025\nWoah, two whole months later."],
    ["Actually, I already liked you then and I thought you didn't, so\nI tried to stop talking to you to get over it."],
    ["But then, you were like:\n'Can we walk again'\n'Together.'"],
    ["And so I gave up not talking to you pretty fast."]],
    image1: "./assets/images/IMG_3.png",
    extraImages: ["./assets/images/IMG_3_2.jpg"]
  },
  {
    title: "4",
    dialogueSets: [["1/25/2025\nAcademy of Sciences + Thai Food + Sick."],
    ["I suspect the shrimp or water you didn't consume is guilty."]],
    image1: "./assets/images/IMG_4.png"
  },
  {
    title: "5",
    dialogueSets: [["2/15/2025\nFirst hangout after hospital!!\nI wasn't even that sick, by the way."],
    ["I'm still so grateful that you visited me in the hospital.\nYou had to have liked me by then, hmmmmmm."],
    ["The day before, I went out at 8pm to get some nata de coco\nfor the sago."],
    ["I was scared you would think the flowers and mango sago were weird,\nespecially since it was Valentine's Day."],
    ["Tell me what you thought of it, tell meee."]],
    image1: "./assets/images/IMG_5.jpg",
    extraImages: ["./assets/images/IMG_5_2.jpg"]
  },
  {
    title: "6",
    dialogueSets: [["3/8/2025\nYummy. Sushi and gardens. I didn't get my fish soy sauce, though."],
    ["It was so picturesque and I want to do a real picnic with you next time.\nYou can bring salad and fruit and I can bring mushy pea soup and sandwiches."],
    ["I was planning to say I liked you and ask you to JProm, but I got too nervous,\nso only one of those happened."]],
    image1: "./assets/images/IMG_6.jpeg",
    extraImages: ["./assets/images/IMG_6_2.jpeg"]
  },
  {
    title: "7",
    dialogueSets: [["3/22/2025\nLook how awkward. (￣_￣|||)"],
    ["I hope you had fun even though I wasn't really aware of 'prom etiquette.'"],
    ["You were so cute too, when you were holding my arm."]],
    image1: "./assets/images/IMG_7.jpg"
  },
  {
    title: "8",
    dialogueSets: [["4/5/2025\nYay, Breadbelly and Exploratorium and your mango sticky rice and Taishoken."],
    ["Also I think I told you something that night? I forgot."],
    ["Let's go Exploratorium again!"]],
    image1: "./assets/images/IMG_8.png",
    extraImages: ["./assets/images/IMG_9.jpeg"]
  },
  {
    title: "10",
    dialogueSets: [["4/19/2025\nTragic phone drop day..."],
    ["But the Balloon Museum was so fun, and a little strange. And you also told me\nyou liked meeee, eeee."],
    ["Also pricey pasta was interesting. 7/10 ngl "]],
    image1: "./assets/images/IMG_10.jpg"
  },
  {
    title: "11",
    dialogueSets: [["6/5/2025\nOh em gee, happy anniversary day.\nEw, red eye."],
    ["This might be weird, but since I began liking you, I always tried to bump into\nyou a little so I could hold your hand."],
    ["When I finally got to hold your hand, my heart was beating so fast and it was\nlike so epic."],
    ["Dear, won't you take my hand to many more anniversaries?(づ￣ 3￣)づ"]],
    image1: "./assets/images/IMG_11.jpeg",
    extraImages: ["./assets/images/IMG_11_2.jpeg"]
  },
  {
    title: "12",
    dialogueSets: [["6/7/2025\nLook, so cutie."],
    ["I was waiting the whole time to hug you, wish I had asked earlier. :C"],
    ["Also this milk sweater is so cute but it's too big for me. You should take it."]],
    image1: "./assets/images/IMG_12.jpg"
  },
  {
    title: "13",
    dialogueSets: [["7/7/2025\nFirst cuddles."],
    ["Yay."]],
    image1: "./assets/images/IMG_13.jpeg"
  },
  {
    title: "14",
    dialogueSets: [["7/21/2025\nWindy zoo day."],
    ["I got to hold your hand the whole time, heh."],
    ["What happened to that beret, too?"]],
    image1: "./assets/images/IMG_14.jpeg"
  },
  {
    title: "15",
    dialogueSets: [["7/25/2025\nYummy snickerdoodle cookies."],
    ["I still have some of the cream of tartar, we should make some more."]],
    image1: "./assets/images/IMG_15.jpg"
  },
  {
    title: "16",
    dialogueSets: [["8/3/2025\nSuchee."],
    ["Next time, you should put the whole chunk of wasabi in. I wanna feel that nose burn and\nmy eyes water."]],
    image1: "./assets/images/IMG_16.jpeg"
  },
  {
    title: "17",
    dialogueSets: [["8/16/2025\nMmmmm, hot pot on a cold day."],
    ["I wanna go again..."]],
    image1: "./assets/images/IMG_17.jpeg",
    extraImages: ["./assets/images/IMG_17_2.jpg"]
  },
  {
    title: "18",
    dialogueSets: [["9/18/2025\nFamily photo!"]],
    image1: "./assets/images/IMG_18.jpg"
  },
  {
    title: "19",
    dialogueSets: [["10/10/2025\nSpiderman: Homecoming"],
    ["I actually fought a supervillain for you in the bathroom when you weren't watching.\nNo problem m'lady."]],
    image1: "./assets/images/IMG_19.jpg"
  },
  {
    title: "20",
    dialogueSets: [["11/22/2025\nFunny penguin balloon pic day."],
    ["I only need 25% sugar when I'm with you cause you're so sweet."]],
    image1: "./assets/images/IMG_20.jpeg"
  },
  {
    title: "21",
    dialogueSets: [["12/19/2025\nFive Night's At Freddy's! Is this where you wanna be?"],
    ["And you so cutie, can you wear my hoodies again. 🥺"]],
    image1: "./assets/images/IMG_21.jpeg"
  },
  {
    title: "22",
    dialogueSets: [["12/20-12/22/2025\nDizuneerando"],
    ["Mickey's Railway ride was so cool, and the pineapple whip was 'gobsmacking', (9/10).\nI know it seems I didn't like it but I was happy seeing you so excited."],
    ["I hope we can go again, soon. I mightt have to eat you though."]],
    image1: "./assets/images/IMG_22.jpg",
    extraImages: ["./assets/images/IMG_22_2.jpeg"]
  },
  {
    title: "23",
    dialogueSets: [["12/28/2025\nSoop, soop!"],
    ["This day so eventful and fun. Soup, and piano, and garden, and cake, and\nBotanical lightshow."],
    ["And you were so cuttteeeeee. Impossible challenge: name 3 dates better than this day."],
    ["Even though you don't like it, I wish you would play the piano more.\nYou play really beautifully and I really admire you when you do."],
    ["Maybe we could duet..?"]],
    image1: "./assets/images/IMG_23.jpg",
    extraImages: ["./assets/images/IMG_24.jpg", "./assets/images/IMG_23_2.jpg", "./assets/images/IMG_23_3.jpeg"]
  },
  {
    title: "25",
    dialogueSets: [["2/7/2026\nSomebody's birthday thing."],
    ["Taishoken is becoming more and more special with you."]],
    image1: "./assets/images/IMG_25.jpg"
  },
  {
    title: "26",
    dialogueSets: [["2/14/2026\nBalentine Dai"],
    ["I'm sorry about the flowers and toopid cold sore. :("],
    ["Next Valentine's Day will be better, pinky promises."]],
    image1: "./assets/images/IMG_26.jpeg"
  },
  {
    title: "27",
    dialogueSets: [["4/1/2026\nWoah, there's ta-no way you went to Tano with me."],
    ["But there's ta-yes way that our own bread was on par."]],
    image1: "./assets/images/IMG_27.jpg"
  },
  {
    title: "28",
    dialogueSets: [["4/18/2026\nPrommy with my mo-"],
    ["I hope you had fun walking around and eating cake with me."],
    ["Next time, let's dress up fancy on a nice date just for no reason. We can go to a fancy\nrestaurant and roleplay. I don't know if I can't match your dresses' elegantness level though, ugh!"]],
    image1: "./assets/images/IMG_28.jpeg"
  },
  {
    title: "29",
    dialogueSets: [["6/1/2026\nWoah, I got a picture with a member of Lowell's honor society :O."],
    ["Graduation honestly didn't feel that big of an achievement, but you made it feel\nlike I should be proud."],
    ["Thank you for that and for the lei and the flowers and for coming to \nAshton's birthday afterwards."]],
    image1: "./assets/images/IMG_29.png"
  },
  {
    title: "30",
    dialogueSets: [["6/6/2026\nHeh. I guess you were my Jujutsu Kaisen..."]],
    image1: "./assets/images/IMG_30.jpeg"
  },
  {
    title: "31",
    dialogueSets: [["6/27/2026\nKayla's Birthday!"],
    ["The food was, like, oh em gee, so good. Your hot dog was fire too, by the way, no caps."],
    ["I loved napping with you, buttt we might have fifth wheeled Isaac."]],
    image1: "./assets/images/IMG_31.jpg"
  },
  {
    title: "32",
    dialogueSets: [["7/4/2026\nLook at her. So beautiful, so majestic, so aesthetic."]],
    image1: "./assets/images/IMG_32.jpg"
  },
  {
    title: "33", text: " ",
    dialogueSets: [["L O A D I N G  F U T U R E  D A T E S . . ."],
    ["R E T U R N  T O  B E G I N N I N G . . ."]],
    image1: "./assets/images/loading.gif",
    customClass: "loading-section"
  }
];

var trackCompleted = false;

const track = document.getElementById('track');
const controlsNav = document.getElementById('controls-nav');
var section = 1;

sectionData.forEach((data, index) => { //makes all the html page sections
  new Image().src = data.image1;
  if (data.extraImages) {
    data.extraImages.forEach(src => new Image().src = src);
  } const sectionElement = document.createElement('section');
  sectionElement.className = 'page-section';

  if (data.customClass) {
    sectionElement.classList.add(data.customClass);
  }
  if (data.text === undefined) {
    data.text = " ";
  }
  sectionElement.innerHTML = `<img src="${data.image1}" class="section-card-img" ${data.title}">
  <p class="section-text">${data.text}</p>`;
  track.appendChild(sectionElement);
});


let textAnimTimeout;
let isAnimating = false;
let fullTextCopy = "";
function textAnim(element, text, index = 0, speed = 50) { //Typewriter animation thing, larger speed number makes it slower
  const textPing = new Audio("./assets/snd_text.wav");
  textPing.volume = 0.9;
  if (index === 0) {
    element.innerHTML = "";
    isAnimating = true;
    fullTextCopy = text;
  }
  if (index < text.length) {
    element.innerHTML += text.charAt(index);
    textAnimTimeout = setTimeout(() => {
      textAnim(element, text, index + 1, speed);
      textPing.play();
    }, speed);
  } else {
    isAnimating = false;
  }
}

function swapImage(imgElement, newSrc) {
  imgElement.classList.add('fading');
  setTimeout(() => {
    imgElement.src = newSrc;
    imgElement.classList.remove('fading');
  }, 200);
}

function shakeSection(sectionElement, intensity) {
  sectionElement.classList.remove('shake');
  void sectionElement.offsetWidth;
  sectionElement.style.setProperty('--shake-amount', `${intensity}px`);
  sectionElement.classList.add('shake');

  sectionElement.addEventListener('animationend', () => {
    sectionElement.classList.remove('shake');
  }, { once: true });
}

const selectSound = new Audio("./assets/wiiselect.wav");
const coffee = new Audio("./assets/coffee.mp3");
coffee.loop = true;
const explosion = new Audio("./assets/snd_badexplosion.wav");
explosion.volume = 0.4;
selectSound.volume = 0.3;
const gameTriLeft = document.querySelector(".triangle-game-left");
const gameTriRight = document.querySelector(".triangle-game-right");
const backCircleGame = document.getElementById('back-circle-game');
const dialogueBox = document.getElementById("dialogue-container");
const dialogueText = document.getElementById("dialogue-text");
new Image().src = "./assets/textbox.png"; //preload image
new Image().src = "./assets/explode.gif";

const cards = track.children; //all the page sections
var shakeIntensity = 0;

document.addEventListener('keydown', function (a) {
  if (!gameScreen.classList.contains('hidden')) {
    if (((a.key === 'ArrowLeft') || (a.key === 'a')) && dialogueBox.classList.contains('hidden')) {
      if (section === 1) {
        backCircleGame.classList.add('selected');
        const clone = selectSound.cloneNode();
        clone.volume = selectSound.volume;
        clone.play();
      } else {
        section -= 1;
        const clone = selectSound.cloneNode();
        clone.volume = selectSound.volume;
        clone.play();
        track.style.transform = `translateX(calc(-${section - 1} * (25vw + 20vw)))`;
        gameTriRight.classList.remove('hidden');
        if (section === 1) {
          gameTriLeft.classList.add('hidden');
        }
        updateActiveCard();
      }
    }

    if (((a.key === 'ArrowRight') || (a.key === 'd')) && section != sectionData.length && dialogueBox.classList.contains('hidden')) {
      if (section === 1 && backCircleGame.classList.contains('selected')) {
        backCircleGame.classList.remove('selected');
        sectionData -= 1;
        const clone = selectSound.cloneNode();
        clone.volume = selectSound.volume;
        clone.play();
      }
      section += 1;
      const clone = selectSound.cloneNode();
      clone.volume = selectSound.volume;
      clone.play();
      track.style.transform = `translateX(calc(-${section - 1} * (25vw + 20vw)))`;
      gameTriLeft.classList.remove('hidden');
      if (section === sectionData.length) {
        gameTriRight.classList.add('hidden');
      }
      updateActiveCard();
    }

    if ((a.key === 'z') || (a.key === 'Enter')) {
      const textSound = new Audio("./assets/snd_select.wav");
      textSound.volume = 0.8;
      textSound.play();
      const currentSection = sectionData[section - 1];
      if (backCircleGame.classList.contains('selected')) {
        stopAllAudio();
        gameScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        document.body.style.backgroundColor = "#e73f93";
        backCircleGame.classList.remove('selected');
        isGameRunning = false;
        menuMusic = document.getElementById("flutters");
        fadeAudioIn(menuMusic, 0.4, 1000);
        return;
      }
      if (isGameRunning === true) {
        if (!currentSection) return;

        if (shakeIntensity === 15) { //TRANSITION TO FINAL SCREEN
          document.getElementById('explode-gif').classList.remove('hidden');
          setTimeout(() => document.getElementById('explode-gif').classList.add('hidden'), 800);
          gameScreen.classList.add('hidden');
          finalScreen.classList.remove('hidden');
          document.body.style.backgroundColor = "#a80e94";
          heartColor = "#d45ac0";
          stopAllAudio();
          fadeAudioIn(coffee, 0.5, 1000);
          explosion.play();
        }

        if (currentSection.title === "1" && trackCompleted === true) { //Shake first slide
          shakeSection(cards[section - 1], 6 + shakeIntensity * 4);
          shakeIntensity += 1;
          textSound.play();
          return;
        }

        if (!currentSection.dialogueSets) return;
        const flatLines = currentSection.dialogueSets.flat();
        if (currentSection.currentDialogue === undefined) {
          currentSection.currentDialogue = 0;
        }
        const cardImg = cards[section - 1].querySelector('.section-card-img');
        //START OF TEXT ANIMATING LOGIC
        if (isAnimating) {
          clearTimeout(textAnimTimeout);
          dialogueText.innerHTML = fullTextCopy;
          isAnimating = false;
          return;
        }
        if (currentSection.currentDialogue >= flatLines.length) {
          clearTimeout(textAnimTimeout);
          dialogueBox.classList.add('hidden');
          currentSection.currentDialogue = 0;
          if (currentSection.extraImages) {
            swapImage(cardImg, currentSection.image1);
          }
        } else {
          dialogueBox.classList.remove('hidden');
          clearTimeout(textAnimTimeout);
          if (currentSection.extraImages && currentSection.extraImages[currentSection.currentDialogue]) {
            swapImage(cardImg, currentSection.extraImages[currentSection.currentDialogue]);
          }
          const targetSentence = flatLines[currentSection.currentDialogue];
          if (currentSection.title === "33") {
            textAnim(dialogueText, targetSentence, 0, 50);
            trackCompleted = true;
            sectionData[0].dialogueSets = undefined;
            cards[0].querySelector('.section-card-img').src = '';
            cards[0].querySelector('.section-card-img').classList.add('no-image');
            cards[0].querySelector('.section-text').textContent = "* [Z] REPEATEDLY TO UNLOCK";
          } else {
            textAnim(dialogueText, targetSentence, 0, 25);
          }
          currentSection.currentDialogue += 1;
          textSound.play();
        }
        //END OF TEXT ANIMATING LOGIC
      } else {
        isGameRunning = true;
      }
    }
  }
});

const hampterImages = [
  "./assets/images/IMGH1.jpg",
  "./assets/images/IMGH2.jpg",
  "./assets/images/IMGH3.jpg",
  "./assets/images/IMGH4.jpg",
  "./assets/images/IMGH5.png",
  "./assets/images/IMGH6.jpg",
  "./assets/images/IMGH7.jpg",
  "./assets/images/IMGH8.jpg",
  "./assets/images/IMGH9.jpg",
  "./assets/images/IMGH10.jpg",
  "./assets/images/IMGH11.jpg",
  "./assets/images/IMGH12.jpg",
  "./assets/images/IMGH13.jpg"
];

const photoGrid = document.querySelector('.photo-grid');
hampterImages.forEach(src => {
  new Image().src = src; // preload
  const img = document.createElement('img');
  img.src = src;
  img.className = 'grid-photo';
  photoGrid.appendChild(img);
});

const backCircleExtras = document.getElementById('back-circle-extras');

document.addEventListener('keydown', function (e) {
  if (!extrasScreen.classList.contains('hidden')) {
    if (e.key === 'ArrowLeft' || e.key === 'a') {
      backCircleExtras.classList.add('selected');
      const clone = selectSound.cloneNode();
      clone.volume = selectSound.volume;
      clone.play();
    }
    if (e.key === 'ArrowRight' || e.key === 'd') {
      backCircleExtras.classList.remove('selected');
      const clone = selectSound.cloneNode();
      clone.volume = selectSound.volume;
      clone.play();
    }
    if ((e.key === 'z' || e.key === 'Enter') && backCircleExtras.classList.contains('selected')) {
      stopAllAudio();
      extrasScreen.classList.add('hidden');
      startScreen.classList.remove('hidden');
      document.body.style.backgroundColor = "#e73f93";
      backCircleExtras.classList.remove('selected');
      const textSound = new Audio("./assets/snd_select.wav");
      textSound.volume = 0.8;
      menuMusic = document.getElementById("flutters");
      fadeAudioIn(menuMusic, 0.4, 1000);
    }
  }
});