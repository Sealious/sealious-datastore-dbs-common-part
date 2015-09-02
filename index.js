var Promise = require("bluebird");

var db = null;

var DatabasesCommonPart = new function(){
	function process_query(query){
		if(!query){
			return {};
		}
		var new_query = {};
		for(var attribute_name in query){
			if(attribute_name=="sealious_id"){
				new_query[attribute_name] = query[attribute_name];
			}else{
				if(query[attribute_name] instanceof Object){
					for(var i in query[attribute_name]){
						new_query[attribute_name + "." + i] = query[attribute_name][i];
					}
				}else{
					new_query[attribute_name] = query[attribute_name];
				}				
			}
		}
		return new_query;
	}

	this.find = function(collection_name, query, options, output_options){
		query = process_query(query);
		options = options || {};
		output_options = output_options || {};
		return new Promise(function(resolve, reject){
			var cursor = db.collection(collection_name).find(query, options);
			if (output_options.sort) {
				cursor.sort(output_options.sort);
			}
			if (output_options.skip) {
				cursor.skip(output_options.skip);
			}
			if (output_options.amount) {
				cursor.limit(output_options.amount);
			}
			cursor.toArray(function(err, val) {
				if (err) {
					reject(err)
				} else {
					resolve(val);
				}
			})
		})
	}

	this.insert = function(collection_name, to_insert, options){
		return new Promise(function(resolve, reject){
			db.collection(collection_name).insert(to_insert, options, function(err, inserted){
				if (err) {
					reject(err);
				} else {
					resolve(inserted[0]);
				}
			})
		})
	}

	this.update = function(collection_name, query, new_value){
		query = process_query(query);
		return new Promise(function(resolve, reject){
			db.collection(collection_name).update(query, new_value, function(err, WriteResult) {
				if (err) {
					reject(err);
				} else {
					resolve(WriteResult);
				}
			})
		})
	}

	this.remove = function(collection_name, query, just_one){
		query = process_query(query);
		return new Promise(function(resolve, reject){
			if(just_one===undefined){
				just_one=0;
			}
			just_one = just_one? 1 : 0;
			db.collection(collection_name).remove(query, just_one, function(err, delete_response) {
				if (err) {
					reject(err);
				} else {
					resolve(delete_response);
				}
			})			
		})
	}
}


module.exports = DatabasesCommonPart;
