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

    var displaymultiplier = 1;
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
                  { value: 2, limit: 4, mathml: '<cn>2</cn>' },
                  { value: 3, limit: 10, mathml: '<cn>3</cn>' },
                  { value: 4, limit: 2,     mathml: '<cn>4</cn>' },
                  { value: 5, limit: false, mathml: '<cn>5</cn>' },
                  { value: 6, limit: 10, mathml: '<cn>6</cn>' },
                  { value: 7, limit: 10, mathml: '<cn>7</cn>' },
                  { value: 8, limit: 1,     mathml: '<cn>8</cn>' },
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
            
            var movedFromStartDropZone = false;
            var tempPosition;
            var tempPositionCount = 0;
            var reject = false;

            dg.onMoved(function (position, draggable) {

                var endpoint = position.x - draggable._contentSize.width/2;
                draggable.setScale(Math.min (Math.max (0.00007 * homescale * position.x * position.x, homescale), 1) );

                var dropZones = self.getControls(DROPZONE_PREFIX);

                var startDropZone,
                    oldHoverDropZone,
                    newHoverDropZone;

                if (tempPositionCount == 0 && (draggable._lastPosition.x == draggable._homePosition.x) && (draggable._lastPosition.y == draggable._homePosition.y)){
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
                        }
                }

                //find startDropZone
                // startDropZone = draggable.findDropZone(dropZones, draggable._lastPosition);
                if(movedFromStartDropZone == false){
                    for (var i = 0; i < dropZones.length; i++) {
                        var dropZone = dropZones[i];
                        if (dropZone.containsPoint(draggable._lastPosition)) {
                            startDropZone = dropZone;
                            break;
                        }
                    }
                }
                //find oldHoverDropZone
                if (tempPosition){
                    //oldHoverDropZone = draggable.findDropZone(dropZones, tempPosition);
                    for (var i = 0; i < dropZones.length; i++) {
                        var dropZone = dropZones[i];
                        if (dropZone.containsPoint(tempPosition)) {
                            oldHoverDropZone = dropZone;
                            break;
                        }
                    }
                }

                //find newHoverDropZone
                for (var i = 0; i < dropZones.length; i++) {
                    var dropZone = dropZones[i];
                    if (dropZone.containsPoint(position)) {
                        newHoverDropZone = dropZone;
                        break;
                    }
                }

                //newHoverDropZone = draggable.findDropZone(dropZones, draggable.position);
                
                //if moved out of startDropZone for the first time, remove from startDropZone
                if (startDropZone && movedFromStartDropZone == false){
                    var ix = startDropZone._filledArray.indexOf(draggable);
                    draggable.removeFromDropZone(startDropZone, ix, unitlength);
                    startDropZone.updateLabel(displaymultiplier, displayAccuracy);

                    //flag "moved from original dropzone"
                    movedFromStartDropZone = true;
                }

                //if oldDropZone is same as newDropZone AND ignore first tempPosition (reassignment of point hasn't happened yet?)
                if (newHoverDropZone && newHoverDropZone == oldHoverDropZone && tempPositionCount != 0){ //else if oldDropZone is the same as newDropZone, only shift the necessary blocks 
                    //REVIEW - have a feeling this may not be necessary now?
                    if ((newHoverDropZone == startDropZone) || (draggable._length <= newHoverDropZone._length - newHoverDropZone._filled)){
                        var oldDraggableIndex,
                            newDraggableIndex;

                        //find previous index of draggable
                        for (i = 0; i < oldHoverDropZone._filledArray.length; i++){
                           if (oldHoverDropZone._filledArray[i].getPosition().x > tempPosition.x){                        
                                oldDraggableIndex = i;
                                break;
                            }
                            oldDraggableIndex = oldHoverDropZone._filledArray.length;
                        }

                        //find current index of draggable
                        for (i = 0; i < newHoverDropZone._filledArray.length; i++){
                           if (newHoverDropZone._filledArray[i].getPosition().x > position.x){                            
                                newDraggableIndex = i;
                                break;
                            }
                            newDraggableIndex = newHoverDropZone._filledArray.length;
                        }

                        if(newDraggableIndex != oldDraggableIndex){
                            //shift everything on the right of moved block to the left
                            for (var i = oldDraggableIndex; i < oldHoverDropZone._filledArray.length; i++) {
                                var bar = oldHoverDropZone._filledArray[i];
                                var oldPos = bar.getPosition();
                                bar.animateToPosition(cc.p(
                                    oldPos.x - draggable._length * unitlength,
                                    oldPos.y)
                                );
                            }
                          //shift everything to the right of draggable by its length
                            for (i = newDraggableIndex; i < newHoverDropZone._filledArray.length; i++){
                                var currentPos = newHoverDropZone._filledArray[i].getPosition();

                                newHoverDropZone._filledArray[i].animateToPosition(cc.p(
                                    currentPos.x + draggable._length * unitlength,
                                    currentPos.y)
                                );                              
                            }  
                        }
                    }
                
                } else if(oldHoverDropZone != newHoverDropZone){
                    if(newHoverDropZone && (draggable._length > newHoverDropZone._length - newHoverDropZone._filled)){
                        reject = true;
                    } else{
                        var oldDraggableIndex,
                            newDraggableIndex;                    
                        //if oldDropZone exists, shift the other bars left
                        if (oldHoverDropZone && (draggable._length <= oldHoverDropZone._length - oldHoverDropZone._filled)){
                            //oldDraggableIndex = 0;
                            //find old index
                            for (i = 0; i < oldHoverDropZone._filledArray.length; i++){
                                if (oldHoverDropZone._filledArray[i].getPosition().x > tempPosition.x){
                                    oldDraggableIndex = i;
                                    break;
                                }
                            }

                            //shift bars left
                            for (var i = oldDraggableIndex; i < oldHoverDropZone._filledArray.length; i++) {
                                var bar = oldHoverDropZone._filledArray[i];
                                var oldPos = bar.getPosition();
                                bar.animateToPosition(cc.p(oldPos.x - this._length * unitlength, oldPos.y));
                            }
                        }

                        //if newDropZone exists, shift the other bars right
                        if (newHoverDropZone){
                            //find new index
                            //newDraggableIndex = 0;

                            for (i = 0; i < newHoverDropZone._filledArray.length; i++){
                               if (newHoverDropZone._filledArray[i].getPosition().x > position.x){                            
                                    newDraggableIndex = i;
                                    break;
                                }
                            }

                            //shift everything to the right of draggable by its length
                            for (var i = newDraggableIndex; i < newHoverDropZone._filledArray.length; i++){
                                var currentPos = newHoverDropZone._filledArray[i].getPosition();

                                newHoverDropZone._filledArray[i].animateToPosition(cc.p(
                                    currentPos.x + this._length * unitlength,
                                    currentPos.y)
                                );
                            }                            
                        }
                    }                                                           
                }
                    
                //set tempPosition
                tempPosition = position;
                tempPositionCount++;
               
                self._draggableLayer.reorderChild(draggable, self._draggableCounter);
                self._draggableLayer.sortAllChildren();
                self._draggableLayer.reshuffleTouchHandlers();
                if (self._prevDraggable !== draggable.tag) {
                    self._draggableCounter++;
                }
                self._prevDraggable = draggable.tag;
            });

            dg.onMoveEnded(function (position, draggable) {
                if (tempPositionCount == 0){
                   draggable.returnToLastPosition(true);
                } else if (reject == false){
                    //find right dropzone
                    var dropZones = self.getControls(DROPZONE_PREFIX);
                    var newDropZone;
                    for (var i = 0; i < dropZones.length; i++) {
                        var dropZone = dropZones[i];
                        if (dropZone.containsPoint(position)) {
                            newDropZone = dropZone;
                            break;
                        }
                    }

                    if(newDropZone){
                        //find out draggable's index in dropzone
                        var dropZonePos = newDropZone.getPosition();
                        var draggableIndex = 0;
                        var newPos = 0;

                        for (var i = 0; i < newDropZone._filledArray.length; i++){
                            if (newDropZone._filledArray[i].getPosition().x < position.x){                            
                                newPos += newDropZone._filledArray[i]._length;
                            } else {
                                draggableIndex = i;
                                break;
                            }
                            draggableIndex = newDropZone._filledArray.length;
                        }

                        //add to dropzone
                        draggable.addToDropZone(newDropZone, draggableIndex, newPos, unitlength, cagepadding);
                        newDropZone.updateLabel(displaymultiplier, displayAccuracy);
                        draggable.setScale(1);

                        
                    // } else if(oldDropZone){
                    //     //return to last position move blocks


                    }else{
                        //return to dock
                        draggable.setScale(homescale);
                        draggable.returnToHomePosition(true);
                        if(question.spawnPoints[draggable._length - 1].limit != false){ 
                            docklabelvalues[draggable._length - 1]++;
                            docklabels[draggable._length - 1].setString(docklabelvalues[draggable._length - 1]);
                        }
                    }

                    //reset startDropZone counter
                    movedFromStartDropZone = false;

                    

                } else {
                    draggable.setScale(homescale);
                    draggable.returnToHomePosition(true);
                    if(question.spawnPoints[draggable._length - 1].limit != false){ 
                        docklabelvalues[draggable._length - 1]++;
                        docklabels[draggable._length - 1].setString(docklabelvalues[draggable._length - 1]);
                    }
                }
                //reset rejection status
                reject = false;
                tempPosition = position;
                tempPositionCount = 0;
            });

            // //specific layout function
            // var dropZones = self.getControls(DROPZONE_PREFIX);
            // //for each dropzone
            // for (var i = 0; i < dropZones.length; i++) {
            //     var dropZone = dropZones[i];
            //     var marker = 0;
            //     //iterate through bars
            //     for (var j = 0; j < dropZone._filledArray.length; j++){
            //         //animate to correct positions
            //         dropZone._filledArray[j].animateToPosition(
            //             cc.p(dropZone.getPosition().x + marker * unitlength, dropZone.getPosition().y + barheight/2)
            //         );
            //         marker += dropZone._filledArray[j]._length;
            //     }
            // }

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
                dz.updateLabel(displaymultiplier, displayAccuracy);

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
                    dz.updateLabel(displaymultiplier, displayAccuracy);
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
                    docklabels[bar.value - 1].setPosition(cc.p(42 + (unitlength * bar.value * homescale), 62 + (barheight/1.2) * (bar.value)));
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
