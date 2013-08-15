require.config({
    paths: {}
});

define(['cocos2d', 'dropzone'], function (cc, DropZone, _) {
    'use strict';

    var NumberBondDropZone = DropZone.extend({

        ctor: function() {
            this._super();
            
        },

		setShape: function (shape) {
			var size = {};

		    this.area.vertices = shape;
		    this.area.drawPoly(shape, cc.c4FFromccc4B(cc.c4b(35, 35, 35, 75)), 1, cc.c4FFromccc4B(cc.c4b(35,35,35,255)));
		    size = this._getPolySize(shape);
		    this.setContentSize(size);
			
		},

		updateLabel: function(displaymultiplier, displayAccuracy) {
            this._label._string = (this._filled * displaymultiplier).toFixed(displayAccuracy);            
        }

    });

    return NumberBondDropZone;

});
