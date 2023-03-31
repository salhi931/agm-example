import {Component, OnInit} from '@angular/core';

declare const google: any;


@Component({
  selector: 'app-agm-example',
  templateUrl: './agm-example.component.html',
  styleUrls: ['./agm-example.component.css'],
})
export class AgmExampleComponent implements OnInit {
  lat = 20.5937;
  lng = 78.9629;
  pointList: { lat: number; lng: number }[] = [];
  drawingManager: any;
  selectedShape: any;
  selectedArea = 0;

  constructor() {
  }

  ngOnInit() {
    this.setCurrentPosition();
  }

  onMapReady(map) {
    this.initDrawingManager(map);
  }

  initDrawingManager = (map: any) => {
    const self = this;
    const options = {
      drawingControl: true,
      drawingControlOptions: {
        drawingModes: ['rectangle'], // change 'polygon' to 'rectangle'
      },
      rectangleOptions: { // add this option
        draggable: true,
        editable: true,
      },
      drawingMode: google.maps.drawing.OverlayType.RECTANGLE, // set drawing mode to 'RECTANGLE'
    };
    this.drawingManager = new google.maps.drawing.DrawingManager(options);
    this.drawingManager.setMap(map);
    google.maps.event.addListener(
      this.drawingManager,
      'overlaycomplete',
      (event) => {
        if (event.type === google.maps.drawing.OverlayType.RECTANGLE) { // check for RECTANGLE type
          const bounds = event.overlay.getBounds();
          self.updatePointList(bounds);
          this.selectedShape = event.overlay;
          this.selectedShape.type = event.type;
        }
        if (event.type !== google.maps.drawing.OverlayType.MARKER) {
          // Switch back to non-drawing mode after drawing a shape.
          self.drawingManager.setDrawingMode(null);
          // To hide:
          self.drawingManager.setOptions({
            drawingControl: false,
          });
        }
      }
    );
  }

  private setCurrentPosition() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });
    }
  }

  updatePointList(bounds) {
    this.pointList = [
      {lat: bounds.getNorthEast().lat(), lng: bounds.getNorthEast().lng()},
      {lat: bounds.getSouthWest().lat(), lng: bounds.getSouthWest().lng()},
    ];
    this.selectedArea = google.maps.geometry.spherical.computeArea(
      this.getRectanglePath(bounds)
    );
  }

  getRectanglePath(bounds) {
    const northEast = bounds.getNorthEast();
    const southWest = bounds.getSouthWest();
    const path = new google.maps.MVCArray();
    path.push(northEast);
    path.push({lat: northEast.lat(), lng: southWest.lng()});
    path.push(southWest);
    path.push({lat: southWest.lat(), lng: northEast.lng()});
    return path;
  }

  deleteSelectedShape() {
    if (this.selectedShape) {
      this.selectedShape.setMap(null);
      this.selectedArea = 0;
      this.pointList = [];
      // To show:
      this.drawingManager.setOptions({
        drawingControl: true,
      });
    }
  }
}
