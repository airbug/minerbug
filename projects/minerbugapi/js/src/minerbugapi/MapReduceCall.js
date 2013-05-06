MapReduceCall = {

    _constructor: function(sources) {
        this.sources = sources;
        this.tasks = new List();
    },

    map: function(mapMethod) {
        this.tasks.add(new MapTask(mapMethod));
        return this;
    },

    reduce: function(reduceMethod) {
        this.tasks.add(new ReduceTask(reduceMethod));
        return this;
    }
}