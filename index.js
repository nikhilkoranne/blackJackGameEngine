"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var inquirer = require('inquirer');
console.log('\tPlayer and Dealer received 2 cards\n');
var Card = /** @class */ (function () {
    function Card(cardText, weight, group) {
        if (cardText === void 0) { cardText = 'Blank'; }
        if (weight === void 0) { weight = 0; }
        if (group === void 0) { group = 'Joker'; }
        this.cardText = cardText;
        this.weight = weight;
        this.group = group;
        this.cardText = cardText;
        this.weight = weight;
        this.group = group;
    }
    Card.prototype.printCard = function () {
        console.log("\t" + this.weight + " of " + this.group);
    };
    return Card;
}());
var NumberCard = /** @class */ (function (_super) {
    __extends(NumberCard, _super);
    function NumberCard(cardText, weight, group) {
        if (group === void 0) { group = ''; }
        var _this = _super.call(this, cardText, weight, group) || this;
        _this.cardText = cardText;
        _this.weight = weight;
        _this.group = group;
        return _this;
    }
    return NumberCard;
}(Card));
var FaceCard = /** @class */ (function (_super) {
    __extends(FaceCard, _super);
    function FaceCard(cardText, weight, group, faceCardName) {
        if (group === void 0) { group = ''; }
        var _this = _super.call(this, cardText, weight, group) || this;
        _this.cardText = cardText;
        _this.weight = weight;
        _this.group = group;
        _this.faceCardName = faceCardName;
        _this.cardText = faceCardName;
        return _this;
    }
    FaceCard.prototype.printCard = function () {
        console.log("\t" + this.cardText + " (" + this.weight + ") of " + this.group);
    };
    return FaceCard;
}(Card));
var Deck = /** @class */ (function () {
    function Deck() {
        this.cards = [];
        this.groups = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
        this.cardText = [];
        this.createNewDeck();
        this.shuffleCards();
    }
    Deck.prototype.createNewDeck = function () {
        this.cards = [];
        for (var i = 2; i < 11; i++) {
            this.cardText.push(new NumberCard(i.toString(), i));
        }
        this.cardText.push(new FaceCard('J', 10, '', 'Jack'));
        this.cardText.push(new FaceCard('Q', 10, '', 'Queen'));
        this.cardText.push(new FaceCard('K', 10, '', 'King'));
        this.cardText.push(new FaceCard('A', 11, '', 'Ace'));
        for (var _i = 0, _a = this.groups; _i < _a.length; _i++) {
            var group = _a[_i];
            for (var _b = 0, _c = this.cardText; _b < _c.length; _b++) {
                var i = _c[_b];
                i.group = group;
                this.cards.push(i);
            }
        }
    };
    Deck.prototype.shuffleCards = function () {
        var newList = [];
        for (var i = 0, len = this.cards.length; i < len - 1; i++) {
            newList.push(this.cards.splice(Math.floor(Math.random() * this.cards.length), 1)[0]);
        }
        newList.push(this.cards[0]);
        this.cards = newList;
    };
    Deck.prototype.draw = function () {
        if (this.cards.length > 0) {
            return this.cards.pop() || new Card();
        }
        else {
            this.createNewDeck();
            this.shuffleCards();
            return this.cards.pop() || new Card();
        }
    };
    return Deck;
}());
var Player = /** @class */ (function () {
    function Player(playerType) {
        this.playerType = playerType;
        this.cards = [];
        this.sumOfCards = 0;
        this.hasGotBlackJack = false;
    }
    Player.prototype.showCards = function () {
        console.log("\t" + this.cards.toString());
    };
    Player.prototype.assignCards = function (deck) {
        this.cards.push(deck.cards.pop() || new Card());
        this.cards.push(deck.cards.pop() || new Card());
        this.calcTotal();
    };
    Player.prototype.calcTotal = function () {
        this.sumOfCards = this.cards.reduce(function (sum, card) {
            sum = sum + card.weight;
            if (card.cardText === 'A' && sum > 21) {
                sum -= 10;
            }
            return sum;
        }, 0);
    };
    return Player;
}());
var BlackJackGameEngine = /** @class */ (function () {
    function BlackJackGameEngine() {
        this.questions = [];
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
    BlackJackGameEngine.prototype.play = function () {
        this.player.assignCards(this.deck);
        this.dealer.assignCards(this.deck);
        this.printInitialResult(this.dealer);
        this.printInitialResult(this.player);
        this.checkInitialResult();
        this.findWinner();
    };
    BlackJackGameEngine.prototype.promtPlayer = function () {
        var self = this;
        inquirer.prompt(this.questions).then(function (answers) {
            switch (answers.turn) {
                case 'Hit': {
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
    };
    BlackJackGameEngine.prototype.hit = function () {
        var card = this.deck.draw();
        this.player.cards.push(card);
        this.player.calcTotal();
        this.printLastDraw(this.player);
    };
    BlackJackGameEngine.prototype.printLastDraw = function (person) {
        console.log("\n\t" + person.playerType + " hits " + person.cards[person.cards.length - 1].cardText);
        console.log("\t" + person.playerType + " total : " + person.sumOfCards + "\n");
    };
    BlackJackGameEngine.prototype.findWinner = function () {
        var winner = new Player(''), draw = false;
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
                console.log("\tThis round was a draw.");
                console.log("\tDealer wins on a tie!.");
            }
            else {
                console.log("\t" + winner.playerType + " won the round with " + winner.sumOfCards + ".");
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
            }
            else {
                if (this.player.cards.length < 5) {
                    this.promtPlayer();
                }
                else {
                    console.log('\tPlayer won the round by a five card trick!');
                }
            }
        }
    };
    BlackJackGameEngine.prototype.checkInitialResult = function () {
        if (this.player.sumOfCards === this.dealer.sumOfCards) {
            console.log('\tTie, But dealer wins!');
        }
        else if (this.player.sumOfCards === 21) {
            console.log('\tBlackjack, Player won!');
            return;
        }
    };
    BlackJackGameEngine.prototype.printInitialResult = function (person) {
        console.log("\t" + person.playerType + " got : " + person.cards[0].cardText + " " + (person.cards[0] instanceof FaceCard ? '(' + person.cards[0].weight + ')' : '') + "  of " + person.cards[0].group + " & " + person.cards[1].cardText + " " + (person.cards[1] instanceof FaceCard ? '(' + person.cards[1].weight + ')' : '') + " of " + person.cards[1].group);
        console.log("\t" + person.playerType + " total : " + person.sumOfCards + "\n");
    };
    return BlackJackGameEngine;
}());
var blackJack = new BlackJackGameEngine();
blackJack.play();
//# sourceMappingURL=index.js.map