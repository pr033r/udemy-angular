import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from './user.model';

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly signUpEndpoint =
    'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' +
    environment.firebaseAPIKey;
  private readonly signInEndpoint =
    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' +
    environment.firebaseAPIKey;

  public readonly errorMessages: { [key: string]: string } = {
    EMAIL_EXISTS: 'The email address is already in use by another account.',
    OPERATION_NOT_ALLOWED: 'Password sign-in is disabled for this project.',
    TOO_MANY_ATTEMPTS_TRY_LATER:
      'We have blocked all requests from this device due to unusual activity. Try again later.',
    EMAIL_NOT_FOUND:
      'There is no user record corresponding to this identifier. The user may have been deleted.',
    INVALID_PASSWORD:
      'The password is invalid or the user does not have a password.',
    USER_DISABLED: 'The user account has been disabled by an administrator.',
  };

  // BehaviorSubject gives to subscribers imediate access to previous value
  // even when they didn't subscribe at the point when the value was emitted
  userSub = new BehaviorSubject<User | null>(null);
  private autoSignOutTimer: any;

  constructor(private http: HttpClient, private router: Router) {}

  autoSignIn() {
    const storageData = localStorage.getItem('userData');

    if (!storageData) {
      return;
    }

    const userData = this.getStorageUserData(storageData);
    if (userData.token) {
      this.userSub.next(userData);
      return;
    }
    this.userSub.next(null);
  }

  autoSignOut(duration: number) {
    this.autoSignOutTimer = setTimeout(() => {
      this.signOut();
    }, duration);
  }

  signIn(email: string, password: string) {
    const { handleErr, handleAuth } = this.bindedHandlers();
    return this.http
      .post<AuthResponseData>(this.signInEndpoint, {
        email,
        password,
        returnSecureToken: true,
      })
      .pipe(catchError(handleErr), tap(handleAuth));
  }

  signUp(email: string, password: string) {
    const { handleErr, handleAuth } = this.bindedHandlers();
    return this.http
      .post<AuthResponseData>(this.signUpEndpoint, {
        email,
        password,
        returnSecureToken: true,
      })
      .pipe(catchError(handleErr), tap(handleAuth));
  }

  signOut() {
    this.userSub.next(null);
    localStorage.removeItem('userData');
    this.router.navigate(['/auth']);
    if (this.autoSignOutTimer) {
      clearTimeout(this.autoSignOutTimer);
      this.autoSignOutTimer = null;
    }
  }

  private bindedHandlers() {
    const handleErr = this.handleError.bind(this);
    const handleAuth = this.handleAuthentication.bind(this);
    return { handleErr, handleAuth };
  }

  private handleError(res: HttpErrorResponse) {
    if (res.error || res.error.error) {
      // with this.errorMessages{...} we will access to this scope of the callback
      // hence it won't work, so static must be used
      return throwError(this.errorMessages[res.error.error.message]);
    }
    return throwError('An unknown error occured.');
  }

  private handleAuthentication(res: AuthResponseData) {
    const expirationDate = new Date(
      new Date().getTime() + parseInt(res.expiresIn) * 1000
    );
    const user = new User(res.email, res.localId, res.idToken, expirationDate);
    this.userSub.next(user);
    this.autoSignOut(parseInt(res.expiresIn) * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private getStorageUserData(storageData: string) {
    const storageUser: {
      email: string;
      id: string;
      _token: string;
      _tokenExpirationDate: Date;
    } = JSON.parse(storageData);

    const userData = new User(
      storageUser.email,
      storageUser.id,
      storageUser._token,
      storageUser._tokenExpirationDate
    );
    const duration = new Date(storageUser._tokenExpirationDate).getTime() - new Date().getTime();
    this.autoSignOut(duration);
    return userData;
  }
}
