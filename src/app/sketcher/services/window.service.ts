import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
function _window(): any {
  return window;
}
@Injectable()
export class WindowRef {
  get nativeWindow(): any {
    return _window();
  }

  public resizeStream = Observable.fromEvent(_window(), 'resize');

}
