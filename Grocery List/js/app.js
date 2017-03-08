var app = angular.module('GroceryList', ["ngRoute"]);

app.config(function($routeProvider){
	$routeProvider
		.when("/", {
			templateUrl: "views/groceryList.html",
			controller: "AddPageController"
		})

		.when("/inputItem", {
			templateUrl: "views/inputItem.html",
			controller: "AddPageController"
		})

		//Passing value in url
		.when("/inputItem/edit/:id", {
			templateUrl: "views/inputItem.html",
			controller: "AddPageController"
		})

		.otherwise({
			redirectTo: "/"
		})
});

app.service("groceryService", function($http){

	var gService = {};

	gService.items = [];

	$http.get("data/server_data.json")
		.success(function(data){
			gService.items = data;

			for(var x in gService.items){
				gService.items[x].date = new Date(gService.items[x].date)
			}
		})
		.error(function(data, status){
			alert("Error Occurred!");
		});

	gService.findById = function(id){
		for(var x in gService.items){
			if(gService.items[x].id == id)
				return gService.items[x];
		}
	};

	gService.getID = function(){
		if(gService.newID){
			gService.newID++;
			return gService.newID;
		} else {
			var maxID = _.max(gService.items, function(entry){
				return entry.id;
			})
			gService.newID = maxID.id + 1;
			return gService.newID;
		}
	};

	gService.save = function(entry){
		var updatedItem = gService.findById(entry.id);

		if(updatedItem){
			updatedItem.completed = entry.completed;
			updatedItem.itemName = entry.itemName;
			updatedItem.date = entry.date;
		}
		else{

			$http.post("data/new_data.json", entry)
				.success(function(data){
					entry.id = data.newID;
				})
				.error(function(data, status){
					alert("Error Occurred!!")
				});
			// entry.id = gService.getID();
			gService.items.push(entry);
		}
	};

	gService.removeItem = function(item){
		var index = gService.items.indexOf(item);
		gService.items.splice(index, 1);
	};

	gService.markCompleted = function(item){
		item.completed = !item.completed;
	};


	return gService;
});

app.controller("HomePageController", ["$scope","groceryService", function($scope, groceryService){
	// $scope.appTitle = groceryService.items[1].itemName;
	$scope.appTitle = "Groceries"
	// $scope.items = groceryService.items;

	$scope.removeItem = function(item){
		groceryService.removeItem(item);
	};

	$scope.markCompleted = function(item){
		groceryService.markCompleted(item);
	};

	$scope.$watch(function(){
		return groceryService.items;
	}, function(items){
			$scope.items = items;
	})

}]);


app.controller("AddPageController", ["$scope", "$routeParams", "$location", "groceryService", function($scope, $routeParams, $location, groceryService){
	
	$scope.items = groceryService.items;
	
	if($routeParams.id == "undefined"){
		$scope.gItem = {id: 0, completed: false, itemName: "", date: new Date()}	
	} else {
		$scope.gItem  = _.clone(groceryService.findById(parseInt($routeParams.id)));
	}

	// $scope.rp = "Route Parameter Value from URL: " + $routeParams.id;

	$scope.save = function(){
		groceryService.save($scope.gItem);
		$location.path("/");
	}

	console.log($scope.items);
}]);
