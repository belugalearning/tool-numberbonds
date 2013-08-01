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

    var displaymultiplier = 1;

    var docklabelvalues = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    var docklabels = new Array ();


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

            //dock labels
            for(var i = 0; i<10; i++){
                docklabels[i] = cc.LabelTTF.create('x ' + docklabelvalues[i], "mikadoBold", 15);
                docklabels[i]._position = (cc.p(15, (barheight/1.2) * (i+1)));
                self.addChild(docklabels[i]);
                
            }


            var question = {
                bars:[
                    {
                        unit: 1,
                        quantity: 10
                    },
                    {
                        unit: 2,
                        quantity: 5
                    },
                    {
                        unit: 3,
                        quantity: 3
                    },
                    {
                        unit: 4,
                        quantity: 2
                    },
                    {
                        unit: 5,
                        quantity: 2
                    },
                    {
                        unit: 6,
                        quantity: 1
                    },
                    {
                        unit: 7,
                        quantity: 1
                    },
                    {
                        unit: 8,
                        quantity: 1
                    },
                    {
                        unit: 9,
                        quantity: 1
                    },
                    {
                        unit: 10,
                        quantity: 1
                    }

                ],

                containers:[
                    {
                        unit: 10,
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
                        dropzone: 1
                    },
                    {
                        unit: 2,
                        dropzone: 1
                    },
                    {
                        unit: 1,
                        dropzone: 2
                    },
                    {
                        unit: 5,
                        dropzone: 5
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
                
        addNumberBondsBar: function(length, position, resource, colour){
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

            //make label - if bar is white, make label black
            var value = dg._length * displaymultiplier;
            dg.setLabel(value);
            dg._label.setFontSize(25);
            
            dg.onMoved(function (position, draggable) {
                draggable.setScale(Math.min(Math.max((0.0075 * homescale * position.x), homescale), 1));
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

                    //update info on what's in dropzone & change label
                    oldDropZone._filledArray.splice(ix, 1);
                    oldDropZone._filled -= draggable._length;
                    oldDropZone._label._string = oldDropZone._filled * displaymultiplier;

                    for (var i = ix; i < oldDropZone._filledArray.length; i++) {
                        var bar = oldDropZone._filledArray[i];
                        var oldPos = bar.getPosition();
                        bar.setPosition(cc.p(oldPos.x - draggable._length * unitlength, oldPos.y));
                    }
                }
                //otherwise, bar was in dock - change dock count + label
                else{
                        docklabelvalues[draggable._length - 1]--;
                        docklabels[draggable._length - 1]._string ='x ' + docklabelvalues[draggable._length - 1];
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

                    //update info on what's in dropzone & change label
                    newDropZone._filledArray.push(draggable);
                    newDropZone._filled += draggable._length;
                    newDropZone._label._string = newDropZone._filled * displaymultiplier;

                    draggable.setScale(1);

                    

                } else if (oldDropZone && newDropZone) {
                    //put it back in its old drop zone
                    var oldDropZonePos = oldDropZone.getPosition();
                    
                    draggable.setPosition(cc.p(
                        oldDropZonePos.x + oldDropZone._filled * unitlength,
                        oldDropZonePos.y), true);

                    //update info on what's in dropzone & change label
                    oldDropZone._filledArray.push(draggable);
                    oldDropZone._filled += draggable._length;
                    oldDropZone._label._string = oldDropZone._filled * displaymultiplier;

                    draggable.setScale(1);
                    
                } else {
                    // send to home - change dock count + label
                    draggable.setPosition(draggable._homePosition);
                    draggable.setScale(homescale);
                    docklabelvalues[draggable._length - 1]++;
                    docklabels[draggable._length - 1]._string ='x ' + docklabelvalues[draggable._length - 1];

                }
            });

            this._draggableLayer.addChild(dg);
            this.registerControl(DRAGGABLE_PREFIX + this._draggableCounter, dg);
            this._draggableCounter++;
            return dg;
        },

        initCagedBars: function (){
                 
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

            var colours = [
                { r: 231, g: 0,     b: 0,   a: 255 },
                { r: 245, g: 94,    b: 0,   a: 255 },
                { r: 247, g: 204,   b: 0,   a: 255 },
                { r: 0,   g: 183,   b: 0,   a: 255 },
                { r: 0,   g: 170,   b: 234, a: 255 },
                { r: 98,  g: 0,     b: 245, a: 255 },
                { r: 225, g: 116,   b: 172, a: 255 },
                { r: 0, g: 0,   b: 0, a: 255 },
                { r: 75, g: 75,   b: 75, a: 255 },
                { r: 150, g: 150,   b: 150, a: 255 }
            ]

            

            //add dropzone
            var margin = (600 - barheight * question.containers.length)/(question.containers.length + 1);

            _.each(question.containers, function (container, i){

                var dz = self.addDropZone({
                            x:400, y:margin + i * (barheight + margin)},
                            [
                                {x:0, y:0},
                                {x:0, y:barheight},
                                {x:unitlength * container.unit, y:barheight},
                                {x:unitlength * container.unit, y:0}
                            ],
                        'label');
                    dz._label.setPosition(cc.p((2 * margin + unitlength * container.unit), barheight/2));
                    dz._label.setFontSize(30);
                    dz._filled = 0;
                    dz._filledArray = new Array();
                    dz._length = container.unit;
                    dz._label._string = dz._filled * displaymultiplier;
                    
            });

            
       
            // add bars in dock


            this._draggableLayer = DraggableLayer.create();
            self.addChild(self._draggableLayer);

            _.each(question.bars, function (bar, i) {             
                for(var j = 0; j < bar.quantity; j++){
                    var l = new cc.LayerColor();
                    l.init(colours[bar.unit - 1], unitlength * bar.unit, barheight);
                    
                    var dg = self.addNumberBondsBar(bar.unit, cc.p(40 + (unitlength * bar.unit)/4, (barheight/1.2) * bar.unit), l, colours[bar.unit - 1]);
                    docklabelvalues[bar.unit - 1]++;
                }
                docklabels[bar.unit - 1]._string ='x ' + docklabelvalues[bar.unit - 1];
            });         

            //add bars in dropzone
            _.each(question.barsInDropZone, function (bar, i){
                //find dropzone to put it in
                var dropZones = self.getControls(DROPZONE_PREFIX);
                var dropZone = dropZones[bar.dropzone - 1];
                var dropZonePos = dropZone.getPosition();

                //make bar
                var l = new cc.LayerColor();
                l.init(colours[bar.unit - 1], unitlength * bar.unit, barheight);

                var dg = self.addNumberBondsBar(bar.unit, cc.p(dropZonePos.x + (dropZone._filled +bar.unit/2)* unitlength, dropZonePos.y + barheight/2), l);
                
                //add to filledArray etc
                dropZone._filledArray.push(dg);
                dropZone._filled += dg._length;

                //change label for dropzone
                dropZone._label._string = dropZone._filled * displaymultiplier;

                dg.setScale(1);

                //overwrite homeposition to dock
                dg._homePosition = cc.p(40 + (unitlength * bar.unit)/4, (barheight/1.2) * bar.unit);

            });

            



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
