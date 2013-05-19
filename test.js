module.exports = {
	name : "notSet",

	destroyMe : function(obj) {
    	for (i in games) {
        	if (games[i] === obj) {
            	games.splice (i, 1);
            	//console.log("deleted");
            	//console.log(games);
        	}
    	}
	},
	destroyMeStage2 : function(obj) {
    	for (i in availablePlayers) {
        	if (availablePlayers[i] === obj) {
            	availablePlayers.splice (i, 1);
        	}
    	}
	},
	getAddress : function(obj) {
		for (i in games) {
			if(games[i].clientname==obj) {
				return games[i].address;
			}
		}
		return false;
	},
	searchList : function(array,obj) {
		if(array.length == 0) {
			return false;
		}
		for (i in array) {
		//check if the same username as i am
			if(array[i].clientname==obj.clientname) {
				return true;
			}
		}
		return false;
	},
	getPlayer : function(player) {
		HOST = this.getAddress(player);
    }
}

	