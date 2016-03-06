var Promise = require("bluebird");
var Sealious = require("sealious");

var DatabasesCommonPart = function(datastore,private){

	datastore.post_start = function(){
		var resource_types = Sealious.ChipManager.get_chips_by_type("resource_type");
		var indexes = {}
		for(var rt_name in resource_types){
			for(var field_name in resource_types[rt_name].fields){
				var field = resource_types[rt_name].fields[field_name];
				if(field.full_text_search_enabled()){
					indexes["body." + field_name] = "text";
				}
			}
		}
		return new Promise(function(resolve, reject){
			private.db.collection("resources").createIndex(indexes, function(){
				resolve();
			});

		})
	}

	function process_query(query){
		if(!query){
			return {};
		}
		var new_query = {};
		for(var attribute_name in query){
			if(attribute_name=="sealious_id"){
				new_query[attribute_name] = query[attribute_name];
			}else{
				if(attribute_name[0]!= "$" && query[attribute_name] instanceof Object){
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

	datastore.find = function(collection_name, query, options, output_options){
		query = process_query(query);

		console.log("@", query);

		options = options || {};
		output_options = output_options || {};
		return new Promise(function(resolve, reject){
			var cursor = private.db.collection(collection_name).find(query, options);
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

	datastore.insert = function(collection_name, to_insert, options){
		return new Promise(function(resolve, reject){
			private.db.collection(collection_name).insertOne(to_insert, options, function(err, result){
				if (err) {
					reject(err);
				} else {
					resolve(result.ops[0]);
				}
			})
		})
	}

	datastore.update = function(collection_name, query, new_value){
		query = process_query(query);
		return new Promise(function(resolve, reject){
			private.db.collection(collection_name).update(query, new_value, function(err, WriteResult) {
				if (err) {
					reject(err);
				} else {
					resolve(WriteResult);
				}
			})
		})
	}

	datastore.remove = function(collection_name, query, just_one){
		query = process_query(query);
		return new Promise(function(resolve, reject){
			if(just_one===undefined){
				just_one=0;
			}
			just_one = just_one? 1 : 0;
			private.db.collection(collection_name).remove(query, just_one, function(err, delete_response) {
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
