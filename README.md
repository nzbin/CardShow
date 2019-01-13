# CardShow

CardShow is a jQuery plugin of drawing cards. It is more like a game.

Online Demo: [https://nzbin.github.io/CardShow](https://nzbin.github.io/CardShow)

## Browser Support

IE | Edge | Firefox | Chrome | Safari | Opera
--- | --- | --- | --- | --- | ---
9+ ✔ | 12+ ✔ | 10+ ✔ | 12+ ✔ | 4+ ✔ | 15+ ✔

## Usage

### Include files

```html
<link href="/path/to/cardshow.css" rel="stylesheet">

<script src="/path/to/modernizr-custom.js"></script>
<script src="/path/to/jquery.js"></script>
<script src="/path/to/jquery.cardshow.js"></script>
```

### Html structure

```html
<ul class="card-container card-perspective">
  <li class="card card-flip">
    <figure class="card-front">
      <img src="img/1.jpg"/>
      <figcaption>about</figcaption>
    </figure>
    <div class="card-back"></div>
  </li>
</ul>
```

### Call plugin

```js
$('.card-container').cardshow({
  src: data,
  autoDrawing: true,
  backface: true,
  rows: 1,
  drawingCardsNum: 3,
  drawingRounds: 0,
  drawingSpeed: 300
});
```

## Options

- **src** `String`

  Default `''`, The user data, you should set it as required.

- **autoDrawing** `Boolean`

  Default `true`, automatic drawing or manual drawing.

- **backface** `Boolean`

  Default `true`, if show the back of cards with their entrance.

- **rows** `Number`

  Default `1`, arrange the cards with multiple lines.

- **drawingCardsNum** `Number`

  Default `1`, the number of drawing cards in every round.

- **drawingRounds** `Number`

  Default `0` (no limit), the rounds of drawing cards.

- **drawingSpeed** `Number`

  Default `300`, the speed of automatic drawing.

## License

MIT License

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
