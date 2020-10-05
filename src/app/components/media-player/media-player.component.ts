import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { PlayerState } from '../../models/PlayerState';
import { get } from 'scriptjs';
import { PlayerService } from '../../services/player.service';
import { Store } from '@ngrx/store';
import {
  storePlayerState,
  storeProgress,
  storePausedValue
} from 'src/app/store/player.actions';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-media-player',
  templateUrl: './media-player.component.html',
  styleUrls: ['./media-player.component.scss']
})
export class MediaPlayerComponent implements OnInit, OnDestroy {
  @Input() playerState: PlayerState;
  deviceId: string;
  player: any;
  volume = 0.5;
  trackProgress = 0;

  intervalSource = interval(100);
  intervalSub: Subscription;

  togglePlayIcon: 'play' | 'pause' = 'play';

  constructor(
    private playerService: PlayerService,
    private store: Store<{ media: PlayerState }>
  ) {}

  ngOnInit(): void {
    console.log(this.volume);
    this.loadSpotifySdk();
    this.intervalSub = this.intervalSource.subscribe((_) => {
      if (this.playerState.track.paused) {
      } else this.trackProgress += 100;
    });
  }

  ngOnDestroy(): void {
    this.intervalSub.unsubscribe();
    this.player.disconnect();
  }

  addItemToPlayback(): void {
    this.playerService
      .addItemToPlayback('spotify:track:2UkLrrYuDlnVTWPOqVt5uI', this.deviceId)
      .subscribe(() => {});
  }

  transferPlayback(): void {
    this.playerService
      .transferPlayback(this.deviceId, window.localStorage.getItem('token'))
      .subscribe(() => {});
  }

  getCurrentPlaybackInfo(): void {
    this.playerService.getCurrentPlaybackInfo().subscribe(() => {});
  }

  togglePlay(): void {
    this.player.togglePlay();
  }

  nextTrack(): void {
    this.player.nextTrack();
  }

  previousTrack(): void {
    this.player.previousTrack();
  }

  seek(): void {
    this.player.seek(this.trackProgress);
  }

  setVolume() {
    this.player.setVolume(this.volume);
  }

  changePlayerState(state: PlayerState): void {
    const track = state.track;

    if (this.playerState.track.id != track.id) {
      this.store.dispatch(storePlayerState({ playerState: state }));
    }

    if (this.playerState.track.progress != track.progress) {
      this.trackProgress = track.progress;
      this.store.dispatch(storeProgress({ progress: track.progress }));
    }

    if (this.playerState.track.paused != track.paused) {
      this.store.dispatch(storePausedValue({ paused: track.paused }));
    }
  }

  loadSpotifySdk(): void {
    get('https://sdk.scdn.co/spotify-player.js', () => {
      (window as any).onSpotifyWebPlaybackSDKReady = () => {
        const token = window.localStorage.getItem('token');
        // @ts-ignore
        this.player = new Spotify.Player({
          name: 'Spotify Genius',
          getOAuthToken: (cb) => {
            cb(token);
          },
          volume: this.volume
        });
        // Error handling
        this.player.addListener('initialization_error', ({ message }) => {
          console.error(message);
        });
        this.player.addListener('authentication_error', ({ message }) => {
          console.error(message);
        });
        this.player.addListener('account_error', ({ message }) => {
          console.error(message);
        });
        this.player.addListener('playback_error', ({ message }) => {
          console.log(message);
        });

        // Playback status updates
        this.player.addListener('player_state_changed', (state) => {
          const currentPlayerState: PlayerState = new PlayerState(state);
          this.changePlayerState(currentPlayerState);
          this.togglePlayIcon = currentPlayerState.track.paused
            ? 'play'
            : 'pause';
        });

        // Ready
        this.player.addListener('ready', ({ device_id }) => {
          console.log('ready');
          this.deviceId = device_id;
          this.transferPlayback();
        });

        // Not Ready
        this.player.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline', device_id);
        });

        // Connect to the player!
        this.player.connect();
      };
    });
  }
}
