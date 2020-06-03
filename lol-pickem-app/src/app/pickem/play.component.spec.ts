import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpUrlEncodingCodec } from '@angular/common/http';

import { PickemComponent } from './pickem.component';
import { LolPickemService } from '../shared/lol-pickem.service';
import { Game } from '../shared/models/game.model';
import { AccountSearchInfo } from '../shared/models/account-search-info.model';
import { SearchAccount } from '../shared/models/search-account.model';
import { of } from 'rxjs';

describe('PickemComponent', () => {
  let component: PickemComponent;
  let fixture: ComponentFixture<PickemComponent>;
  let lolPickemService: LolPickemService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [PickemComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [LolPickemService, HttpUrlEncodingCodec]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PickemComponent);
    component = fixture.componentInstance;
    lolPickemService = TestBed.get(LolPickemService);
    fixture.detectChanges();
  });

  describe('onPlay', () => {
    it('should call the loadGame method when called', () => {
      spyOn(component, 'loadGame');

      component.onPlay();

      expect(component.loadGame).toHaveBeenCalled();
    });
  });

  describe('onGamePlayAgain', () => {
    it('should call the loadGame method when called', () => {
      spyOn(component, 'loadGame');

      component.onGamePlayAgain();

      expect(component.loadGame).toHaveBeenCalled();
    });
  });

  describe('onAccountSearchTypeChange', () => {
    it('should only instantiate the AccountSearchInfo class and reset the searchAccountFormControl validators when searchType is not "random"', () => {
      spyOn(component.searchAccountFormControl, 'reset');

      component.onAccountSearchTypeChange('fake');

      expect(component.accountSearchInfo).toEqual(new AccountSearchInfo());
      expect(component.searchAccount).toBeNull();
      expect(component.searchAccountFormControl.reset).toHaveBeenCalled();
    });

    it('should set the queue, tier, and division properties on the accountSearchInfo object if the searchType is "random"', () => {
      spyOn(component.searchAccountFormControl, 'reset');

      component.onAccountSearchTypeChange('random');

      expect(component.searchAccount).toBeNull();
      expect(component.searchAccountFormControl.reset).toHaveBeenCalled();
      expect(component.accountSearchInfo.queue).toEqual('RANKED_SOLO_5x5');
      expect(component.accountSearchInfo.tier).toEqual('PLATINUM');
      expect(component.accountSearchInfo.division).toEqual('III');
    });
  });

  describe('onSearchAccount', () => {
    it('should set the searchAccount to null and should not make the API call to get the account if the summoner name is falsy', () => {
      component.accountSearchInfo = new AccountSearchInfo();
      spyOn(lolPickemService, 'getAccountBySummonerName');

      component.onSearchAccount();

      expect(component.searchAccount).toBeNull();
      expect(lolPickemService.getAccountBySummonerName).not.toHaveBeenCalled();
    });

    it('should make the API call to get an account and set the search account to the returned account', () => {
      component.accountSearchInfo = new AccountSearchInfo();
      component.accountSearchInfo.summonerName = 'fakeSummoner';
      spyOn(lolPickemService, 'getAccountBySummonerName').and.returnValue(of({ name: 'fakeAccount' }) as any);

      component.onSearchAccount();

      expect(component.searchAccount).toEqual({ name: 'fakeAccount' } as any);
    });

    it('should set the accountNotFound property to true if an account was not found during the search', () => {
      component.accountSearchInfo = new AccountSearchInfo();
      component.accountSearchInfo.summonerName = 'fakeSummoner';
      spyOn(lolPickemService, 'getAccountBySummonerName').and.returnValue(of({ status: { status_code: 404 } }) as any);

      component.onSearchAccount();

      expect(component.searchAccount.accountNotFound).toEqual(true);
    });
  });

  describe('onSearchAccountSelected', () => {
    it('should set the summonerName and accountId properties and toggle selected to true when called', () => {
      component.searchAccount = new SearchAccount();
      component.searchAccount.name = 'Some Name';
      component.searchAccount.accountId = '123456';

      component.onSearchAccountSelected();

      expect(component.accountSearchInfo.summonerName).toEqual('Some Name');
      expect(component.accountSearchInfo.accountId).toEqual('123456');
      expect(component.searchAccount.selected).toEqual(true);
    });
  });

  describe('loadGame', () => {
    it('should not make the API call to get game info if the correct account search info is not passed', () => {
      spyOn(lolPickemService, 'getGameInfo');
      component.accountSearchInfo = new AccountSearchInfo();
      component.searchAccount = new SearchAccount();

      component.loadGame();

      expect(lolPickemService.getGameInfo).not.toHaveBeenCalled();
    });

    it('should retrieve the relevant game info from the API and update the relevant properties', () => {
      spyOn(lolPickemService, 'getGameInfo').and.returnValue(of({ gameInfo: 'someFakeInfo' }) as any);
      component.accountSearchInfo = new AccountSearchInfo();
      component.accountSearchInfo.queue = 'Some Queue';
      component.accountSearchInfo.tier = 'Some Tier';
      component.accountSearchInfo.division = 'Some Queue';
      component.searchAccount = new SearchAccount();

      component.loadGame();

      expect(component.game).toEqual({ gameInfo: 'someFakeInfo' } as any);
      expect(component.showGame).toEqual(true);
      expect(component.gameIsLoading).toEqual(false);
      expect(component.gameLoadingIsDelayed).toEqual(false);
    });
  });

  describe('initializeComponent', () => {
    it('should set instantiate a new Game and set showGame to false when called', () => {
      component.initializeComponent();

      expect(component.game).toEqual(new Game());
      expect(component.showGame).toEqual(false);
    });
  });
});
