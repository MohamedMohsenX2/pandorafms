// Pandora FMS - http://pandorafms.com
// ==================================================
// Copyright (c) 2005-2010 Artica Soluciones Tecnologicas
// Please see http://pandorafms.org for full contribution list

// This program is free software; you can redistribute it and/or
// modify it under the terms of the  GNU Lesser General Public License
// as published by the Free Software Foundation; version 2

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

/*-------------------Constructor-------------------*/
var MapController = function(target) {
	this._target = target;
	
	this._id = $(target).data('id');
	this._tooltipsID = [];
}

/*--------------------Atributes--------------------*/

MapController.prototype._id = null;
MapController.prototype._tooltipsID = null;
MapController.prototype._viewport = null;
MapController.prototype._zoomManager = null;

/*--------------------Methods----------------------*/
/*
Function init_map
Return void
This function init the map
*/
MapController.prototype.init_map = function() {
	var self = this;
	
	var svg = d3.select(this._target + " svg");
	
	self._zoomManager = 
		d3.behavior.zoom().scaleExtent([1/100, 100]).on("zoom", zoom);
	
	self._viewport = svg
		.call(self._zoomManager)
		.append("g")
			.attr("class", "viewport");
	
	
	function zoom() {
		self.tooltip_map_close();
		
		var zoom_level = d3.event.scale;
		if (zoom_level == 1) {
			zoom_level = 0;
		}
		else if (zoom_level < 1) {
			zoom_level = (-zoom_level) * 100;
		}
		
		slider.property("value", zoom_level);
		
		self._viewport
			.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}
	
	function home_zoom(d) {
		console.log(888);
	}
	
	function slided(d) {
		//~ var zoom_level = d3.select(this).property("value");
		//~ 
		//~ if (zoom_level == 0) {
			//~ zoom_level = 1;
		//~ }
		//~ else if (zoom_level < 0) {
			//~ zoom_level = 1 / (-zoom_level);
		//~ }
		//~ 
		//~ self._zoomManager.scale(zoom_level)
			//~ .event(svg);
	}
	
	var slider = d3.select("#map .zoom_controller .vertical_range")
		.attr("value", self._zoomManager.scaleExtent()[0])
		.attr("min", -self._zoomManager.scaleExtent()[1])
		.attr("max", self._zoomManager.scaleExtent()[1])
		.attr("step", (self._zoomManager.scaleExtent()[1] - self._zoomManager.scaleExtent()[0]) / 100)
		.on("input", slided);
	
	
	d3.select("#map .zoom_controller .home_zoom")
		.on("onclick", home_zoom);
	
	
	
	self.paint_nodes();
	
	this.init_events();
};

/*
Function paint_nodes
Return void
This function paint the nodes
*/
MapController.prototype.paint_nodes = function() {
	
	this._viewport.selectAll(".node")
		.data(nodes)
			.enter()
				.append("g")
					.attr("transform",
						function(d) { return "translate(" + d['x'] + " " + d['y'] + ")";})
					.append("circle")
						.attr("id", function(d) { return "node_" + d['id'];})
						.attr("class", "node")
						.attr("style", "fill: rgb(50, 50, 128);")
						.attr("r", "6");
}

/*
Function init_events
Return boolean
This function init click events in the map
*/
MapController.prototype.init_events = function(principalObject) {
	$(this._target + " svg *, " + this._target + " svg").on("mousedown", {map: this}, this.click_event);
}

/*
Function click_event
Return void
This function manages mouse clicks and run events in consecuence
*/
MapController.prototype.click_event = function(event) {
	var self = event.data.map;
	event.preventDefault();
	event.stopPropagation();
	switch (event.which) {
        case 1:
			if ($(event.currentTarget).hasClass("node")) {
				self.tooltip_map_create(self, event);
			}
			else {
				self.tooltip_map_close();
			}
            break;
        case 2:
            break;
        case 3:
            break;
		default:
			break;
    }
}

/*
Function tooltip_map_create
Return void
This function manages nodes tooltips
*/
MapController.prototype.tooltip_map_create = function(self, event) {
	var nodeR = parseInt($(event.currentTarget).attr("r"));
	nodeR = nodeR * self._zoomManager.scale(); // Apply zoom
	var node_id = $(event.currentTarget).attr("id");
	
	if (this.containsTooltipId(node_id)) {
		$(event.currentTarget).tooltipster("option", "offsetX", nodeR);
		$(event.currentTarget).tooltipster("show");
	}
	else {
		$(event.currentTarget).tooltipster({
	        arrow: true,
	        trigger: 'click',
	        autoClose: false,
			offsetX: nodeR,
			theme: 'tooltipster-noir',
	        multiple: true,
	        content: $('<span>I\'M A FUCKING TOOLTIP!!</span>')
	    });

		this._tooltipsID.push(node_id);

		$(event.currentTarget).tooltipster("show");
	}
}

/*
Function tooltip_map_close
Return void
This function hide nodes tooltips
*/
MapController.prototype.tooltip_map_close = function() {
	for (i = 0; i < this._tooltipsID.length; i++) {
		$('#' + this._tooltipsID[i]).tooltipster("hide");
	}
}

/*
Function containsTooltipId
Return boolean
This function returns true if the element is in the array
*/
MapController.prototype.containsTooltipId = function(element) {
	for (i = 0; i < this._tooltipsID.length; i++) {
		if (this._tooltipsID[i] == element) {
			return true;
		}
	}
	return false;
}
