require.config({
    paths: {}
});

define(['cocos2d', 'draggable'], function (cc, Draggable) {
    'use strict';

    var NumberBondBar = Draggable.extend({

        _length: undefined,

        ctor:function(length, multiplier, locked, labelShown, unitlength) {
            this._super();

            //work out degree of accuracy to show
            var displayAccuracy = 0;
            if (Math.floor(multiplier) != multiplier){
                displayAccuracy = multiplier.toString().split(".")[1].length;
            }

            var barheight = 55;

            if (locked == true){
                var colours = [
                    // { r: 231, g: 0,     b: 0,   a: 175 },
                    // { r: 245, g: 94,    b: 0,   a: 175 },
                    // { r: 247, g: 204,   b: 0,   a: 175 },
                    // { r: 0,   g: 183,   b: 0,   a: 175 },
                    // { r: 0,   g: 170,   b: 234, a: 175 },
                    // { r: 98,  g: 0,     b: 245, a: 175 },
                    // { r: 225, g: 116,   b: 172, a: 175 },
                    // { r: 0, g: 0,   b: 0, a: 175 },
                    // { r: 75, g: 75,   b: 75, a: 175 },
                    // { r: 150, g: 150,   b: 150, a: 175 }

                    { r: 134,   g: 139, b: 144, a: 150 },
                    { r: 216,   g: 12,  b: 53,  a: 150 },
                    { r: 86,    g: 176, b: 37,  a: 150 },
                    { r: 231,   g: 51,  b: 132, a: 150 },
                    { r: 232,   g: 155, b: 0,  a: 150 },
                    { r: 49,    g: 142, b: 76,  a: 150 },
                    { r: 73,    g: 71,  b: 71,  a: 150 },
                    { r: 166,   g: 54,  b: 198, a: 150 },
                    { r: 5,     g: 52,  b: 179, a: 150 },
                    { r: 245,   g: 94,  b: 0,   a: 150 },
                    { r: 5,     g: 52,  b: 179, a: 150 },
                    { r: 245,   g: 94,  b: 0,   a: 150 }
                ]
            } else {
                var colours = [
                    // { r: 231, g: 0,     b: 0,   a: 255 },
                    // { r: 245, g: 94,    b: 0,   a: 255 },
                    // { r: 247, g: 204,   b: 0,   a: 255 },
                    // { r: 0,   g: 183,   b: 0,   a: 255 },
                    // { r: 0,   g: 170,   b: 234, a: 255 },
                    // { r: 98,  g: 0,     b: 245, a: 255 },
                    // { r: 225, g: 116,   b: 172, a: 255 },
                    // { r: 0, g: 0,   b: 0, a: 255 },
                    // { r: 75, g: 75,   b: 75, a: 255 },
                    // { r: 150, g: 150,   b: 150, a: 255 },

                    { r: 134,   g: 139, b: 144, a: 255 },
                    { r: 216,   g: 12,  b: 53,  a: 255 },
                    { r: 86,    g: 176, b: 37,  a: 255 },
                    { r: 231,   g: 51,  b: 132, a: 255 },
                    { r: 232,   g: 155, b: 0,  a: 255 },
                    { r: 49,    g: 142, b: 76,  a: 255 },
                    { r: 73,    g: 71,  b: 71,  a: 255 },
                    { r: 166,   g: 54,  b: 198, a: 255 },
                    { r: 5,     g: 52,  b: 179, a: 255 },
                    { r: 245,   g: 94,  b: 0,   a: 255 }
            ]
            }

            var resource = new cc.LayerColor();
            resource.init(colours[length - 1], unitlength * length, barheight);

            this.initWithSprite(resource);
            

            this.setZoomOnTouchDown(false);
            
            if(labelShown == true){
                var label = (length * multiplier).toFixed(displayAccuracy);
                this.setLabel(label);
            }

            this._length = length;

            if (locked == true){
                this._isTouchEnabled = false;
            }
            
        },

        _label: undefined,
        setLabel: function (text) {
            text = text || '';
            if (_.isUndefined(this._label)) {
                this._label = cc.LabelTTF.create(text, "mikadoBold", 22);
                this.addChild(this._label);  
            }
            this._label.setPosition(cc.p(this.getContentSize().width / 2, this.getContentSize().height / 2));
        },

        getLength: function () {
            return this.length;
        },

        returnToHomePosition: function (animate) {
            if (animate == true) {
                var action = cc.Sequence.create(cc.MoveTo.create(0.2, this._homePosition));
                this.runAction(action);
                return;
            }
            this.setPosition(this._homePosition);
            this.setScale(0.55);
        },

        animateToPosition: function (pos, anchorBottomLeft) {
            if (anchorBottomLeft) {
                var size = this.getContentSize();
                pos.x += size.width * 0.5;
                pos.y += size.height * 0.5;
            }
            if (this._posCount === 0) {
                this._homePosition = pos;
            }
            this._posCount++;
            var action = cc.Sequence.create(cc.MoveTo.create(0.2, pos));
            this.runAction(action);
            return;
        },

        removeFromDropZone: function (dropzone, index, unitlength) {
            dropzone._filledArray.splice(index, 1);
            dropzone._filled -= this._length;

            // for (var i = index; i < dropzone._filledArray.length; i++) {
            //     var bar = dropzone._filledArray[i];
            //     var oldPos = bar.getPosition();
            //     bar.animateToPosition(cc.p(oldPos.x - this._length * unitlength, oldPos.y));
            // }

            return;
        },

        addToDropZone: function (dropzone, index, newPos, unitlength, cagepadding) {
            // //shift everything to the right of draggable by its length
            // for (var i = index; i < dropzone._filledArray.length; i++){
            //     var currentPos = dropzone._filledArray[i].getPosition();

            //     dropzone._filledArray[i].animateToPosition(cc.p(
            //         currentPos.x + this._length * unitlength,
            //         currentPos.y)
            //     );
            // }

            //add to filled array
            dropzone._filledArray.splice(index, 0, this);

            //add draggable
            var dropZonePos = dropzone.getPosition();
            this.animateToPosition(cc.p(
                cagepadding + dropZonePos.x + newPos * unitlength,
                cagepadding + dropZonePos.y), true);

            //update info on what's in dropzone
            dropzone._filled += this._length;

            // //add bar to list MathML
            // var mathmlIndex = 0;
            // //find mathmlIndex of new <cn> string
            // var temp = dropZoneMathml;
            // var cuttingPoint;
            // for(i = 0; i < (index + 1); i++) {
            //     cuttingPoint = temp.indexOf("<c");
            //     temp.slice(cuttingPoint);
            //     mathmlIndex += cuttingPoint;
            // }

            // dropZoneMathml = dropZoneMathml.slice(0, mathmlIndex) + "<cn>" + this._length + "</cn>" + dropZoneMathml.slice(mathmlIndex);

            return;
        },

        returnToOldDropZone: function (dropzone, unitlength, cagepadding) {
            var oldDropZonePos = dropzone.getPosition();
                    
            this.setPosition(cc.p(
                cagepadding + oldDropZonePos.x + dropzone._filled * unitlength,
                cagepadding + oldDropZonePos.y), true);

            //update info on what's in dropzone
            dropzone._filledArray.push(this);
            dropzone._filled += this._length;
            return;
        },

        findDropZone: function (dropZones, position) {
            var foundDropZone;
            for (var i = 0; i < dropZones.length; i++) {
                var dropZone = dropZones[i];
                if (dropZone.containsPoint(position)) {
                    foundDropZone = dropZone;
                    return foundDropZone;
                }
            }
            
        }

    });

    return NumberBondBar;

});
