import utils from "../libs/utils";

exports["adaptive-background"] = {
    update(value) {
    	if (!value) return false;
        var style = this.el.style;
        utils.getImageColor(value, function(data) {
            if (data) style.backgroundColor = "rgb(" + data[0] + "," + data[1] + "," + data[2] + ")";
            style.backgroundImage = "url(" + value + ")";
        });
    }
};