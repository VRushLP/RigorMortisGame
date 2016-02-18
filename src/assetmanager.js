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

    downloadAll : function (callback) {
        for (var i = 0; i < this.stageQueue.length; i++) {
            var stagePath = this.stageQueue[i];
            var stageContents;
            var client = new XMLHttpRequest();
            var that = this;

            client.onreadystatechange = function() {
                if(client.readyState === 4 && client.status === 200) {
                    that.cache[stagePath] = client.responseText;
                    that.successCount++;
                    if(that.isDone()) callback();
                }
            }

            client.open('GET', './txt/forest-stage.txt');
            client.send();
        }

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
