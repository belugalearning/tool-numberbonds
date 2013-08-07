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
                    { r: 231, g: 0,     b: 0,   a: 100 },
                    { r: 245, g: 94,    b: 0,   a: 100 },
                    { r: 247, g: 204,   b: 0,   a: 100 },
                    { r: 0,   g: 183,   b: 0,   a: 100 },
                    { r: 0,   g: 170,   b: 234, a: 100 },
                    { r: 98,  g: 0,     b: 245, a: 100 },
                    { r: 225, g: 116,   b: 172, a: 100 },
                    { r: 0, g: 0,   b: 0, a: 100 },
                    { r: 75, g: 75,   b: 75, a: 100 },
                    { r: 150, g: 150,   b: 150, a: 100 }
                ]
            } else {
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
                { r: 150, g: 150,   b: 150, a: 255 },
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

    });

    return NumberBondBar;

});
