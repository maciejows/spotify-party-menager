import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
// Router
import { RouterModule, Routes } from '@angular/router';
//MDBBootstrap
import { MDBBootstrapModule } from 'angular-bootstrap-md';
// NgRx store
import { StoreModule } from '@ngrx/store';
import { authReducer } from './store/auth.reducer';
import { mediaReducer } from './store/media.reducer';
// NgRx Effects
import { EffectsModule } from '@ngrx/effects';
import { AuthEffects } from './store/auth.effects';
// Components
import { AppComponent } from './app.component';
import { AuthorizationComponent } from './components/authorization/authorization.component';
import { CallbackComponent } from './components/callback/callback.component';
import { AppCoreComponent } from './components/app-core/app-core.component';
import { MediaPlayerComponent } from './components/media-player/media-player.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CurrentTrackInfoComponent } from './components/current-track-info/current-track-info.component';

const routes: Routes = [
  { path: '', component: AuthorizationComponent},
  { path: 'callback', component: CallbackComponent},
  { path: 'app', component: AppCoreComponent},
  { path: '**', redirectTo:''}
]

@NgModule({
  declarations: [
    AppComponent,
    AuthorizationComponent,
    CallbackComponent,
    AppCoreComponent,
    MediaPlayerComponent,
    NavbarComponent,
    CurrentTrackInfoComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes),
    StoreModule.forRoot({auth: authReducer, media: mediaReducer}),
    EffectsModule.forRoot([AuthEffects]),
    MDBBootstrapModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
