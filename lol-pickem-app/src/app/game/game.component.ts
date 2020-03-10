import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Game } from '../shared/models/game.model';
import { LolPickemService } from '../shared/lol-pickem.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  constructor(
    public auth: AuthService,
    public lolPickemService: LolPickemService,
  ) {}
  // the game that is passed in
  @Input() game: Game;
  // track which team is selected - either "blue" or "red"
  teamSelected = '';
  // track whether the guess has been verified (i.e. the verify button has been clicked and we need to highlight)
  verified = false;
  // construct the verified answer
  verifiedAnswer = '';
  // an event emitter for when play again is clicked
  @Output() playAgainClick = new EventEmitter();
  ngOnInit() {}

  /**
   * initialize the component values
   */
  initializeComponent() {
    this.game = new Game();
    this.teamSelected = '';
    this.verified = false;
  }

  /**
   * when a team is clicked
   * @param blueTeamClicked: boolean
   */
  onTeamClick(blueTeamClicked: boolean) {
    // only process the click if the guess has not been verified
    if (!this.verified) {
      // toggle the team that is selected
      this.teamSelected = blueTeamClicked ? 'blue' : 'red';
    }
  }

  /**
   * when the verify button is clicked
   */
  onVerify() {
    // store whether the user guessed it correctly or not
    let guessedCorrectly;
    // pass the verified == true value down to the team components so they highlight correctly
    this.verified = true;
    // check if the team clicked matches the team that won
    if (
      (this.teamSelected === 'blue' && this.game.gameDetails.blueTeam.win) ||
      (this.teamSelected === 'red' && this.game.gameDetails.redTeam.win)
    ) {
      // indicate the guess was correct
      guessedCorrectly = true;
      // show the correct text
      this.verifiedAnswer = `You were correct, the ${this.teamSelected} team won!`;
    } else {
      // else. indicate the guess was incorrect
      guessedCorrectly = false;
      // show the correct text
      this.verifiedAnswer = `You were not correct, the ${
        this.teamSelected === 'blue' ? 'red' : 'blue'
      } team won!`;
    }
    // if the user is logged in
    console.log(this.auth.loggedIn);
    if (this.auth.loggedIn) {
      this.auth.userProfile$.subscribe(user => {
        // regardless of the team that was clicked, log the entry to the database for this user
        this.lolPickemService.addUserHistoryToUser(
          user.email,
          this.game,
          guessedCorrectly,
        );
      });
    }
  }
  /**
   * when the play again button is clicked
   */
  onPlayAgain() {
    // initialize the component
    this.initializeComponent();
    // fire the event to play again
    this.playAgainClick.emit();
  }
}
