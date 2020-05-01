```html
<wl-router>
  <wl-route component="page-tabs">
    <wl-route url="/schedule" component="tab-schedule">
      <wl-route component="page-schedule"></wl-route>
      <wl-route url="/session/:sessionId" component="page-session"></wl-route>
    </wl-route>

    <wl-route url="/speakers" component="tab-speaker">
      <wl-route component="page-speaker-list"></wl-route>
      <wl-route url="/session/:sessionId" component="page-session"></wl-route>
      <wl-route url="/:speakerId" component="page-speaker-detail"></wl-route>
    </wl-route>

    <wl-route url="/map" component="page-map"></wl-route>
    <wl-route url="/about" component="page-about"></wl-route>
  </wl-route>

  <wl-route url="/tutorial" component="page-tutorial"></wl-route>
  <wl-route url="/login" component="page-login"></wl-route>
  <wl-route url="/account" component="page-account"></wl-route>
  <wl-route url="/signup" component="page-signup"></wl-route>
  <wl-route url="/support" component="page-support"></wl-route>
</wl-router>
```
