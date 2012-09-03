var dbg;
function l(){
	var str = "";
	for (var i = 0; i < arguments.length; i++) {
		if(!arguments[i]) continue;
		if(arguments[i].constructor.name == 'Array'){
			var arrStr = "[";
			for (var j = 0; j < arguments[i].length; j++) {
				arrStr += arguments[i][j].toString() + " ";
			};
			str += arrStr.trim() + "]";
		}else{
			str += arguments[i].toString();
		}
		if(i != arguments.length-1) str += " ";
	};
	dbg.html(str.trim());
}

AStarRenderer.W = 8;
function AStarRenderer(containerSelector, astar){
	this.container = $(containerSelector);
	this.astar = astar;
	this.divs = [];
	this.path = null;

	this.start = -1;
	this.end = -1;

	this.mode = 'block';
	this.blocked = [];

	this.container.width((this.astar.w*1.5*AStarRenderer.W + AStarRenderer.W/2) + "px");

	var css = $('#css');
	css.html("div.node{ font-size:"+AStarRenderer.W+"px;line-height:"+AStarRenderer.W+"px; width: "+AStarRenderer.W+"px; height: "+AStarRenderer.W+"px; background: yellow; margin-left: "+(AStarRenderer.W/2)+"px; float: left;} div.break{ height: "+(AStarRenderer.W/2)+"px; clear:both;} div.even + div.node{ margin-left: "+(AStarRenderer.W/4*3)+"px; }");
}

AStarRenderer.update = function(event){
	var renderer = event.data,
		astar = renderer.astar,
		id = $.data($(this).get(0), 'id');
	switch(renderer.mode){
	case 'block':
		$(this).toggleClass('blocked');
		astar.grid[id].blocked = !astar.grid[id].blocked;
		renderer.blocked[id] = astar.grid[id].blocked;
		break;
	case 'start':
		if(renderer.start >= 0) renderer.divs[renderer.start].removeClass('start');
		renderer.start = id;
		$(this).addClass('start');
		break;
	case 'end':
		if(renderer.end >= 0) renderer.divs[renderer.end].removeClass('end');
		renderer.end = id;
		$(this).addClass('end');
		break;
	}

	console.log('clicked', id);
	if(renderer.path){
		for (var i = renderer.path.length - 1; i >= 0; i--) {
			renderer.divs[renderer.path[i]].removeClass('path');
		};
	}
	if(renderer.start >= 0 && renderer.end >= 0){
		astar.init();
		for (var i = astar.grid.length - 1; i >= 0; i--) {
			astar.grid[i].blocked = renderer.blocked[i];
		};
		var now = new Date();
		var path = astar.path(renderer.start, renderer.end);
		var duration = new Date() - now;
		l(duration, path);
		renderer.drawPath(path);
		renderer.updateScores(path == undefined);
	}
}

AStarRenderer.prototype.drawGrid = function() {
	for (var i = 0; i < this.astar.grid.length; i++) {
		var node = this.astar.grid[i];

		var el = $('<div/>', {
			class: 'node' + (node.blocked?' blocked':''),
		})
		.click(this, AStarRenderer.update);

		$.data(el.get(0), 'id', i);
		el.appendTo(this.container);
		this.divs.push(el);
		this.blocked.push(node.blocked);

		if(i%this.astar.w == this.astar.w-1){
			var clazz;
			if(Math.floor(i/this.astar.w)%2 == 0) clazz = 'break even';
			else clazz = 'break odd';

			var b = $('<div/>', {
				class: clazz,
			});
			b.appendTo(this.container);
		}
	};
};

AStarRenderer.prototype.block = function(i) {
	this.astar.grid[i].blocked = true;
	this.blocked[i] = true;
};

AStarRenderer.prototype.updateScores = function(reset) {
	for (var i = this.divs.length - 1; i >= 0; i--) {
		this.divs[i].html(reset?'':this.astar.grid[i].f || '');
	};
};

AStarRenderer.prototype.drawPath = function(path) {
	this.path = path;
	if(path)
		for (var i = path.length - 1; i >= 0 ; i--){
			if(i == 0) this.divs[path[i]].addClass('start');
			else if(i == path.length - 1) this.divs[path[i]].addClass('end');
			else this.divs[path[i]].addClass('path');
		}
			
};
