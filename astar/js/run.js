$(document).ready(function(){
	dbg = $('#debug');

	var astar = new AStar(100,100, true);
	var renderer = new AStarRenderer("#container", astar);
	for (var i = astar.grid.length - 1; i >= 0; i--) {
		if(Math.random() < 0.3) renderer.block(i);
	};
	renderer.drawGrid();

	$('#btn-debug').click(function(){
		if(dbg.css('visibility') == 'hidden') dbg.css('visibility', 'visible');
		else dbg.css('visibility', 'hidden');
	});
	$('#btn-mode').click(function(){
		if(renderer.mode == 'block') renderer.mode = 'start';
		else if(renderer.mode == 'start') renderer.mode = 'end';
		else if(renderer.mode == 'end') renderer.mode = 'block';

		l('mode', renderer.mode);
	});

});
