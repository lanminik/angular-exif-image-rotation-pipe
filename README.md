# angular-exif-image-rotation-pipe
This angular 2+ pipe solves EXIF images rotation problem.

Example:
<img [src]="url" [style.transform]="blobImg | img-rotation-correction | async">
