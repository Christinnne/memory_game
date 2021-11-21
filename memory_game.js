const cardNumber = 52 //遊戲有52張卡牌
const Symbols = [
  'https://cdn-icons-png.flaticon.com/512/1/1438.png', // 黑桃 
  'https://cdn-icons-png.flaticon.com/512/138/138533.png', // 愛心 
  'https://cdn-icons-png.flaticon.com/512/138/138534.png', // 方塊
  'https://cdn-icons-png.flaticon.com/512/2869/2869376.png' // 梅花
]

const GAME_STATE = { //all the states in this game
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

const view = {
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  getCardElement(index) {
    return `
    <div class="card back" data-number="${index}"></div>
    `
  },

  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]

    return `
      <p>${number}</p>
      <img src="${symbol}" alt="">
      <p>${number}</p>
    `
  },

  displayCards(indexes) {
    const cardsPanel = document.querySelector('#cards')
    cardsPanel.innerHTML = indexes.map(item => this.getCardElement(item)).join('')  //Array.from(Array(52).keys())為0~51的陣列
  },

  renderScore(score) {
    document.querySelector('.score').innerText = `Score: ${score}`
  },

  renderTriedTimes(tried) {
    document.querySelector('.tried').innerText = `You've tried: ${tried} times`
  },

  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.number))
      } else {
        card.innerHTML = ''
        card.classList.add('back')
      }
    })
  },

  cardMatch(...cards) {
    cards.map(card => {
      card.classList.add('match')
    })
  },

  cardFailed(...cards) {
    cards.map(card => {
      card.classList.add('failed')
      card.addEventListener('animationend', e =>
        card.classList.remove('failed'), { once: true })
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}


const utility = {
  getRandomNumberArray(count) {
    let arr = Array.from(Array(count).keys())
    for (let i = count - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }

    return arr
  }
}

const model = {
  revealedCards: [],

  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.number % 13 === this.revealedCards[1].dataset.number % 13
  },

  score: 0,

  triedTimes: 0,
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(cardNumber))
  },

  dispatchCardAction(card) {
    if (!card.classList.contains('back')) return

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        view.renderTriedTimes((++model.triedTimes))
        // showGameFinished()

        if (model.isRevealedCardsMatched()) { //match successfully
          view.renderScore((model.score += 10))
          this.currentState = GAME_STATE.CardsMatched
          view.cardMatch(...model.revealedCards)
          this.currentState = GAME_STATE.FirstCardAwaits
          model.revealedCards = []
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
          }
        } else { //failed
          this.currentState = GAME_STATE.CardsMatchFailed
          view.cardFailed(...model.revealedCards)
          setTimeout(this.resetCard, 1000)
        }
        break
    }
  },

  resetCard() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

controller.generateCards()


document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})