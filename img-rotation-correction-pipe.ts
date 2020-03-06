import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/bindcallback';

const rotation = {
  1: 'rotate(0deg)',
  3: 'rotate(180deg)',
  6: 'rotate(90deg)',
  8: 'rotate(270deg)'
};

@Pipe({
  name: 'img-rotation-correction'
})
export class ImgRotationCorrectionPipe implements PipeTransform {

  constructor(private domSanitizer: DomSanitizer) {}

  public transform(image: Blob): Observable<string> {
    const orientation = Observable.bindCallback<string>(this.orientation.bind(this, image));
    return orientation();
  }
  
  /**
   * This method reads Blob and searches for EXIF tag
   * Returns css rotation(deg) string with correct calculated value
   */
  orientation = (file: Blob, callback: any) => {
    const fileReader = new FileReader();

    fileReader.onloadend = () => {
      const scanner = new DataView(fileReader.result as ArrayBuffer)
      let idx = 0;
      let value = 1; // Non-rotated is the default
      if ((fileReader.result as string).length < 2 || scanner.getUint16(idx) !== 0xFFD8) {
        // Not a JPEG
        if (callback) {
          const rotationCss = this.domSanitizer.bypassSecurityTrustStyle(rotation[value]);
          callback(rotationCss);
        }
        return
      }
      idx += 2;
      let maxBytes = scanner.byteLength;
      while (idx < maxBytes - 2) {
        const uint16 = scanner.getUint16(idx);
        idx += 2;
        switch (uint16) {
          case 0xFFE1: // Start of EXIF
            const exifLength = scanner.getUint16(idx);
            maxBytes = exifLength - idx;
            idx += 2;
            break;
          case 0x0112: // Orientation tag
            // Read the value, its 6 bytes further out
            value = scanner.getUint16(idx + 6, false);
            maxBytes = 0; // Stop scanning
            break;
        }
      }
      if (callback) {
        const rotationCss = this.domSanitizer.bypassSecurityTrustStyle(rotation[value]);
        callback(rotationCss);
      }
    }
    fileReader.readAsArrayBuffer(file)
  }
}
