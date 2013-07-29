require.config({
    paths: {
    'dropzone': '../../tools/numberbonds/numberbonddropzone',
    'bars': '../../tools/numberbonds/bars'
    }
});

define(['exports', 'cocos2d', 'qlayer', 'bldrawnode', 'polygonclip', 'toollayer', 'draggable', 'dropzone', 'draggableLayer' ], function (exports, cc, QLayer, BLDrawNode, Polygon, ToolLayer, Draggable, DropZone, DraggableLayer) {
    'use strict';

    var DRAGGABLE_PREFIX = 'DRAGGABLE_';
    var DROPZONE_PREFIX = 'DROPZONE_';

    var BACKGROUND_Z = 0;
    var DROPZONE_Z = 1;
    var DRAGGABLE_Z = 1;

    window.bl.toolTag = 'numberbonds';
    var Tool = ToolLayer.extend({

        _windowSize: undefined,
        _background: undefined,
        _backgroundLayer: undefined,

        init: function () {
            var self = this;

            this._super();

            this.setTouchEnabled(true);

            this._windowSize = cc.Director.getInstance().getWinSize();

            cc.Director.getInstance().setDisplayStats(false);

            this.setBackground(bl.getResource('bg'))

            this.setQuestion()
            return this;
        },

        reset: function () {
            this._background = undefined;
            this._backgroundLayer = undefined;
            this._draggableCounter = 0;
            this._draggableLayer = undefined;
            this._prevDraggable = undefined;
            this._dropzoneCounter = 0;
            this._totalLabels = [];
            this._subTotalLabels = [];
            this._super();
        },

        setBackground: function (resource) {
            if (_.isUndefined(this._background)) {
                this._backgroundLayer = cc.Layer.create();
                this.addChild(this._backgroundLayer, BACKGROUND_Z);
                this._background = new cc.Sprite();
            }
            this._background.initWithFile(resource);
            this._background.setPosition(this._windowSize.width/2, this._windowSize.height/2);
            this._backgroundLayer.addChild(this._background);
        },
        
        _draggableCounter: 0,
        _draggableLayer: undefined,
        _prevDraggable: undefined,
                
        addNumberBondsBar: function(length, position, resource){
            var self = this;

            if (_.isUndefined(this._draggableLayer)) {
                this._draggableLayer = DraggableLayer.create();
                this.addChild(this._draggableLayer, DRAGGABLE_Z);
            }

            var dg = new Draggable();

            dg.tag = 'dg-' + this._draggableCounter;
            if (typeof resource === 'object') {
                dg.initWithSprite(resource);
            } else {
                dg.initWithFile(resource);
            }
			dg.setZoomOnTouchDown(false);
			
            dg.setPosition(position.x, position.y);
            dg._homePosition = cc.p(position.x, position.y);
				
            dg.setScale(0.5);
            dg._length=length;

            dg.onMoved(function (position, draggable) {
                //draggable.setRotation(0);
                draggable.setScale(Math.min(Math.max(0.01*position.x,0.5),1));
                self._draggableLayer.reorderChild(draggable, self._draggableCounter);
                self._draggableLayer.sortAllChildren();
                self._draggableLayer.reshuffleTouchHandlers();
                if (self._prevDraggable !== draggable.tag) {
                    self._draggableCounter++;
                }
                self._prevDraggable = draggable.tag;
            });
            dg.onMoveEnded(function (position, draggable) {

 				var dzs = self.getControls(DROPZONE_PREFIX);
                _.each(dzs, function(dz) {
                    if (dz.isPointInsideArea(position)) {
                    		if(dz.isPointInsideArea(draggable._lastPosition)){
                    			  draggable.setPosition(draggable._lastPosition);
                    			  }
                    		else{
                    			if((dz._filled+draggable._length)<=dz._length){               	
									draggable.setPosition((dz.getPosition().x)+(dz._filled*50),(dz.getPosition().y));
									draggable.setScale(1);
									dz._filled=dz._filled+draggable._length;
                                    dz._filledArray.push(draggable.tag);
								}
								else{
									draggable.setPosition(draggable._homePosition);
									draggable.setScale(0.5);
								}
							}
							// add length to array
                        }
                         
                    	else {
                    		if(dz.isPointInsideArea(draggable._lastPosition)){
    							dz._filled=dz._filled-draggable._length;
                                //for all bars with index > this draggable, shift left by draggable's length
                                var bars = self.getControls(DRAGGABLE_PREFIX);
                                _.each(bars, function(bar) {
                                    if(dz._filledArray.indexOf(bar.tag)>dz._filledArray.indexOf(draggable.tag)){
                                        bar.setPosition((bar.getPosition().x)-(draggable._length*50),(bar.getPosition().y));
                                    }
                                });
    							//splice array to remove that index.
                                dz._filledArray.splice(dz._filledArray.indexOf(draggable.tag),1);
    		         		}
							draggable.setPosition(draggable._homePosition);
							draggable.setScale(0.5);
		         		
                    }

                });
                            
            });
            this._draggableLayer.addChild(dg);
            this.registerControl(DRAGGABLE_PREFIX + this._draggableCounter, dg);
            this._draggableCounter++;
            return dg;
        },
        
        _dropzoneCounter: 0,
        
        _addDropZone: function (dz, position, shape, label, bgResource) {
            var clc = cc.Layer.create();
            if (_.isUndefined(bgResource)) {
                dz.init();
            } else {
                dz.initWithFile(bgResource);
            }
            dz.setPosition(position.x, position.y);
            dz.setShape(shape);
            dz.setLabel(label);
            clc.addChild(dz);
            this.registerControl(DROPZONE_PREFIX + this._dropzoneCounter, dz);
            this.addChild(clc, DROPZONE_Z);
            this._dropzoneCounter++;
            return dz;
        }, 
        
        addDropZone: function (position, shape, label, definitionURL, bgResource) {
            var args = Array.prototype.slice.call(arguments);
            var dz = new DropZone();
            args.unshift(dz);
            return this._addDropZone.apply(this, args);
        },
        
        
        getState: function () {
            throw {name : "NotImplementedError", message : "This needs implementing"};
        },
        
        // add bars	
        setQuestion: function () {
            var self = this;

            var colours = [
                { r: 231, g: 0,   b: 0,   a: 255 },
                { r: 245, g: 94, b: 0,   a: 255 },
                { r: 247, g: 204, b: 0,   a: 255 },
                { r: 0,   g: 183, b: 0,   a: 255 },
                { r: 0,   g: 170, b: 234, a: 255 },
                { r: 98,   g: 0, b: 245, a: 255 },
                { r: 225, g: 116, b: 172, a: 255 }];

            this._draggableLayer = DraggableLayer.create();
            self.addChild(self._draggableLayer);

            _.each(colours, function (colour, i) {
                for(var j=1;j<11;j++){
                    var l = new cc.LayerColor();
                    l.init(colour, 50*(i+1), 40);
                    
                    var dg = self.addNumberBondsBar((i+1), cc.p(10, 600 - 55*i), l);
                }
                

            });
            
         //add dropzone                       
            var dz = this.addDropZone({
                        x:400, y:145},
                        [{x:0, y:0}, {x:0, y:500}, {x:300, y:500}, {x:300, y:0}],
                        'cage');
                    dz._label.setPosition(150,250);
                    dz._label.setFontSize(50);
                    dz._filled = 0;
                    dz._filledArray = new Array(),
                    dz._length = 10;
                    
				
                    
          


        }
    });

    ToolLayer.create = function () {
        var sg = new ToolLayer();
        if (sg && sg.init(cc.c4b(255, 255, 255, 255))) {
            return sg;
        }
        return null;
    };

    ToolLayer.scene = function () {
        var scene = cc.Scene.create();
        var layer = ToolLayer.create();
        scene.addChild(layer);

        scene.layer=layer;

        scene.ql = new QLayer();
        scene.ql.init();
        layer.addChild(scene.ql, 99);

        scene.update = function(dt) {
            this.layer.update(dt);
            this.ql.update(dt);
        };
        scene.scheduleUpdate();


        return scene;
    };

    exports.ToolLayer = Tool;

});
