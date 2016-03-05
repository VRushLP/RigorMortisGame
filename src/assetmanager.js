function AssetManager() {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = [];
    this.downloadQueue = [];
    this.stageQueue = [];
}

AssetManager.prototype = {

    queueDownload : function(path) {
        this.downloadQueue.push(path);
    },

    queueStageDownload : function(path) {
        this.stageQueue.push(path);
    },

    isDone : function () {
        return this.downloadQueue.length + this.stageQueue.length === this.successCount + this.errorCount;
    },

    getAsset : function (path) {
        return this.cache[path];
    },
    
    getStages : function (callback, stageNumber) {
        var stagePath = this.stageQueue[stageNumber];
        var stageContents;
        var client = new XMLHttpRequest();
        var that = this;

        client.onreadystatechange = function() {
            if(client.readyState === 4 && client.status === 200) {
                that.cache[stagePath] = client.responseText;
                that.successCount++;
                if(that.isDone()) {
                    callback();
                } else if (stageNumber < that.stageQueue.length - 1) {
                    that.getStages(callback, stageNumber + 1);
                }
            }
        }
        client.open('GET', stagePath);
        client.send();
    },

    downloadAll : function (callback) {
        this.getStages(callback, 0);
    
        for (var i = 0; i < this.downloadQueue.length; i++) {
            var img = new Image();
            var that = this;

            var path = this.downloadQueue[i];
            console.log(path);

            img.addEventListener("load", function () {
                that.successCount++;
                if(that.isDone()) callback();
            });

            img.addEventListener("error", function () {
                console.log("Error loading " + this.src);
                that.errorCount++;
                if (that.isDone()) callback();
            });

            img.src = path;
            this.cache[path] = img;
        }
    }
}
