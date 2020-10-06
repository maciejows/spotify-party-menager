import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SpotifyToken } from '@models/SpotifyToken';
import { Store } from '@ngrx/store';
import { loadUserData, storeSpotifyToken } from '@store/auth/auth.actions';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss']
})
export class CallbackComponent implements OnInit {
  constructor(
    private router: Router,
    private store: Store<{ auth: SpotifyToken }>
  ) {}

  ngOnInit(): void {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const params = this.getParamsFromHash(hash);
      const spotifyToken: SpotifyToken = {
        value: params['access_token'],
        expiresIn: params['expires_in']
      };
      this.setStorage(spotifyToken);
      this.router.navigateByUrl('/app');
    } else {
      this.router.navigateByUrl('/');
      //TODO: Display toast or sth
      console.log('Access denied');
    }
  }

  setStorage(spotifyToken: SpotifyToken) {
    window.localStorage.setItem('token', spotifyToken.value);
    this.store.dispatch(storeSpotifyToken({ token: spotifyToken }));
    this.store.dispatch(loadUserData({ token: spotifyToken.value }));
  }

  getParamsFromHash(hash: string) {
    const params = {};
    hash.split('&').map((res) => {
      const temp = res.split('=');
      params[temp[0]] = temp[1];
    });
    return params;
  }
}
