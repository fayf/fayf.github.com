/**
 * A* for hex grid
 */
var numSortFn = function sortNumber(a,b) {return a-b;};
function AStar(width, height, memoize, debug){
	this.debug = debug || false;
	this.w = width;
	this.h = height;
	this.last = width*height-1;
	this.grid = new Array(width*height);

	if(memoize) this.memo = [];

	this.neighbourReject = (function(width){
		if(width == 1) return function(c, x){
			return (c == x || Math.abs(c-x)>1);
		}
		if(width == 2) return function(c, x){
			if(x%2 == 0 && (c > x+3 || c < x-2)) return true;
			if(x%2 == 1 && !(c == x-2 || c == x-1 || c == x+2)) return true;
			return false;
		}
		return function(c, x){
			if(x%this.w == 0 && c%this.w == this.w-1) return true; //start of row, discount end of row
			if(x%this.w == this.w-1 && c%this.w == 0) return true; //end of row, discount start of row
			return false;
		}
	})(this.w);

	this.init();
}

AStar.prototype = {
	getNeighbours: function(x){
		if(this.memo){
			if(this.memo[x]) return this.memo[x];
			else{
				this.memo[x] = this.neighbours(x);
				return this.memo[x];
			}
		}else{
			return this.neighbours(x);
		}
	},

	neighbours: function(x){
		var n = [];

		if(x < 0 || x > this.last) return n; //out of bounds

		var evenRow = Math.floor(x/this.w)%2 == 0;
		var candidates = [
			x-1, x+1, //left, right
			x-this.w, x-this.w+(evenRow?-1:1), //above
			x+this.w, x+this.w+(evenRow?-1:1) //below
		];

		for (var i = candidates.length - 1; i >= 0; i--) {
			var c = candidates[i];
			if(c < 0 || c > this.last //out of bounds
				|| this.neighbourReject(c, x)
				|| n.indexOf(c)>=0)
				continue;
			n.push(c);
		};

		return n.sort(numSortFn);
	},

	g_fn: function(n1, n2){
		return 1; //optimization - only called between neighbours
	},

	h_fn: function(node, goal){
		//Manhattan distance
		if(node == goal) return 0;
		var i1 = node.i,
			i2 = goal.i,
			x1 = i1%this.w,
			x2 = i2%this.w,
			y1 = Math.floor(i1/this.w),
			y2 = Math.floor(i2/this.w),
			dx = x2-x1,
			dy = y2-y1
			same = (dx >= 0 && dy >=0) || (dx < 0 && dy < 0);

		return same?
			Math.max(Math.abs(dx), Math.abs(dy)):
			Math.abs(dx) + Math.abs(dy);
	},

	path: function(start, goal){
		var open = new BinaryHeap(function(node){return node.f;});
		open.push(this.grid[start]);

		while(open.size() > 0){
			var current = open.pop();
			this.debug && console.log('current', current);
			if(current == this.grid[goal]){
				var path = [];
				while(current.from){
					path.push(current.i);
					current = current.from;
				}
				path.push(current.i);
				return path.reverse();
			}

			current.closed = true;

			var neighbour_indices = this.getNeighbours(current.i);
			this.debug && console.log('neighbours', neighbour_indices);
			for (var i = neighbour_indices.length - 1; i >= 0; i--) {
				var neighbour = this.grid[neighbour_indices[i]];
				this.debug && console.log('neighbour', neighbour);
				if(neighbour.closed || neighbour.blocked) continue;

				var g = current.g + this.g_fn(current, neighbour);
				if(!neighbour.considered || g < neighbour.g){
					neighbour.g = g;
					neighbour.f = g + (neighbour.h || this.h_fn(neighbour, this.grid[goal]));

					if(!neighbour.considered){
						neighbour.considered = true;
						neighbour.from = current;
						open.push(neighbour);
					}else{
						open.rescoreElement(neighbour);
					}
				}

				this.debug && console.log('open', open.content);
			}

		}
	},

	init: function(){
		for (var i = this.grid.length - 1; i >= 0; i--) {
			this.grid[i] = {
				i: i,
				g: 0,
				closed: false,
				considered: false,
				blocked: false,
				from: null
			}
		};
	},
}
