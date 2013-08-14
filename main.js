require.config({
    paths: {
        'numberbondbar': '../../tools/numberbonds/numberbondbar',
        'numberbonddropzone': '../../tools/numberbonds/numberbonddropzone'
    }
});

define(['exports', 'cocos2d', 'qlayer', 'bldrawnode', 'toollayer', 'draggable', 'dropzone', 'draggableLayer', 'numberbondbar', 'numberbonddropzone' ], function (exports, cc, QLayer, BLDrawNode, ToolLayer, Draggable, DropZone, DraggableLayer, NumberBondBar, NumberBondDropZone) {
    'use strict';

    var DRAGGABLE_PREFIX = 'DRAGGABLE_';
    var DROPZONE_PREFIX = 'DROPZONE_';

    var DROPZONE_Z = 0;
    var DRAGGABLE_Z = 1;
    var BADGE_Z = 3;

    var barheight = 55;

    var unitlength = 50;
    var homescale = 0.55;

    var displaymultiplier = 0.3;
    var displayAccuracy = 0;
            if (Math.floor(displaymultiplier) != displaymultiplier){
                displayAccuracy = displaymultiplier.toString().split(".")[1].length;
            }

    var docklabelvalues = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    var docklabels = new Array ();

    var cagepadding = 1;

    window.bl.toolTag = 'numberbonds';
    var Tool = ToolLayer.extend({

        _windowSize: undefined,

        init: function () {
            var self = this;

            this._super();

            this.setTouchEnabled(true);

            this._windowSize = cc.Director.getInstance().getWinSize();

            cc.Director.getInstance().setDisplayStats(false);

            this.setBackground(window.bl.getResource('deep_water_background'));

            // add dock background & question box
            //this.addBackgroundComponent(window.bl.getResource('question_tray'), cc.p(this._windowSize.width / 2, 700));
            this.addBackgroundComponent(window.bl.getResource('nb_dock_bottom'), cc.p(42, 50));

            for(var i=1;i<11;i++){
               this.addBackgroundComponent(window.bl.getResource('nb_dock_middle60'), cc.p(42, 50 + (barheight/1.2) * i)); 
            }

            this.addBackgroundComponent(window.bl.getResource('nb_dock_top'), cc.p(42, 50 + (barheight/1.2) * 11));
   
            for(var i = 0; i<10; i++){
                //add dockquantity badge
                var clc = cc.Layer.create();
                var background = new cc.Sprite();
                background.initWithFile(window.bl.getResource('nb_notification'));
                background.setPosition(cc.p(42 + (unitlength * (i + 1) * homescale), 60 + (barheight/1.2) * (i + 1)));
                clc.addChild(background);
                this.addChild(clc, BADGE_Z);

                //add dock labelss
                docklabels[i] = cc.LabelTTF.create(docklabelvalues[i], "mikadoBold", 10);
                docklabels[i].setPosition(cc.p(42 + (unitlength * (i + 1) * homescale), 60 + (barheight/1.2) * (i + 1)));
                docklabels[i].setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                docklabels[i].setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                clc.addChild(docklabels[i]);
            }

            var newQuestion = {
                tool: 'number_bonds',
                spawnPoints: [
                  { value: 1, limit: false, mathml: '<cn>1</cn>' },
                  { value: 2, limit: 10, mathml: '<cn>2</cn>' },
                  { value: 3, limit: 10, mathml: '<cn>3</cn>' },
                  { value: 4, limit: 2,     mathml: '<cn>4</cn>' },
                  { value: 5, limit: false, mathml: '<cn>5</cn>' },
                  { value: 6, limit: 10, mathml: '<cn>6</cn>' },
                  { value: 7, limit: 10, mathml: '<cn>7</cn>' },
                  { value: 8, limit: 4,     mathml: '<cn>8</cn>' },
                  { value: 9, limit: 10, mathml: '<cn>9</cn>' },
                  { value: 10, limit: false, mathml: '<cn>10</cn>' }
                ],
                symbols: {
                  lists: {
                    list0: {
                      definitionURL: 'local://symbols/lists/list0',
                      capacity: 10,
                      locked: true,
                      mathml: '<list><members><csymbol definitionURL="local://symbols/bars/bar0" /><csymbol definitionURL="local://symbols/bars/bar1" /></members></list>'
                    },
                    list1: {
                      definitionURL: 'local://symbols/lists/list0',
                      capacity: 10,
                      locked: false,
                      mathml: '<list><members></members></list>'
                    },
                    list2: {
                      definitionURL: 'local://symbols/lists/list0',
                      capacity: 10,
                      locked: false,
                      mathml: '<list><members></members></list>'
                    },
                    list3: {
                      definitionURL: 'local://symbols/lists/list0',
                      capacity: 10,
                      locked: false,
                      mathml: '<list><members></members></list>'
                    },
                    list4: {
                      definitionURL: 'local://symbols/lists/list1',
                      capacity: 10,
                      locked: false,
                      mathml: '<list><members><csymbol definitionURL="local://symbols/bars/bar2" /></members></list>'
                    }
                  },
                  bars: {
                    bar0: {
                      definitionURL: 'local://symbols/bars/bar0',
                      value: 7,
                      locked: false,
                      mathml: '<cn>6</cn>'
                    },
                    bar1: {
                      definitionURL: 'local://symbols/bars/bar1',
                      value: 3,
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
                labelShown: true,
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
                
        addNumberBondsBar: function(length, position, question, locked, labelShown){
            var self = this;

            if (_.isUndefined(this._draggableLayer)) {
                this._draggableLayer = DraggableLayer.create();
                this.addChild(this._draggableLayer, DRAGGABLE_Z);
            }
            
            var dg = new NumberBondBar(length, displaymultiplier, locked, labelShown);

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

                if(
                    bl.isPointInsideArea(position,
                    [
                        {
                            x:draggable._lastPosition.x - draggable._length * unitlength/2,
                            y:draggable._lastPosition.y + barheight/2
                        },
                        {
                            x:draggable._lastPosition.x + draggable._length * unitlength/2,
                            y:draggable._lastPosition.y + barheight/2
                        },
                        {
                            x:draggable._lastPosition.x + draggable._length * unitlength/2,
                            y:draggable._lastPosition.y - barheight/2
                        },
                        {
                            x:draggable._lastPosition.x - draggable._length * unitlength/2,
                            y:draggable._lastPosition.y - barheight/2
                        }
                    ], cc.p(0, 0)) == true ||
                    (newDropZone 
                        && newDropZone != oldDropZone 
                        && draggable._length > newDropZone._length - newDropZone._filled)
                ){
                    if(!oldDropZone){
                       draggable.setScale(homescale); 
                    }
                    draggable.animateToPosition(draggable._lastPosition);
                    return dg;
                }

                if (oldDropZone) {
                    // remove from oldDropZone if either sending home or migrating to another drop-zone
                    var ix = oldDropZone._filledArray.indexOf(draggable);

                    //update info on what's in dropzone & change label (i.e. remove this bar from the dropzone's filledArray)
                    oldDropZone._filledArray.splice(ix, 1);
                    oldDropZone._filled -= draggable._length;
                    oldDropZone._label._string = (oldDropZone._filled * displaymultiplier).toFixed(displayAccuracy);
                    //shift everything on the right of moved block to the left
                    for (var i = ix; i < oldDropZone._filledArray.length; i++) {
                        var bar = oldDropZone._filledArray[i];
                        var oldPos = bar.getPosition();
                        bar.animateToPosition(cc.p(oldPos.x - draggable._length * unitlength, oldPos.y));
                    }
                }
                
                else{//otherwise, bar was in dock - change dock count + label
                    //need to account for 'infinite' docks
                    if(question.spawnPoints[draggable._length - 1].limit == false){
                        //add another bar when one is taken away
                        var dg = self.addNumberBondsBar(
                            draggable._length,
                            cc.p(40 + (unitlength * draggable._length * homescale * 0.5), 50 + (barheight/1.2) * draggable._length),
                            question,
                            false,
                            question.labelShown
                        );
                    } else{
                        docklabelvalues[draggable._length - 1]--;
                        docklabels[draggable._length - 1].setString(docklabelvalues[draggable._length - 1]);
                        docklabels[draggable._length - 1].setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                        docklabels[draggable._length - 1].setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                    }
                }

                var moveToNewDropZone =
                    newDropZone 
                    && draggable._length <= newDropZone._length - newDropZone._filled;

                if (moveToNewDropZone) {
                    var dropZonePos = newDropZone.getPosition();
                    var draggableIndex;
                    var newPos = 0;

                    //find out draggable's index in dropzone
                    for (i = 0; i < newDropZone._filledArray.length; i++){
                       if (newDropZone._filledArray[i].getPosition().x < position.x){                            
                            newPos += newDropZone._filledArray[i]._length;
                        } else {
                            draggableIndex = i;
                            break;
                        }
                        draggableIndex = newDropZone._filledArray.length;
                    }

                    //shift everything to the right of draggable by its length
                    for (i = draggableIndex; i < newDropZone._filledArray.length; i++){
                        var currentPos = newDropZone._filledArray[i].getPosition();

                        newDropZone._filledArray[i].animateToPosition(cc.p(
                            currentPos.x + draggable._length * unitlength,
                            currentPos.y)
                        );
                    }

                    //add to filled array
                    newDropZone._filledArray.splice(draggableIndex, 0, draggable);

                    //add draggable
                    draggable.animateToPosition(cc.p(
                        cagepadding + dropZonePos.x + newPos * unitlength,
                        cagepadding + dropZonePos.y), true);

                    //update info on what's in dropzone
                    newDropZone._filled += draggable._length;
                    newDropZone._label._string = (newDropZone._filled * displaymultiplier).toFixed(displayAccuracy);
                    draggable.setScale(1);

                    //check if all full, i.e. check if complete
                    for(i = 0; i < Object.keys(question.symbols.lists).length; i++){

                        if(dropZones[i]._filled != dropZones[i]._length){
                            var check = 1;
                            break;
                        }
                    }
                    if(check != 1){
                        console.log('complete!');
                    }

                } else if (oldDropZone && newDropZone) { // has old dropzone, dragged to filled/locked dropzone
                    //put it back in its old drop zone
                    var oldDropZonePos = oldDropZone.getPosition();
                    
                    draggable.setPosition(cc.p(
                        cagepadding + oldDropZonePos.x + oldDropZone._filled * unitlength,
                        cagepadding + oldDropZonePos.y), true);

                    //update info on what's in dropzone
                    oldDropZone._filledArray.push(draggable);
                    oldDropZone._filled += draggable._length;
                    oldDropZone._label._string = (oldDropZone._filled * displaymultiplier).toFixed(displayAccuracy);

                    draggable.setScale(1);
                    
                } else {
                    // send to home - change dock count + label
                    draggable.returnToHomePosition(true);
                    draggable.setScale(homescale);
                    if(question.spawnPoints[draggable._length - 1].limit == false){

                    } else{
                        docklabelvalues[draggable._length - 1]++;
                        docklabels[draggable._length - 1].setString(docklabelvalues[draggable._length - 1]);
                        docklabels[draggable._length - 1].setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                        docklabels[draggable._length - 1].setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                    }

                }
            });

            this._draggableLayer.addChild(dg, DRAGGABLE_Z);
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
        
        addNumberBondDropZone: function (position, shape, label, definitionURL, bgResource) {
            var args = Array.prototype.slice.call(arguments);
            var dz = new NumberBondDropZone();
            args.unshift(dz);
            return this._addDropZone.apply(this, args);
        },
        
        getState: function () {
            throw {name : "NotImplementedError", message : "This needs implementing"};
        },
        
        setQuestion: function (question) {
            var self = this;

            //add dropzone
            var margin = (600 - barheight * Object.keys(question.symbols.lists).length)/(Object.keys(question.symbols.lists).length + 1);
    
            _.each(question.symbols.lists, function (container, i){
                //extract index from 'list0/1/2...'
                i = parseInt(i.slice(4));

                var dz = self.addNumberBondDropZone({
                    x:400, y:margin + (Object.keys(question.symbols.lists).length - 1 - i) * (barheight + margin)},
                    [
                        {
                            x:0,
                            y:0
                        },
                        {
                            x:0,
                            y:barheight + 2 * cagepadding
                        },
                        {
                            x:unitlength * container.capacity + 2 * cagepadding,
                            y:barheight + 2 * cagepadding
                        },
                        {
                            x:unitlength * container.capacity + 2 * cagepadding,
                            y:0
                        }
                    ],
                    'label');
                dz._label.setPosition(cc.p((margin + unitlength * container.capacity), barheight/2));
                dz._label.setFontSize(30);
                dz._filled = 0;
                dz._filledArray = new Array();
                dz._length = container.capacity;
                dz._label._string = (dz._filled * displaymultiplier).toFixed(displayAccuracy);

                //get list of preinitialised bars in this dropzone
                var members = $($.parseXML(container.mathml)).find('csymbol').toArray().map(function(csymbol) {
                    var id = $(csymbol).attr('definitionURL').match(/[^/]+$/)[0];
                    if(container.locked == true){
                        question.symbols.bars[id].locked = true;
                    }
                    return question.symbols.bars[id];
                });

                //add bars to dropzone
                _.each(members, function (bar, i){
                    var dropZonePos = dz.getPosition();

                    //make bar
                    var dg = self.addNumberBondsBar(
                        bar.value,
                        cc.p(cagepadding + dropZonePos.x + (dz._filled +bar.value/2)* unitlength, cagepadding + dropZonePos.y + barheight/2),
                        question,
                        bar.locked,
                        question.labelShown
                    );             
                    
                    //add to filledArray etc
                    dz._filledArray.push(dg);
                    dz._filled += dg._length;
                    //change label for dropzone
                    dz._label._string = (dz._filled * displaymultiplier).toFixed(displayAccuracy);
                    dg.setScale(1);
                    
                    //overwrite homeposition to dock - no need for this anymore if bars are automatically locked
                    dg._homePosition = cc.p(40 + (unitlength * bar.value * homescale * 0.5), 50 + (barheight/1.2) * bar.value);
                });

                if(container.locked == true){
                    dz._filled = container.capacity;
                }
            });

            // add bars in dock
            this._draggableLayer = DraggableLayer.create();
            self.addChild(self._draggableLayer, DRAGGABLE_Z + 1);

            _.each(question.spawnPoints, function (bar, i) {
                // if the store has a numerical limit, make appropriate blocks. 
                if(bar.limit != false){           
                    for(var j = 0; j < bar.limit; j++){
                        
                        var dg = self.addNumberBondsBar(
                            bar.value,
                            cc.p(40 + (unitlength * bar.value * homescale * 0.5), 50 + (barheight/1.2) * bar.value),
                            question,
                            false,
                            question.labelShown
                        );

                        docklabelvalues[bar.value - 1]++;
                    }
                    docklabels[bar.value - 1].setString(docklabelvalues[bar.value - 1]);
                    docklabels[bar.value - 1].setPosition(cc.p(42 + (unitlength * bar.value * homescale), 60 + (barheight/1.2) * (bar.value)));
                    docklabels[bar.value - 1].setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                    docklabels[bar.value - 1].setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                } else {
                    // make two blocks. if one gets dragged out, another is created in its place.
                    for(var j = 0; j < 2; j++){
                        var dg = self.addNumberBondsBar(
                            bar.value,
                            cc.p(40 + (unitlength * bar.value * homescale * 0.5), 50 + (barheight/1.2) * bar.value),
                            question,
                            false,
                            question.labelShown
                        );
                    }
                    docklabelvalues[bar.value - 1] ="\u221E";
                    docklabels[bar.value - 1].setString("\u221E");
                    docklabels[bar.value - 1].setFontSize(20);
                    docklabels[bar.value - 1].setPosition(cc.p(42 + (unitlength * bar.value * homescale), 60 + (barheight/1.2) * (bar.value)));
                    docklabels[bar.value - 1].setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                    docklabels[bar.value - 1].setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                }
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
