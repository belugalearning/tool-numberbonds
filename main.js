require.config({
    paths: {
        'numberbondbar': '../../tools/numberbonds/numberbondbar'
    }
});

define(['exports', 'cocos2d', 'qlayer', 'bldrawnode', 'polygonclip', 'toollayer', 'draggable', 'dropzone', 'draggableLayer', 'numberbondbar' ], function (exports, cc, QLayer, BLDrawNode, Polygon, ToolLayer, Draggable, DropZone, DraggableLayer, NumberBondBar) {
    'use strict';

    var DRAGGABLE_PREFIX = 'DRAGGABLE_';
    var DROPZONE_PREFIX = 'DROPZONE_';

    var DROPZONE_Z = 0;
    var DRAGGABLE_Z = 1;

    var barheight = 55;

    var unitlength = 50;
    var homescale = 0.5;

    var displaymultiplier = 1;

    var docklabelvalues = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    var docklabels = new Array ();

    var cagepadding = 5;

    window.bl.toolTag = 'numberbonds';
    var Tool = ToolLayer.extend({

        _windowSize: undefined,

        init: function () {
            var self = this;

            this._super();

            this.setTouchEnabled(true);

            this._windowSize = cc.Director.getInstance().getWinSize();

            cc.Director.getInstance().setDisplayStats(false);

            this.setBackground(bl.getResource('deep_water_background'));

            //dock labels
            for(var i = 0; i<10; i++){
                docklabels[i] = cc.LabelTTF.create('x ' + docklabelvalues[i], "mikadoBold", 15);
                docklabels[i]._position = (cc.p(15, 50 + (barheight/1.2) * (i + 1)));
                self.addChild(docklabels[i]);
            }

            var newQuestion = {
                        tool: 'number_bonds',
                        spawnPoints: [
                          { value: 1, limit: false, mathml: '<cn>1</cn>' },
                          { value: 2, limit: 2, mathml: '<cn>2</cn>' },
                          { value: 3, limit: 3, mathml: '<cn>3</cn>' },
                          { value: 4, limit: false, mathml: '<cn>4</cn>' },
                          { value: 5, limit: false, mathml: '<cn>5</cn>' },
                          { value: 6, limit: false, mathml: '<cn>6</cn>' },
                          { value: 7, limit: false, mathml: '<cn>7</cn>' },
                          { value: 8, limit: false, mathml: '<cn>8</cn>' },
                          { value: 9, limit: false, mathml: '<cn>9</cn>' },
                          { value: 10, limit: false, mathml: '<cn>10</cn>' }
                        ],
                        symbols: {
                          lists: {
                            list0: {
                              definitionURL: 'local://symbols/lists/list0',
                              capacity: 11,
                              locked: true,
                              mathml: '<list><members><csymbol definitionURL="local://symbols/bars/bar0" /><csymbol definitionURL="local://symbols/bars/bar1" /></members></list>'
                            },
                            list1: {
                              definitionURL: 'local://symbols/lists/list0',
                              capacity: 11,
                              locked: true,
                              mathml: '<list><members></members></list>'
                            },
                            list3: {
                              definitionURL: 'local://symbols/lists/list0',
                              capacity: 11,
                              locked: true,
                              mathml: '<list><members></members></list>'
                            },
                            list4: {
                              definitionURL: 'local://symbols/lists/list0',
                              capacity: 11,
                              locked: true,
                              mathml: '<list><members></members></list>'
                            },
                            list2: {
                              definitionURL: 'local://symbols/lists/list1',
                              capacity: 10,
                              locked: false,
                              mathml: '<list><members><csymbol definitionURL="local://symbols/bars/bar2" /></members></list>'
                            }
                          },
                          bars: {
                            bar0: {
                              definitionURL: 'local://symbols/bars/bar0',
                              value: 6,
                              mathml: '<cn>6</cn>'
                            },
                            bar1: {
                              definitionURL: 'local://symbols/bars/bar1',
                              value: 5,
                              mathml: '<cn>5</cn>'
                            },
                            bar2: {
                              definitionURL: 'local://symbols/bars/bar2',
                              value: 5,
                              locked: true,
                              mathml: '<cn>5</cn>'
                            }
                          }
                        },
                        state: '<state><csymbol definitionURL="local://symbols/lists/list0" /><csymbol definitionURL="local://symbols/lists/list1" /></state>',
                      }

            this.setQuestion(newQuestion)
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
                
        addNumberBondsBar: function(length, position, question, locked){
            var self = this;

            if (_.isUndefined(this._draggableLayer)) {
                this._draggableLayer = DraggableLayer.create();
                this.addChild(this._draggableLayer, DRAGGABLE_Z);
            }

            
            var dg = new NumberBondBar(length, displaymultiplier, locked);

            dg.tag = 'dg-' + this._draggableCounter;
            
            dg.setPosition(position);
				
            dg.setScale(homescale);
          
            dg.onMoved(function (position, draggable) {
                var endpoint = position.x - draggable._contentSize.width/2;
                draggable.setScale(Math.min (Math.max (0.00002 * homescale * position.x * position.x, homescale), 1) );
                
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
                    //need to account for 'infinite' docks
                    if(question.spawnPoints[draggable._length - 1].limit == false){
                        //add another bar when one is taken away
                        var dg = self.addNumberBondsBar(
                            draggable._length,
                            cc.p(40 + (unitlength * draggable._length)/4, 50 + (barheight/1.2) * draggable._length),
                            question,
                            false
                        );
                    } else{
                        docklabelvalues[draggable._length - 1]--;
                        docklabels[draggable._length - 1]._string ='x ' + docklabelvalues[draggable._length - 1];
                    }
                }

                var moveToNewDropZone =
                    newDropZone 
                    //&& newDropZone != oldDropZone
                    && draggable._length <= newDropZone._length - newDropZone._filled;

                if (moveToNewDropZone) {
                    var dropZonePos = newDropZone.getPosition();
                    
                    draggable.setPosition(cc.p(
                        cagepadding + dropZonePos.x + newDropZone._filled * unitlength,
                        cagepadding + dropZonePos.y), true);

                    //update info on what's in dropzone & change label
                    newDropZone._filledArray.push(draggable);
                    newDropZone._filled += draggable._length;
                    newDropZone._label._string = newDropZone._filled * displaymultiplier;

                    draggable.setScale(1);

                    //check if all full, i.e. check if complete
                    for(i = 0; i < question.symbols.lists.length; i++){

                        if(dropZones[i]._filled != dropZones[i]._length){
                            var check = 1;
                            break;
                        }
                    }
                    if(check != 1){
                        console.log(question.symbols.lists.length);
                        console.log('complete!');
                    }

                } else if (oldDropZone && newDropZone) {
                    //put it back in its old drop zone
                    var oldDropZonePos = oldDropZone.getPosition();
                    
                    draggable.setPosition(cc.p(
                        cagepadding + oldDropZonePos.x + oldDropZone._filled * unitlength,
                        cagepadding + oldDropZonePos.y), true);

                    //update info on what's in dropzone & change label
                    oldDropZone._filledArray.push(draggable);
                    oldDropZone._filled += draggable._length;
                    oldDropZone._label._string = oldDropZone._filled * displaymultiplier;

                    draggable.setScale(1);
                    
                } else {
                    // send to home - change dock count + label
                    draggable.setPosition(draggable._homePosition);
                    draggable.setScale(homescale);
                    if(question.spawnPoints[draggable._length - 1].limit == false){

                    } else{
                        docklabelvalues[draggable._length - 1]++;
                        docklabels[draggable._length - 1]._string ='x ' + docklabelvalues[draggable._length - 1];
                    }

                }
            });

            this._draggableLayer.addChild(dg, DRAGGABLE_Z);
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

            //add dropzone
            var margin = (600 - barheight * Object.keys(question.symbols.lists).length)/(Object.keys(question.symbols.lists).length + 1);
            console.log(margin);

            _.each(question.symbols.lists, function (container, i){
                //extract index from 'list0/1/2...'
                i = parseInt(i.slice(4));
                console.log(i);
                console.log(600 + margin + (Object.keys(question.symbols.lists).length - 1 - i) * (barheight + margin));
                var dz = self.addDropZone({
                    x:400, y:margin + (Object.keys(question.symbols.lists).length - 1 - i) * (barheight + margin)},
                    [
                        {x:0, y:0},
                        {x:0, y:barheight + 2 * cagepadding},
                        {x:unitlength * container.capacity + 2 * cagepadding, y:barheight + 2 * cagepadding},
                        {x:unitlength * container.capacity + 2 * cagepadding, y:0}
                    ],
                    'label');
                dz._label.setPosition(cc.p((2 * margin + unitlength * container.capacity - 30), barheight/2));
                dz._label.setFontSize(30);
                dz._filled = 0;
                dz._filledArray = new Array();
                dz._length = container.capacity;
                dz._label._string = dz._filled * displaymultiplier;
                    
            });
       
            // add bars in dock
            this._draggableLayer = DraggableLayer.create();
            self.addChild(self._draggableLayer);

            _.each(question.spawnPoints, function (bar, i) {
                // if the store has a numerical limit, make appropriate blocks. 
                if(bar.limit != false){           
                    for(var j = 0; j < bar.limit; j++){
                        
                        var dg = self.addNumberBondsBar(
                            bar.value,
                            cc.p(40 + (unitlength * bar.value)/4, 50 + (barheight/1.2) * bar.value),
                            question,
                            false
                        );

                        docklabelvalues[bar.value - 1]++;
                    }
                    docklabels[bar.value - 1]._string ='x ' + docklabelvalues[bar.value - 1];
                } else {
                    console.log('!!!');
                    // make two blocks. if one gets dragged out, another is created in its place.
                    for(var j = 0; j < 2; j++){
                        var dg = self.addNumberBondsBar(
                            bar.value,
                            cc.p(40 + (unitlength * bar.value)/4, 50 + (barheight/1.2) * bar.value),
                            question,
                            false
                        );
                    }

                    docklabelvalues[bar.value - 1] ='inf';
                    docklabels[bar.value - 1]._string ='inf';
                }
            });         

            // //add bars in dropzone
            // _.each(question.barsInDropZone, function (bar, i){
            //     //find dropzone to put it in
            //     var dropZones = self.getControls(DROPZONE_PREFIX);
            //     var dropZone = dropZones[bar.dropzone - 1];
            //     var dropZonePos = dropZone.getPosition();

            //     //make bar
            //     var dg = self.addNumberBondsBar(
            //         bar.unit,
            //         cc.p(cagepadding + dropZonePos.x + (dropZone._filled +bar.unit/2)* unitlength, cagepadding + dropZonePos.y + barheight/2),
            //         question,
            //         true
            //     );             
                
            //     //add to filledArray etc
            //     dropZone._filledArray.push(dg);
            //     dropZone._filled += dg._length;
            //     //change label for dropzone
            //     dropZone._label._string = dropZone._filled * displaymultiplier;
            //     dg.setScale(1);
            //     //lock these bars
            //     dg._isTouchEnabled = false;
            //     //overwrite homeposition to dock - no need for this anymore if bars are automatically locked
            //     //dg._homePosition = cc.p(40 + (unitlength * bar.unit)/4, (barheight/1.2) * bar.unit);

            // });
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
