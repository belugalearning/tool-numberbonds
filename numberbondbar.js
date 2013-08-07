require.config({
    paths: {}
});

define(['cocos2d', 'draggable'], function (cc, Draggable) {
    'use strict';

    var NumberBondBar = Draggable.extend({

        _length: undefined,

        ctor:function(length, multiplier, locked) {
            this._super();
            
            

            var barheight = 55;

            var unitlength = 50;

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

                    { r: 134,   g: 139, b: 144, a: 175 },
                    { r: 216,   g: 12,  b: 53,  a: 175 },
                    { r: 86,    g: 176, b: 37,  a: 175 },
                    { r: 231,   g: 51,  b: 132, a: 175 },
                    { r: 230,   g: 196, b: 34,  a: 175 },
                    { r: 49,    g: 142, b: 76,  a: 175 },
                    { r: 73,    g: 71,  b: 71,  a: 175 },
                    { r: 166,   g: 54,  b: 198, a: 175 },
                    { r: 5,     g: 52,  b: 179, a: 175 },
                    { r: 245,   g: 94,  b: 0,   a: 175 }
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
                    { r: 230,   g: 196, b: 34,  a: 255 },
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
            this.setLabel(length * multiplier);
            this._length = length;

            if (locked == true){
                this._isTouchEnabled = false;
            }
            
        },

        _label: undefined,
        setLabel: function (text) {
            text = text || '';
            if (_.isUndefined(this._label)) {
                this._label = cc.LabelTTF.create(text, "mikadoBold", 25);
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
        }

    });

    return NumberBondBar;

});
