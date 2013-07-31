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

    var barheight = 50;

    var unitlength = 50;
    var homescale = 0.5;

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

            var question = {
                bars:[
                    {
                        unit: 1,
                        quantity: 0,
                        colour: { r: 231, g: 0,     b: 0,   a: 255 }
                    },
                    {
                        unit: 2,
                        quantity: 5,
                        colour: { r: 245, g: 94,    b: 0,   a: 255 }
                    },
                    {
                        unit: 3,
                        quantity: 3,
                        colour: { r: 247, g: 204,   b: 0,   a: 255 }
                    },
                    {
                        unit: 4,
                        quantity: 2,
                        colour: { r: 0,   g: 183,   b: 0,   a: 255 }
                    },
                    {
                        unit: 5,
                        quantity: 2,
                        colour: { r: 0,   g: 170,   b: 234, a: 255 }
                    },
                    {
                        unit: 6,
                        quantity: 1,
                        colour: { r: 98,  g: 0,     b: 245, a: 255 }
                    },
                    {
                        unit: 7,
                        quantity: 1,
                        colour: { r: 225, g: 116,   b: 172, a: 255 }
                    },
                    {
                        unit: 8,
                        quantity: 1,
                        colour: { r: 0, g: 0,   b: 0, a: 255 }
                    },
                    {
                        unit: 9,
                        quantity: 1,
                        colour: { r: 255, g: 255,   b: 255, a: 255 }
                    },
                    {
                        unit: 10,
                        quantity: 1,
                        colour: { r: 150, g: 150,   b: 150, a: 255 }
                    }

                ],

                containers:[
                    {
                        unit: 10,
                    },
                    {
                        unit: 12
                    },
                    {
                        unit: 7
                    },
                    {
                        unit: 10
                    },
                    {
                        unit: 10
                    },
                    {
                        unit: 10
                    },
                    {
                        unit: 10
                    },
                    {
                        unit: 10
                    },
                    {
                        unit: 10
                    }                     
                ],

                barsInDropZone:[
                    {
                        unit: 1,
                        dropzone: 1,
                        colour: { r: 231, g: 0,     b: 0,   a: 255 }
                    },
                    {
                        unit: 2,
                        dropzone: 1,
                        colour: { r: 245, g: 94,    b: 0,   a: 255 }
                    },
                    {
                        unit: 1,
                        dropzone: 2,
                        colour: { r: 231, g: 0,     b: 0,   a: 255 }
                    }

                ]

            }


            this.setQuestion(question)
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
				
            dg.setScale(homescale);
            dg._length = length;

            dg.onMoved(function (position, draggable) {
                draggable.setScale(Math.min(Math.max((0.02 * homescale * position.x), homescale), 1));
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

                if (oldDropZone) {
                    // remove from oldDropZone if either sending home or migrating to another drop-zone
                    var ix = oldDropZone._filledArray.indexOf(draggable);
                    oldDropZone._filledArray.splice(ix, 1);
                    oldDropZone._filled -= draggable._length;
                    for (var i = ix; i < oldDropZone._filledArray.length; i++) {
                        var bar = oldDropZone._filledArray[i];
                        var oldPos = bar.getPosition();
                        bar.setPosition(cc.p(oldPos.x - draggable._length * unitlength, oldPos.y));
                    }
                }

                var moveToNewDropZone =
                    newDropZone 
                    //&& newDropZone != oldDropZone
                    && draggable._length <= newDropZone._length - newDropZone._filled;

                if (moveToNewDropZone) {
                    var dropZonePos = newDropZone.getPosition();
                    
                    draggable.setPosition(cc.p(
                        dropZonePos.x + newDropZone._filled * unitlength,
                        dropZonePos.y), true);

                    newDropZone._filledArray.push(draggable);
                    newDropZone._filled += draggable._length;
                    draggable.setScale(1);

                } else if (oldDropZone && newDropZone) {
                    //put it back in its old drop zone
                    var oldDropZonePos = oldDropZone.getPosition();
                    
                    draggable.setPosition(cc.p(
                        oldDropZonePos.x + oldDropZone._filled * unitlength,
                        oldDropZonePos.y), true);
                    
                    oldDropZone._filledArray.push(draggable);
                    oldDropZone._filled += draggable._length;
                    draggable.setScale(1);
                    
                } else {
                    // send to home
                    draggable.setPosition(draggable._homePosition);
                    draggable.setScale(homescale);
                }
            });

            this._draggableLayer.addChild(dg);
            this.registerControl(DRAGGABLE_PREFIX + this._draggableCounter, dg);
            this._draggableCounter++;
            return dg;
        },

        initCagedBars: function (){
            //read in matrix with length + quantity columns


            for (i = 0; i<quantity; i++){
                //for each row - 
                //make background resource
                var l = new cc.LayerColor();
                l.init(colour[length], unitlength * (length), barheight);
                
                //call addNumberBondsBar 
                var dg = self.addNumberBondsBar((i + 1), cc.p(10, (barheight + 5) * (i + 1)), l);

            }      
        },

        initDropZoneBars: function (){
            //read in matrix with lengths + dropzones

            //work out position
            //make background resource
            //call addNumberBondsBar with different position
            //overwrite homePosition? (have a feeling this is necessary? need to know which cage it belongs to?)
            //edit filledArray for dropzone

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

        initDropZones: function (){
            //read in array with lengths
            //make array of dropzones
            //calculate position
            //calculate vertices of shape
            //call addDropZone

        },
        
        
        getState: function () {
            throw {name : "NotImplementedError", message : "This needs implementing"};
        },
        
        setQuestion: function (question) {
            var self = this;

            //add dropzone
            var margin = (600 - barheight * question.containers.length)/(question.containers.length + 1);
            console.log(question.containers.length, margin);

            _.each(question.containers, function (container, i){

                var dz = self.addDropZone({
                            x:400, y:margin + i * (barheight + margin)},
                            [
                                {x:0, y:0},
                                {x:0, y:barheight},
                                {x:unitlength * container.unit, y:barheight},
                                {x:unitlength * container.unit, y:0}
                            ],
                        '');
                    dz._label.setPosition(cc.p(0,0));
                    dz._label.setFontSize(50);
                    dz._filled = 0;
                    dz._filledArray = new Array(),
                    dz._length = container.unit;
            });
       
            // add bars 
            this._draggableLayer = DraggableLayer.create();
            self.addChild(self._draggableLayer);

            _.each(question.bars, function (bar, i) {
                console.log(bar, i);
                for(var j = 0; j < bar.quantity; j++){
                    var l = new cc.LayerColor();
                    l.init(bar.colour, unitlength * bar.unit, barheight);
                    
                    var dg = self.addNumberBondsBar(bar.unit, cc.p(10, (barheight + 5) * bar.unit), l);
                }
            
            });
            
            

            //add bars in dropzone

            _.each(question.barsInDropZone, function (bar, i){
                //find dropzone to put it in
                var dropZones = self.getControls(DROPZONE_PREFIX);
                var dropZone = dropZones[bar.dropzone - 1];
                var dropZonePos = dropZone.getPosition();

                //make bar
                console.log(bar, i, "making dropzone bar");
                var l = new cc.LayerColor();
                l.init(bar.colour, unitlength * bar.unit, barheight);

                
                var dg = self.addNumberBondsBar(bar.unit, cc.p(dropZonePos.x + (dropZone._filled +bar.unit/2)* unitlength, dropZonePos.y + barheight/2), l);
                console.log(bar, i, "added bar to dropzone");

                //add to filledArray etc
                dropZone._filledArray.push(dg);
                dropZone._filled += dg._length;
                dg.setScale(1);

                //overwrite homeposition
                dg._homePosition = cc.p(10, (barheight + 5) * bar.unit);

            });


            // var dz = this.addDropZone({
            //             x:400, y:100},
            //                 [
            //                     {x:0, y:0},
            //                     {x:0, y:barheight + cagepadding},
            //                     {x:unitlength * cagelength + cagepadding, y:barheight + cagepadding},
            //                     {x:unitlength * cagelength + cagepadding, y:0}
            //                 ],
            //             '');
            //         dz._label.setPosition(cc.p(0,0));
            //         dz._label.setFontSize(50);
            //         dz._filled = 0;
            //         dz._filledArray = new Array(),
            //         dz._length = 10;

            // var dz1 = this.addDropZone({
            //         x:400, y:300},
            //             [
            //                 {x:0, y:0}, 
            //                 {x:0, y:barheight + cagepadding},
            //                 {x:unitlength * cagelength + cagepadding, y:barheight + cagepadding},
            //                 {x:unitlength * cagelength + cagepadding, y:0}
            //             ],
            //         '');
            //     dz1._label.setPosition(cc.p(0,0));
            //     dz1._label.setFontSize(50);
            //     dz1._filled = 0;
            //     dz1._filledArray = new Array(),
            //     dz1._length = 10;
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

        scene.layer = layer;

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
