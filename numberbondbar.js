require.config({
    paths: {}
});

define(['cocos2d', 'draggable'], function (cc, Draggable) {
    'use strict';

    var NumberBondBar = Draggable.extend({

        _length: undefined,

        ctor:function(length, multiplier, resource) {
            this._super();
            this.setZoomOnTouchDown(false);
            
            this._length = length;
            
            if (typeof resource === 'object') {
                this.initWithSprite(resource);
            } else {
                this.initWithFile(resource);
            }

            this.setLabel(length * multiplier);
            
        },

        _label: undefined,
        setLabel: function (text) {
            text = text || '';
            if (_.isUndefined(this._label)) {
                this._label = cc.LabelTTF.create(text, "mikadoBold", 25);
                this.addChild(this._label);  
            }
            this._label.setPosition(cc.p(this.getContentSize().width / 2, this.getContentSize().height / 2));
        }

    });

    return NumberBondBar;

});
