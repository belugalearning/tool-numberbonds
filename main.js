require.config({
    paths: {
    }
});

define(['exports', 'cocos2d', 'qlayer', 'bldrawnode', 'polygonclip', 'toollayer', 'draggable', 'dropzone', 'draggableLayer' ], function (exports, cc, QLayer, BLDrawNode, Polygon, ToolLayer, Draggable, DropZone, DraggableLayer) {
    'use strict';

    var DRAGGABLE_PREFIX = 'DRAGGABLE_';
    var DROPZONE_PREFIX = 'DROPZONE_';

    var DROPZONE_Z = 1;
    var DRAGGABLE_Z = 1;

    window.bl.toolTag = 'numberbonds';
    var Tool = ToolLayer.extend({

        _windowSize: undefined,

        init: function () {
            var self = this;

            this._super();

            this.setTouchEnabled(true);

            this._windowSize = cc.Director.getInstance().getWinSize();

            cc.Director.getInstance().setDisplayStats(false);

            this.setBackground(bl.getResource('deep_water_background'))

            this.setQuestion()
            return this;
        },

        reset: function () {
            this._draggableCounter = 0;
            this._draggableLayer = undefined;
            this._prevDraggable = undefined;
            this._dropzoneCounter = 0;
            this._totalLabels = [];
            this._subTotalLabels = [];
            this._super();
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
			
            dg.setPosition(position);
				
            dg.setScale(0.5);
            dg._length=length;

            dg.onMoved(function (position, draggable) {
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
 				var dropZones = self.getControls(DROPZONE_PREFIX);
                var oldDropZone,
                    newDropZone;
                
                for (var i = 0; i < dropZones.length; i++) {
                    var dropZone = dropZones[i];
                    if (!oldDropZone) {
                        if (dropZone.containsPoint(draggable._lastPosition)) {
                            oldDropZone = dropZone;
                            if (newDropZone) break;
                        }
                    }
                    if (!newDropZone) {
                        if (dropZone.containsPoint(position)) {
                            newDropZone = dropZone;
                            if (oldDropZone) break;
                        }
                    }
                }

                var moveToNewDropZone =
                    newDropZone 
                    && newDropZone != oldDropZone
                    && draggable._length <= newDropZone._length - newDropZone._filled;

                if (oldDropZone && (!newDropZone || moveToNewDropZone)) {
                    // remove from oldDropZone if either sending home or migrating to another drop-zone
                    var ix = oldDropZone._filledArray.indexOf(draggable)
                    oldDropZone._filledArray.splice(ix, 1);
                    oldDropZone._filled -= draggable._length;
                    for (var i = ix; i < oldDropZone._filledArray.length; i++) {
                        var bar = oldDropZone._filledArray[i];
                        var oldPos = bar.getPosition();
                        bar.setPosition(cc.p(oldPos.x - draggable._length * 50, oldPos.y));
                    }
                }

                if (moveToNewDropZone) {
                    var dropZonePos = newDropZone.getPosition();
                    draggable.setPosition(cc.p(
                        dropZonePos.x + newDropZone._filled * 50,
                        dropZonePos.y), true);
                    newDropZone._filledArray.push(draggable);
                    newDropZone._filled += draggable._length;
                    draggable.setScale(1);
                } else {
                    if (!newDropZone) {
                        // send home
                        draggable.setPosition(draggable._homePosition);
                        draggable.setScale(0.5);
                    } else {
                        // send to prev pos
                        draggable.setPosition(draggable._lastPosition);
                        draggable.setScale(1);
                    }
                }
                   
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
            dz.setPosition(cc.p(position.x, position.y));
            dz.setShape(shape);
            dz.setLabel(label);
            dz.showArea();
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

            // add bars 
            this._draggableLayer = DraggableLayer.create();
            self.addChild(self._draggableLayer);

            _.each(colours, function (colour, i) {
                for(var j=1;j<11;j++){
                    var l = new cc.LayerColor();
                    l.init(colour, 50*(i+1), 40);
                    
                    var dg = self.addNumberBondsBar((i+1), cc.p(10, 55*i), l);
                }
            });
            
         //add dropzone                       
            var dz = this.addDropZone({
                        x:400, y:100},
                        [{x:0, y:0}, {x:0, y:100}, {x:500, y:100}, {x:500, y:0}],
                        '');
                    dz._label.setPosition(cc.p(0,0));
                    dz._label.setFontSize(50);
                    dz._filled = 0;
                    dz._filledArray = new Array(),
                    dz._length = 10;

            var dz1 = this.addDropZone({
                    x:400, y:300},
                    [{x:0, y:0}, {x:0, y:100}, {x:500, y:100}, {x:500, y:0}],
                    '');
                dz1._label.setPosition(cc.p(0,0));
                dz1._label.setFontSize(50);
                dz1._filled = 0;
                dz1._filledArray = new Array(),
                dz1._length = 10;
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
