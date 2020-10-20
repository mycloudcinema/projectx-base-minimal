/*
  ____                     _
 |  _ \ ___ _ __ ___   ___| | __
 | |_) / _ \ '_ ` _ \ / _ \ |/ /
 |  _ <  __/ | | | | |  __/   <
 |_| \_\___|_| |_| |_|\___|_|\_\

   ____                      _ _   _
  / ___|___  _ __  ___ _   _| | |_(_)_ __   __ _
 | |   / _ \| '_ \/ __| | | | | __| | '_ \ / _` |
 | |__| (_) | | | \__ \ |_| | | |_| | | | | (_| |
  \____\___/|_| |_|___/\__,_|_|\__|_|_| |_|\__, |
                                            |___/

 Base class implementation for entity managers.
 */

 (function (ng) {

	 "use strict";

	 ng.module("rc.entities", []).factory("EntityManager", ["$q", "rcWebservice", EntityManagerFactory]);

	 function EntityManagerFactory($q, rcWebservice) {

		 function EntityManager() {
		 }

		 // The pool holds entities loaded from the DB as key (id) value (Entity) pairs
		 EntityManager.prototype._pool = {};

		 // forceReload forces the function to load the entity from the DB. (Useful for force refresh)
		 EntityManager.prototype.get = function (id, forceReload) {
			 // Because EntityManager.prototype will be added to the child class' prototype chain, 'this' refers to the child's execution context
			 var deferred = $q.defer(), _this = this;
			 // If the get webservice is not defined it should still be available to retrieve a single entity from the pool.
			 if ((forceReload || !_this._pool.hasOwnProperty(id)) && _this.webservices.action_get !== null) {
				 rcWebservice.get(_this.webservices.action_get, {id:id}).then(function (response) {
					 if (response.data[0])
					 	deferred.resolve(_this._retrieveInstance(response.data[0], forceReload));
					 else
					 	deferred.reject();
				 }, deferred.reject);
			 } else if (_this._pool.hasOwnProperty(id)) {
				 deferred.resolve(_this._pool[id]);
			 } else {
				 deferred.reject();
			 }
			 return deferred.promise;
		 };

		 EntityManager.prototype.set = function (data, newEntity) {
			 var deferred = $q.defer(), _this = this;
			 // If the webservice action is not defined, then this function could not work at all.
			 if (_this.webservices.action_set === null) {
				 throw new Error("The set function is not implemented on this entity", _this.webservices);
			 }
			 if (newEntity) {
				 data[_this.id_field] = 0;
			 }
			 var postData = {};
			 for (var key in data) {
				 if (data[key] !== null) {
					 postData[key] = ng.copy(data[key]);
				 }
			 }
			 rcWebservice.post(_this.webservices.action_set, postData).then(function (response) {
				 // The set functions in the DB are returning the updated entity if the update was successful. So we have to update the _pool as well
				 deferred.resolve(_this._retrieveInstance(response.data[0], true));
				 // since deferred.reject is a function that takes exactly one argument there is no need to define an anonymous function to call deferred.reject(); --> less code and it's faster
			 }, deferred.reject);
			 return deferred.promise;
		 };

		 EntityManager.prototype.delete = function (data) {
			 var deferred = $q.defer(), _this = this;
			 if (_this.webservices.action_del === null) {
				 throw new Error("The delete (set) function is not implemented on this entity", _this.webservices);
			 }
			 rcWebservice.get(_this.webservices.action_del, {id: data}).then(function (response) {
				 deferred.resolve(response);
				 // The delete was successful --> remove the item from the pool.
				 delete _this._pool[data];
			 }, deferred.reject);
			 return deferred.promise;
		 };

		 EntityManager.prototype.search = function (searchObject) {
			 var deferred = $q.defer(), _this = this;
			 if (_this.webservices.action_search === null) {
				 throw new Error("The search function is not implemented on this entity", _this.webservices);
			 }
			 rcWebservice.post(_this.webservices.action_search, searchObject).then(function (response) {
				 var entities = [];
				 for (var i = 0; i < response.data.length; i++) {
					 entities.push(_this._retrieveInstance(response.data[i], true));
				 }
				 deferred.resolve(entities);
			 }, deferred.reject);
			 return deferred.promise;
		 };

		 EntityManager.prototype.recent = function (parent) {
			 var deferred = $q.defer(), _this = this;
			 if (_this.webservices.action_recent === null) {
				 throw new Error("The recent function is not implemented on this entity", _this.webservices);
			 }
			 rcWebservice.get(_this.webservices.action_recent, {parent: parent}).then(function (response) {
				 var entities = [];
				 for (var i = 0; i < response.data.length; i++) {
					 entities.push(_this._retrieveInstance(response.data[i], true));
				 }
				 deferred.resolve(entities);
			 }, deferred.reject);
			 return deferred.promise;
		 };

		 EntityManager.prototype.getAll = function (parent) {
			 var deferred = $q.defer(), _this = this;
			 if (_this.webservices.action_getAll === null) {
				 throw new Error("The getAll function is not implemented on this entity", _this.webservices);
			 }
			 rcWebservice.get(_this.webservices.action_getAll, {parent: parent}).then(function (response) {
				 var entities = [];
				 for (var i = 0; i < response.data.length; i++) {
					 entities.push(_this._retrieveInstance(response.data[i], true));
				 }
				 deferred.resolve(entities);
			 }, deferred.reject);
			 return deferred.promise;
		 };
		 return EntityManager;
	 }

	 // The Entity Store Manager is a subclass of the EntityManager that can
	 // implmenent the ability to save and load it's own state. This could be
	 // used in a transactonal environment where the transaction is not committed
	 // until the end, but we do not want to lose the state.
	 ng.module("rc.entities").factory("EntityStoreManager", ["EntityManager", EntityStoreManagerFactory]);

	 function EntityStoreManagerFactory(EntityManager) {

		 function EntityStoreManager() {
		 }

		 EntityStoreManager.prototype = Object.create(EntityManager.prototype);
		 EntityStoreManager.prototype.constructor = EntityStoreManager;
		 EntityStoreManager.prototype.storageKey = null;

		 EntityStoreManager.prototype.save = function (id) {
		 };
		 EntityStoreManager.prototype.load = function (id) {
		 };
	 }
 })(angular);
