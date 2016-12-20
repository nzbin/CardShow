# CardShow

CardShow is a jQuery plugin of drawing cards.

## Browser Support
IE9+ / Edge / FireFox 3.5+ / Chrome / Safari / Opera 11.5+

## Options

- __src__: ```String``` The data of user,you should set it as required.
- __autoDrawing__: ```Boolean``` Default true,automatic drawing or manual drawing.
- __backface__: ```Boolean``` Default true,if show the back of cards with their entrances.
- __rows__: ```Number``` Default 1,arrange the cards with multiple lines.
- __drawingCardsNum__: ```Number``` Default 1,the number of drawing cards every round.
- __drawingRounds__: ```Number``` Default 0 (no limit),the rounds of drawing cards.
- __drawingSpeed__: ```Number``` Default 300,the speed of automatic drawing.

## Usage

### html structure of card:
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

### instance:
```js
var cardshow = $('.card-container').cardshow({
	src: data,
	autoDrawing: true,
	backface: true,
	rows: 1,
	drawingCardsNum: 3,
	drawingRounds: 0,
	drawingSpeed: 300
});
```


## Demo

[https://nzbin.github.io/CardShow](https://nzbin.github.io/CardShow)

## License

MIT License

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
