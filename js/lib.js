(function ($) {
	jQuery.fn.vierGewinnt = function () {

		if (!Function.prototype.bind) {
			Function.prototype.bind = function (scope) {
				var f = this;

				return function () {
					f.apply(scope, arguments);
				}
			}
		}

		var koordinates = {
			x:new Array(),
			y:new Array()
		}

		var tempObj = {
			sTurn  :-1,
			counter:0
		}

		var VierGewinnt = function (config) {
			this.view = config.view;

			this.columns = config.columns;
			this.rows = config.rows;

			this.winTokens = config.winnerToken;

			this.gamearray = new Array(this.columns);

			this.initializeGame();

			this.width = this.gameTable.width() / this.columns;

			this.dx;
			this.turn = -1;

			this.winnerFlag = false;

			this.turnFlag = true;
		}

		VierGewinnt.prototype.initializeGame = function () {
			this.view.append("<div class='container' style='width:" + this.columns * 100 + "px;height: 100px'></div>")
			for (var i = 1; i <= this.columns; i++) {
				$(".container").append("<div class ='simulationToken' id='simulation" + i + "'><div class='token yellow_case' id='token" + i + "' style='position:absolute;left:" + (i * 100 - 100) + "px;'></div></div>");
			}
			for (var i = 1; i <= this.columns; i++) {
				$('#simulation' + i).hide();
			}

			this.view.append("<div id='clear'></div> <div class=gameTable style='width:" + this.columns * 100 + "px;height:" + this.rows * 100 + "px'></div>");
			this.gameTable = this.view.find(".gameTable");
			for (var i = 1; i <= this.columns; i++) {
				this.gamearray[i] = new Array(this.rows);
			}

			for (var i = 1; i <= this.columns; i++) {
				this.gameTable.append("<aside class='column' id='column" + i + "'></aside>");
			}

			$('.column').each(function () {
				$(this).hover(function () {
						var id = this.id.charAt(6);
						$("#simulation" + id).show();
						set = setTimeout(function(){
							$("#simulation" + id).addClass('bounce');
						},3000);
					},
					function () {
						var id = this.id.charAt(6);
						$("#simulation" + id).hide();
						clearTimeout(set);
						$("#simulation" + id).removeClass('bounce');
					});
			});

			for (var i = 1; i <= this.columns; i++) {
				for (var j = 1; j <= this.rows; j++) {
					$("#column" + i).append("<div id='field' data-column='" + i + "' data-row='" + j + "'><div class='token undefined'></div></div>")
					this.gamearray[i][j] = 0;
				}
			}

			this.gameTable.on('mousedown', this.onMouseDown.bind(this));
		}

		VierGewinnt.prototype.setToken = function (column, sandrasturn) {
			if (!this.winnerFlag) {
				if (sandrasturn > tempObj.sTurn && !this.turnFlag) {
					tempObj.sTurn = sandrasturn;

					for (var i = this.rows; i > 0; i--) {
						if (this.gamearray[column][i] == 0) {
							this.gamearray[column][i] = "red";
							this.turnFlag = true;

							this.gameTable.append("<div class='token red' id='" + column + i + "' data-column='" + column + "' data-row='" + i + " 'style='position:absolute;'></div>");
							$("#" + column + i).css({
								left   :column * 100 - 100,
								top    :parseInt(i * 100 - 100) - this.gameTable.height() / this.columns * i,
								display:'block',
								opacity:0.5
							}).animate({
									left   :column * 100 - 100,
									top    :parseInt(i * 100 - 100),
									opacity:1
								}, 1000, 'easeOutBounce');

							if (this.gamearray[column][i] == this.gamearray[column][this.rows / this.rows]) {
								this.giveColumnOpacity(column);
							}

							this.findWinner(column, i, 'Other player has won');
							this.foundWinnerRed();
							this.highlightTokenRed();

							break;
						}
					}
				}

			}
		}

		VierGewinnt.prototype.giveColumnOpacity = function (dx) {
			console.log(dx);
			if (this.gamearray[dx][this.rows / this.rows] == "yellow" || this.gamearray[dx][this.rows / this.rows] == "red") {
				$("#column" + this.dx).css({ opacity:0.2 }).animate({opacity:0.5}, 'linear');
			}
		}

		VierGewinnt.prototype.setTurnFlag = function (status) {
			this.turnFlag = status;
		}

		VierGewinnt.prototype.onMouseDown = function (e) {

			if (this.turnFlag) {
				this.turn++;

				e.preventDefault();

				this.dx = Math.floor((e.pageX - this.gameTable.offset().left) / this.width + 1);
				$("#hiddenInputDx").val(this.dx);
				$("#hiddenInputTurn").val(this.turn);
				$("#hiddenInputTurn").trigger('change');

				for (var i = this.rows; i > 0; i--) {

					if (this.gamearray[this.dx][i] == 0) {
						this.turnFlag = false;
						this.gamearray[this.dx][i] = "yellow";

						this.gameTable.append("<div class='token yellow' id='" + this.dx + i + "' data-column='" + this.dx + "' data-row='" + i + " 'style='position:absolute;'></div>");
						$("#" + this.dx + i).css({
							left   :this.dx * 100 - 100,
							top    :parseInt(i * 100 - 100) - this.gameTable.height() / this.columns * i,
							display:'block',
							opacity:0.5
						}).animate({
								left   :this.dx * 100 - 100,
								top    :parseInt(i * 100 - 100),
								opacity:1
							}, 1000, 'easeOutBounce');

						if (this.gamearray[this.dx][i] == this.gamearray[this.dx][this.rows / this.rows]) {
							this.giveColumnOpacity(this.dx);
						}

						this.findWinner(this.dx, i, 'I have won!');
						this.foundWinnerYellow();
						this.highlightTokenYellow();
						break;
					}
				}
			}
		}

		VierGewinnt.prototype.findWinner = function (x, y, who) {

			if (!this.winnerFlag) {
				for (var i = -1; i < 2; i++) {
					for (var j = -1; j < 2; j++) {
						if ((i != 0 || j != 0) && ((x + i) <= this.columns) && ((x + i) >= 1) && ((y + j) <= this.rows) && ((y + j) >= 1)) {
							var depth = 1;
							depth += this.findWinnerDirection(x, y, i, j);
							depth += this.findWinnerDirection(x, y, -i, -j);
							if (depth >= 4) {
								this.getWinnerToken(x, y, i, j);
								this.getWinnerToken(x, y, -i, -j);
								console.log(this.koordinates);
								console.log(koordinates);
								console.log(koordinates.x);
								console.log(koordinates.y);
								$("#gewinner").html("<p>" + who + "</p>");

								return this.winnerFlag = true;
							}
							else {
								return this.winnerFlag = false;
							}
						}
					}
				}
			}
		}

		VierGewinnt.prototype.findWinnerDirection = function (x, y, gox, goy) {
			var depth = 0;
			while ((x + gox) < (this.columns + 1) && (x + gox) >= 1 && (y + goy) < (this.rows + 1) && (y + goy) >= 1 && this.gamearray[x][y] == this.gamearray[x + gox][y + goy]) {
				x = x + gox;
				y = y + goy;
				depth++;
			}
			return depth;
		}

		VierGewinnt.prototype.getWinnerToken = function (x, y, gox, goy) {
			tempObj.counter = 0;
			while ((x + gox) < (this.columns + 1) && (x + gox) >= 1 && (y + goy) < (this.rows + 1) && (y + goy) >= 1 && this.gamearray[x][y] == this.gamearray[x + gox][y + goy]) {
				tempObj.counter++;
				koordinates.x.push(x);
				koordinates.y.push(y);
				x = x + gox;
				y = y + goy;
			}
			koordinates.x.push(x);
			koordinates.y.push(y);

		}

		VierGewinnt.prototype.highlightTokenYellow = function () {
			if (tempObj.counter >= this.winTokens / 2) {
				for (var i = 0; i < koordinates.x.length; i++) {
					$("#" + koordinates.x[i] + koordinates.y[i]).css("background", "green").addClass('pulseY');
				}
			}
		}

		VierGewinnt.prototype.highlightTokenRed = function () {
			if (tempObj.counter >= this.winTokens / 2) {
				for (var i = 0; i < koordinates.x.length; i++) {
					$("#" + koordinates.x[i] + koordinates.y[i]).css("background", "green").addClass('pulseR');
				}
			}
		}


		VierGewinnt.prototype.foundWinnerYellow = function () {
			if (this.winnerFlag) {
				this.highlightTokenYellow();
				this.stopGame();
			}
		}

		VierGewinnt.prototype.foundWinnerRed = function () {
			if (this.winnerFlag) {
				this.highlightTokenRed();
				this.stopGame();
			}
		}

		VierGewinnt.prototype.stopGame = function () {
			$("#hiddenInputWinner").trigger('change');
			this.gameTable.unbind();
			this.gameTable.css("cursor", "default");

			$('.column').each(function () {
				$('.simulationToken').hide();
				$(this).unbind('mouseenter mouseleave');
			});

			$("#gewinner").show();
		}

		VierGewinnt.prototype.restart = function () {
			this.clearField();
			this.initializeGame();
		}

		VierGewinnt.prototype.clearField = function () {
			this.gameTable.remove();
		}

		var game = [];

		$('.vierGewinnt').each(function () {
			var vierGewinnt = $(this);
			game.push(new VierGewinnt({
				view       :vierGewinnt,
				winnerToken:4,
				columns    :7,
				rows       :6
			}))
		});
		$.fn.game = function () {
			return game;
		}


	}
})
	(jQuery);