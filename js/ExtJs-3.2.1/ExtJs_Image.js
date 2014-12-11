Ext.ux.Image = Ext.extend(Ext.Component, {
    autoEl: {
        tag: 'img',
        src: Ext.BLANK_IMAGE_URL,
        cls: 'my-managed-image'
    },

    //  Add our custom processing to the onRender phase.
    //  We add a ‘load’ listener to our element.
    onRender: function () {
        this.autoEl = Ext.apply({}, this.initialConfig, this.autoEl);
        Ext.ux.Image.superclass.onRender.apply(this, arguments);
        this.el.on('load', this.onLoad, this);
    },

    onLoad: function () {
        this.fireEvent('load', this);
    },

    setSrc: function (src) {
        if (this.rendered) {
            this.el.dom.src = src;
        } else {
            this.src = src;
        }
    }
});
Ext.reg('image', Ext.ux.Image);