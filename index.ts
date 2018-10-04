import { unwatchFile } from "fs";

var inquirer = require('inquirer');
console.log('\tPlayer and Dealer received 2 cards\n');
class Card<T> {
    constructor(public readonly cardText: string = 'Blank', public readonly weight: number = 0, public group: string = 'Joker') {
        this.cardText = cardText;
        this.weight = weight;
        this.group = group;
    }
    printCard() {
        console.log(`\t${this.weight} of ${this.group}`);
    }
}
class NumberCard extends Card<NumberCard> {
    constructor(public readonly cardText: string, public readonly weight: number, public group: string = '') {
        super(cardText, weight, group);
    }
}
class FaceCard extends Card<FaceCard> {
    constructor(public readonly cardText: string, public readonly weight: number, public group: string = '', public readonly faceCardName: string) {
        super(cardText, weight, group);
        this.cardText = faceCardName;
    }
    printCard() {
        console.log(`\t${this.cardText} (${this.weight}) of ${this.group}`);
    }
}
class Deck {
    cards: Card<any>[] = [];
    groups = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
    cardText: any[] = [];
    constructor() {
        this.createNewDeck();
        this.shuffleCards();
    }

    createNewDeck() {
        this.cards = [];
        for (let i = 2; i < 11; i++) {
            this.cardText.push(new NumberCard(i.toString(), i));
        }
        this.cardText.push(new FaceCard('J', 10, '', 'Jack'));
        this.cardText.push(new FaceCard('Q', 10, '', 'Queen'));
        this.cardText.push(new FaceCard('K', 10, '', 'King'));
        this.cardText.push(new FaceCard('A', 11, '', 'Ace'));

        for (const group of this.groups) {
            for (const i of this.cardText) {
                i.group = group;
                this.cards.push(i);
            }
        }

    }

    shuffleCards() {
        let newList = [];
        for (let i = 0, len = this.cards.length; i < len - 1; i++) {
            newList.push(this.cards.splice(Math.floor(Math.random() * this.cards.length), 1)[0]);
        }
        newList.push(this.cards[0]);
        this.cards = newList;
    }

    draw(): Card<any> {
        if (this.cards.length > 0) {
            return this.cards.pop() || new Card();
        } else {
            this.createNewDeck();
            this.shuffleCards();
            return this.cards.pop() || new Card();
        }
    }
}
class Player {
    cards: Card<any>[];
    sumOfCards: number;
    hasGotBlackJack: Boolean;
    constructor(public playerType: string) {
        this.cards = [];
        this.sumOfCards = 0;
        this.hasGotBlackJack = false;
    }
    showCards() {
        console.log(`\t${this.cards.toString()}`);
    }
    assignCards(deck: Deck) {
        this.cards.push(deck.cards.pop() || new Card());
        this.cards.push(deck.cards.pop() || new Card());
        this.calcTotal();
    }
    calcTotal() {
        this.sumOfCards = this.cards.reduce(function (sum, card) {
            sum = sum + card.weight;
            if (card.cardText === 'A' && sum > 21) {
                sum -= 10;
            }
            return sum;
        }, 0);
    }
}

class BlackJackGameEngine {
    player: Player;
    dealer: Player;
    currentPlayer: Player;
    deck: Deck;
    questions: any = [];
    constructor() {
        this.player = new Player('Player');
        this.dealer = new Player('Dealer');
        this.currentPlayer = this.player;
        this.deck = new Deck();
        this.questions = [
            {
                type: "list",
                name: "turn",
                message: "Want to Hit / Stay?",
                choices: [
                    "Hit",
                    "Stay"
                ]
            }
        ];
    }
    play() {
        this.player.assignCards(this.deck);
        this.dealer.assignCards(this.deck);
        this.printInitialResult(this.dealer);
        this.printInitialResult(this.player);
        this.checkInitialResult();
        this.findWinner();
    }
    promtPlayer() {
        let self = this;
        inquirer.prompt(this.questions).then(function (answers: any) {
            switch (answers.turn) {
                case 'Hit':{
                    self.hit();
                    self.findWinner();
                    break;
                }
                case 'Stay': {
                    self.currentPlayer = self.dealer;
                    self.findWinner();
                    break;
                }
            }
        });
    }
    hit() {
        let card = this.deck.draw();
        this.player.cards.push(card);
        this.player.calcTotal();
        this.printLastDraw(this.player);
    }

    printLastDraw(person: Player) {
        console.log(`\n\t${person.playerType} hits ${person.cards[person.cards.length - 1].cardText}`);
        console.log(`\t${person.playerType} total : ${person.sumOfCards}\n`);
    }


    findWinner() {
        let winner = new Player(''), draw = false;
        if (this.currentPlayer.playerType === 'Dealer') {
            while (this.dealer.sumOfCards <= 17) {
                this.dealer.cards.push(this.deck.cards.pop() || new Card());
                this.dealer.calcTotal();
                this.printLastDraw(this.dealer);
                if (this.dealer.sumOfCards > 21) {
                    console.log('\tDealer busted!');
                    this.dealer.sumOfCards = 0;
                    break;
                }
            }
            winner = (this.player.sumOfCards > this.dealer.sumOfCards) ? this.player : this.dealer;
            if (this.player.sumOfCards === this.dealer.sumOfCards) {
                draw = true;
            }

            if (draw) {
                console.log(`\tThis round was a draw.`);
                console.log(`\tDealer wins on a tie!.`);
            }
            else {
                console.log(`\t${winner.playerType} won the round with ${winner.sumOfCards}.`);
            }
        }
        //
        else {
            if (this.player.sumOfCards === 21) {
                console.log('\tBlackjack!');
            }
            else if (this.player.sumOfCards > 21) {
                console.log('\tBusted! You lost.');
                this.player.sumOfCards = 0;
            } else {
                if (this.player.cards.length < 5) {
                    this.promtPlayer();
                } else {
                    console.log('\tPlayer won the round by a five card trick!');
                }
            }
        }
    }
    checkInitialResult() {
        if (this.player.sumOfCards === this.dealer.sumOfCards) {
            console.log('\tTie, But dealer wins!');
        } else if (this.player.sumOfCards === 21) {
            console.log('\tBlackjack, Player won!');
            return;
        }
    }
    printInitialResult(person: Player) {
        console.log(`\t${person.playerType} got : ${person.cards[0].cardText} ${(person.cards[0] instanceof FaceCard ? '(' + person.cards[0].weight + ')' : '')}  of ${person.cards[0].group} & ${person.cards[1].cardText} ${(person.cards[1] instanceof FaceCard ? '(' + person.cards[1].weight + ')' : '')} of ${person.cards[1].group}`);
        console.log(`\t${person.playerType} total : ${person.sumOfCards}\n`);
    }
}
let blackJack = new BlackJackGameEngine();
blackJack.play();