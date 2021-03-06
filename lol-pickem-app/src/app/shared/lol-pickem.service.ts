import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpUrlEncodingCodec,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MatSelectItem } from './models/mat-select-item.model';
import { Game } from './models/game.model';
import { UserHistory } from './models/user-history.model';
import { TeamType } from './models/enums/team-type.enum';
import { AccountSearchInfo } from './models/account-search-info.model';
import { SearchAccount } from './models/search-account.model';

@Injectable({ providedIn: 'root' })
export class LolPickemService {
  constructor(
    private http: HttpClient,
    public httpUrlEncodingCodec: HttpUrlEncodingCodec,
  ) {}

  public readonly QueueMatSelectArray: Array<MatSelectItem> = [
    new MatSelectItem('RANKED_SOLO_5x5', 'Solo Queue'),
    new MatSelectItem('RANKED_FLEX_SR', 'Flex Queue'),
  ];

  public readonly TierMatSelectArray: Array<MatSelectItem> = [
    new MatSelectItem('IRON', 'Iron'),
    new MatSelectItem('BRONZE', 'Bronze'),
    new MatSelectItem('SILVER', 'Silver'),
    new MatSelectItem('GOLD', 'Gold'),
    new MatSelectItem('PLATINUM', 'Platinum'),
    new MatSelectItem('DIAMOND', 'Diamond'),
  ];

  public readonly DivisionMatSelectArray: Array<MatSelectItem> = [
    new MatSelectItem('I'),
    new MatSelectItem('II'),
    new MatSelectItem('III'),
    new MatSelectItem('IV'),
  ];
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, HEAD, OPTIONS',
    }),
  };

  /**
   * get an instance of Game Info
   * @param accountSearchInfo: AccountSearchInfo
   * @returns game: Game
   */
  getGameInfo(accountSearchInfo: AccountSearchInfo): Observable<Game> {
    // build the uri
    let gameInfoUri = `${environment.apiRootURI}${environment.apiGameBaseURI}/`;
    // if we are searching for an account based on a summoner name
    if (accountSearchInfo.accountId) {
      gameInfoUri += accountSearchInfo.accountId;
    } else {
      // else, we are searching based on Queue, Tier, and Division
      gameInfoUri += `${accountSearchInfo.queue}/${accountSearchInfo.tier}/${accountSearchInfo.division}`;
    }
    return this.http.get<Game>(gameInfoUri, this.httpOptions);
  }

  /**
   * get an account for the given Summoner Name
   * @param name: string
   * @returns account: Account
   */
  getAccountBySummonerName(name: string): Observable<SearchAccount> {
    // build the uri
    const accountUri = `${environment.apiRootURI}${environment.apiAccountBaseURI}/${name}`;
    return this.http.get<SearchAccount>(accountUri, this.httpOptions);
  }

  /**
   * patch a user by adding a userHistory item to the array of histories
   * @param userEmail: string - the email of the logged in user
   * @param game: Game - the game that the user is guessing about
   * @param guessedCorrectly: Boolean - if the user guessed the winner correctly
   * @returns void
   */
  addUserHistoryToUser(
    userEmail: string,
    game: Game,
    guessedCorrectly: boolean,
    guessedTeam: TeamType,
  ): void {
    // build the uri
    const addUserHistoryUri = `${environment.apiRootURI}${environment.apiUserBaseURI}`;
    // build the body from the game and the guess
    const userHistory = new UserHistory(game, guessedCorrectly, guessedTeam);
    this.http
      .patch<any[]>(
        addUserHistoryUri,
        { email: userEmail, userHistory },
        this.httpOptions,
      )
      .subscribe();
  }

  /**
   * post a user to the db (if the user exists, nothing will happen)
   * @param userEmail: string - the email of the logged in user
   * @returns void
   */
  addUser(userEmail: string): void {
    // build the uri
    const addUserUri = `${environment.apiRootURI}${environment.apiUserBaseURI}`;
    // post the userEmail to the server
    this.http
      .post<any[]>(addUserUri, { email: userEmail }, this.httpOptions)
      .subscribe();
  }

  /**
   * get a user's histories
   * @param email: string - the user's email
   * @returns userHistories: Array<UserHistory> - the user's histories
   */
  getUserHistories(email: string): Observable<UserHistory[]> {
    // build the uri
    const getUserHistoriesUri = `${environment.apiRootURI}${environment.apiUserBaseURI}/histories?email=${email}`;
    return this.http.get<UserHistory[]>(getUserHistoriesUri, this.httpOptions);
  }
}
