$(function () {
    $(".vierGewinnt").vierGewinnt();
});
$(document).ready(function () {

	vierGewinnt = $.fn.game()[0];

	var socket = io.connect('http://localhost:81');

    $("#intro .btn-player").on("click", onBtnPlayerClick);

    function onBtnPlayerClick(e) {
        $("#intro .btn-player").off("click", onBtnPlayerClick);
        $("#intro").removeClass("active");
        var name = "player1";
        if ($("#playerNameInput").val()) {
            name = $("#playerNameInput").val();
        }
        socket.emit('newPlayerName', { name:name });
        e.preventDefault();
    }


    $("#hiddenInputTurn").on('change', function () {
        socket.emit('turn', {turn:($(this).val()),
            column:$("#hiddenInputDx").val()});
    });

    $("#hiddenInputWinner").on('change', function () {
        console.log('Winner Send!');
        socket.emit('winner', {name:'somebody'});
		
        $('.vierGewinnt').append("<div id='gewinner'></div>");
		$("#gewinner").append("<div id='playAgain'><p>Neu!</p></div>").append("<div id='quitPlaying'><p>Quit</p></div>");
		$("#gewinner").hide();
	    $('#playAgain').on('click', function (e) {
		    console.log("hi");
		    e.preventDefault();
		    $("#gewinner").hide();
		    $("#showList").addClass("active");
			$(".vierGewinnt>.container").remove();
		    socket.emit('stopclear',{});
		    socket.emit('findGame', {});
		    vierGewinnt.clearField();
		    $(".vierGewinnt").vierGewinnt();
		    vierGewinnt=$.fn.game()[0];
	    });

	    $('#quitPlaying').on('click', function (e) {
		    console.log("hi");
		    $('#intro').addClass("active");
			$(".vierGewinnt>.container").remove();
		    vierGewinnt.clearField();
		    $(".vierGewinnt").vierGewinnt();
		    vierGewinnt=$.fn.game()[0];
	    });
    });

    $("#searchGame").on("click", function () {
        socket.emit('findGame', { my:'data' });
    });

    $("#playerNameInput").bind('keypress', function (e) {
        if (e.keyCode == 13) {
            var name = "player1";
            if ($("#playerNameInput").val()) {
                name = $("#playerNameInput").val();
            }
            socket.emit('newPlayerName', { name:name });
            $("#intro").removeClass("active");
        }
    });

    socket.on('server ready', function (data) {
        console.log('Socket Connection achieved');
    });

    socket.on('availableGames', function (data) {
        $("#listGames").empty();
        var games = data.name;
        for (var i in games) {
            $("#listGames").append('<p id=' + i + '>' + games[i].clientname + '</p>');
            $('#' + i).on('click', function (e) {
                var test = $(this).html();
                socket.emit('sendRequest', { name:test });
            });
        }
    });

    $('#playAgain').on('click', function (e) {
	    console.log("hi");
        e.preventDefault();
        $("#showList").addClass("active");
        socket.emit('stopclear',{});
        socket.emit('findGame', {});
		vierGewinnt.clearField();
	    $(".vierGewinnt").vierGewinnt();
	    vierGewinnt=$.fn.game()[0];
    });

    $('#quitPlaying').on('click', function (e) {
	    console.log("hi");
	    $('#intro').addClass("active");
	    vierGewinnt.clearField();
	    $(".vierGewinnt").vierGewinnt();
	    vierGewinnt=$.fn.game()[0];
    });

    socket.on('showListActive', function (data) {
        $("#showList").addClass("active");

    });

    socket.on('availablePlayer', function (data) {
        console.log(data);
        $("#enemyPlayer").empty();
        var availablePlayers = data.name;
        for (var i in availablePlayers) {
            $("#enemyPlayer").append('<p id=\'enemy\'>' + availablePlayers[i].clientname + '</p>');
            $("#enemy").on("click", function (e) {
                e.preventDefault();
                var test = $(this).html();
                $("#showList").removeClass("active");
	            vierGewinnt.setTurnFlag(false);
                socket.emit('wantToPlay', { name:test });
            });
        }
    });

    socket.on('getEnemyToken', function (data) {
        vierGewinnt.setToken(parseInt(data.column), parseInt(data.turn));
    });
    socket.on('hideShowList', function (data) {
        $("#showList").removeClass("active");
    });

    socket.on('activeShowList', function (data) {
        $("#showList").addClass("active");
    });

});