import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { SpotifyToken } from '../../models/SpotifyToken';
import { PlayerState } from '../../models/PlayerState';
import { get } from 'scriptjs';
import { MusicService } from '../../services/music.service';
import { Store } from '@ngrx/store';
import { storePlayerState } from 'src/app/store/player.actions';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-media-player',
  templateUrl: './media-player.component.html',
  styleUrls: ['./media-player.component.scss']
})
export class MediaPlayerComponent implements OnInit, OnDestroy {
  @Input() token: SpotifyToken;
  @Input() playerState: PlayerState;
  deviceId: string;
  player: any;
  volume: number = 0.2;
  trackProgress: number = 0;

  intervalSource = interval(500);
  intervalSub: Subscription;

  togglePlayIcon: "play" | "stop" = "play";
  volumeIcon: "volume-mute" | "volume-down" | "volume-up" = "volume-down";

  constructor(
    private musicService: MusicService,
    private store: Store<{media: PlayerState}>
    ) { }

  ngOnInit(): void {
    this.loadSpotifySdk();
    this.intervalSub = this.intervalSource.subscribe(
      _ => {
        if(this.playerState.track.paused) {}
        else this.trackProgress += 500;
      }
    );
  }

  ngOnDestroy(): void {
    this.intervalSub.unsubscribe();
  }

  addItemToPlayback(): void {
    console.log("Play uri")
    this.musicService.addItemToPlayback('spotify:track:2UkLrrYuDlnVTWPOqVt5uI', this.deviceId, this.token.value).subscribe(
      res => {
        console.log(res);
      }
    );
  }

  transferPlayback(): void {
    this.musicService.transferPlayback(this.deviceId, this.token.value).subscribe(
      () => {}
    );
  }

  getCurrentPlaybackInfo(): void {
    this.musicService.getCurrentPlaybackInfo('2UkLrrYuDlnVTWPOqVt5uI', this.token.value).subscribe(
      data => console.log(data)
    )
  }

  togglePlay(): void {
    this.player.togglePlay().then( () => { 
      console.log('Toggle play');
    });
  }

  nextTrack(): void {
    this.player.nextTrack().then( () => {
      console.log('Next');
    }); 
  }

  previousTrack(): void {
    this.player.previousTrack().then( () => {
      console.log('Previous');
    }); 
  }

  seek(): void {
    this.player.seek(this.trackProgress).then(() => {
      console.log('Changed position!');
    });
  }

  incrementAudioPosition(trackPaused: boolean): void {
    if (trackPaused) {
      this.intervalSub = this.intervalSource.subscribe( val=> {
        console.log(val);
      })
    }
    else {
      this.intervalSub.unsubscribe();
    }
  }
  
  setVolume(){
    this.player.setVolume(this.volume).then(() => {
      console.log("Volume");
      this.volumeIcon = this.volume === 0? "volume-mute" : (this.volume < 0.40? "volume-down" : "volume-up");
    });
  }

  loadSpotifySdk(): void {
    get('https://sdk.scdn.co/spotify-player.js', ()=>{
      (window as any).onSpotifyWebPlaybackSDKReady = () => {
        const token = this.token.value;
        // @ts-ignore
        this.player = new Spotify.Player({
          name: 'Spotify Genius',
          getOAuthToken: cb => { cb(token); },
          volume: 0.5
        });
        // Error handling
        this.player.addListener('initialization_error', ({ message }) => { console.error(message); });
        this.player.addListener('authentication_error', ({ message }) => { console.error(message); });
        this.player.addListener('account_error', ({ message }) => { console.error(message); });
        this.player.addListener('playback_error', ({ message }) => { console.error(message); });
      
        // Playback status updates
        this.player.addListener('player_state_changed', state => {
          let currentPlayerState: PlayerState = this.musicService.stateToPlayerObject(state);
          this.trackProgress = currentPlayerState.track.progress;
          this.store.dispatch(storePlayerState({playerState: currentPlayerState}));
          console.log(currentPlayerState);
          console.log(state);
          this.togglePlayIcon = currentPlayerState.track.paused? "play" : "stop";
        });
      
        // Ready
        this.player.addListener('ready', ({ device_id }) => {
          this.deviceId = device_id;
          console.log('Ready with Device ID', device_id);
          this.transferPlayback();
          console.log('Loading playback');
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
