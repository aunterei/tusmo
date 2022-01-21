import dictionnary from "./words.js";

const KEYBOARD = [
  [
    { letter: "A", id: "A", state: "NONE" },
    { letter: "Z", id: "Z", state: "NONE" },
    { letter: "E", id: "E", state: "NONE" },
    { letter: "R", id: "R", state: "NONE" },
    { letter: "T", id: "T", state: "NONE" },
    { letter: "Y", id: "Y", state: "NONE" },
    { letter: "U", id: "U", state: "NONE" },
    { letter: "I", id: "I", state: "NONE" },
    { letter: "O", id: "O", state: "NONE" },
    { letter: "P", id: "P", state: "NONE" },
  ],
  [
    { letter: "Q", id: "Q", state: "NONE" },
    { letter: "S", id: "S", state: "NONE" },
    { letter: "D", id: "D", state: "NONE" },
    { letter: "F", id: "F", state: "NONE" },
    { letter: "G", id: "G", state: "NONE" },
    { letter: "H", id: "H", state: "NONE" },
    { letter: "J", id: "J", state: "NONE" },
    { letter: "K", id: "K", state: "NONE" },
    { letter: "L", id: "L", state: "NONE" },
    { letter: "M", id: "M", state: "NONE" },
  ],
  [
    { letter: "W", id: "W", state: "NONE" },
    { letter: "X", id: "X", state: "NONE" },
    { letter: "C", id: "C", state: "NONE" },
    { letter: "V", id: "V", state: "NONE" },
    { letter: "B", id: "B", state: "NONE" },
    { letter: "N", id: "N", state: "NONE" },
    { letter: "⌫", id: "BACKSPACE", state: "NONE" },
    { letter: "↲", id: "ENTER", state: "NONE" },
  ],
];

const GRID_CELL = {
  letter: "",
  state: "NONE",
};

var app = {
  data() {
    return {
      isGameOver: false,
      wordLength: 6,
      maxTries: 6,
      currentTry: 0,
      currentIndex: 0,
      hiddenWord: [],
      displayedTries: [],
      historyTries: [],
      keyboardState: [...KEYBOARD],
      gameOver: false,
      gameResult: "Défaite..",
      showHistory: false,
      showHiddenWord: false,
    };
  },
  methods: {
    initGame(newWord) {
      // Let's go
      this.isGameOver = false;

      // Reset all
      this.currentTry = 0;
      this.currentIndex = 0;
      this.displayedTries = [];
      this.gameOver = false;
      this.showHiddenWord = false;

      // Fill Array with empty strings
      for (let i = 0; i < this.maxTries; i++) {
        let row = [];
        for (let j = 0; j < this.wordLength; j++) {
          row.push({ ...GRID_CELL });
        }
        this.displayedTries.push(row);
      }

      // Fetch new word if needed
      if (newWord) {
        const wordArray = dictionnary.words[`word_${this.wordLength}`];
        const word = wordArray[rand(0, wordArray.length - 1)];
        this.hiddenWord = word.split("");
      }

      // Fill first line
      this.displayedTries[0][0].letter = this.hiddenWord[0];
      for (let i = 1; i < this.wordLength; i++) {
        this.displayedTries[0][i].letter = ".";
      }

      console.log(this.hiddenWord);
    },
    resetKeyboard() {
      for (let i = 0; i < this.keyboardState.length; i++) {
        for (let j = 0; j < this.keyboardState[i].length; j++) {
          this.keyboardState[i][j].state = "NONE";
        }
      }
    },
    /**
     * Listener to change the difficulty (wordLength)
     * @param {Event} e - On change Event
     */
    selectWordLength(e) {
      this.wordLength = parseInt(e.target.value);
      this.resetKeyboard();
      this.initGame(true);
    },
    /**
     * Listener for user keyboardInput
     * @param {Event} e - Keydown event
     */
    keyEvent(e) {
      //To avoid double calls
      e.stopImmediatePropagation();
      this.handleKey(e.key.toUpperCase());
    },
    handleKey(key) {
      if (!this.isGameOver) {
        switch (key) {
          case "ENTER":
            if (
              this.displayedTries[this.currentTry].indexOf(
                (c) => c.letter == "."
              ) == -1
            )
              this.checkWord();
            break;

          case "BACKSPACE":
            this.deleteChar();
            break;

          default:
            this.addChar(key);
            break;
        }
      }
    },
    /**
     * Adds the character to the current guess
     * If it's the first letter either it's the same and we do nothing
     * or we put the entered character on second position
     * @param {string} key - The character to add
     */
    addChar(key) {
      if (!(key.length == 1) || !key.match(/[A-Z]/)) {
        return;
      } else if (this.currentIndex == 0) {
        if (key == this.hiddenWord[0]) {
          this.currentIndex++;
          return;
        } else {
          this.currentIndex = 1;
        }
      }
      if (this.currentIndex < this.wordLength) {
        this.displayedTries[this.currentTry][this.currentIndex].letter = key;
        this.currentIndex++;
      }
    },
    /**
     * Deletes the last entered character
     */
    deleteChar() {
      if (this.currentIndex > 1) {
        this.currentIndex--;
        this.displayedTries[this.currentTry][this.currentIndex].letter = ".";
      } else {
        this.currentIndex = 0;
      }
    },
    /**
     * Parse the word and show results
     * Fired when enter key is pressed
     */
    checkWord() {
      let word = this.displayedTries[this.currentTry];
      let hiddenWord = this.hiddenWord.slice();
      let historyTry = [];

      const letterAnim = new Promise((resolve, reject) => {
        const letterColorDelay = 200 * this.wordLength;

        for (let i = 0; i < this.wordLength; i++) {
          const match = hiddenWord[i] == word[i].letter;

          const delay = 200 * i;

          let key = this.findKey(word[i].letter);

          if (match) {
            hiddenWord[i] = ".";
            historyTry.push("🟥");

            setTimeout(
              () => (this.displayedTries[this.currentTry][i].state = "CORRECT"),
              delay
            );
            setTimeout(() => (key.state = "CORRECT"), letterColorDelay);
          } else if (hiddenWord.indexOf(word[i].letter) != -1) {
            hiddenWord[hiddenWord.indexOf(word[i].letter)] = ".";
            historyTry.push("🟡");

            setTimeout(() => {
              if (this.displayedTries[this.currentTry][i].state != "CORRECT")
                this.displayedTries[this.currentTry][i].state = "WRONGPOS";
            }, delay);
            setTimeout(() => {
              if (key.state != "CORRECT") key.state = "WRONGPOS";
            }, letterColorDelay);
          } else {
            historyTry.push("🟦");

            setTimeout(() => {
              if (key.state == "NONE") key.state = "NOTINWORD";
            }, letterColorDelay);
          }
        }
        this.historyTries.push(historyTry);
        setTimeout(() => {
          resolve();
        }, 200 * this.wordLength);
      });

      letterAnim.then(() => {
        if (hiddenWord.filter((c) => c === ".").length === this.wordLength) {
          this.isGameOver = true;
          this.gameResult = "Victoire !";
        } else {
          this.nextTry();
        }
      });
    },
    findKey(key) {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < this.keyboardState[i].length; j++) {
          if (this.keyboardState[i][j].letter === key) {
            return this.keyboardState[i][j];
          }
        }
      }
    },
    /**
     * Called after wordCheck - Ends game if max tries reached
     */
    nextTry() {
      this.currentIndex = 0;
      this.currentTry++;

      if (this.currentTry == this.maxTries) {
        this.isGameOver = true;
        this.gameResult = "Défaite..";
      } else {
        this.displayedTries[this.currentTry][0].letter = this.hiddenWord[0];
        for (let i = 1; i < this.wordLength; i++) {
          this.displayedTries[this.currentTry][i].letter = ".";
        }
      }
    },
    /**
     * Try again
     * @param {Boolean} newWord - Try again or try another word
     */
    playAgain(newWord) {
      this.resetKeyboard();
      this.initGame(newWord);
    },
  },
  created() {
    this.initGame(true);
    window.addEventListener("keyup", this.keyEvent);
  },
};

/**
 * Gives a random int in a certain range
 * Uses Math.random twice for more randomness
 * @param {int} min
 * @param {int} max
 */
function rand(min, max) {
  return (
    (Math.floor(Math.pow(10, 14) * Math.random() * Math.random()) %
      (max - min + 1)) +
    min
  );
}

Vue.createApp(app).mount("#mainContainer");
