droneCafeApp.controller('UserCtrl', function ($scope, UserService) {

  $scope.userLoggedIn = false;
  $scope.dishesDisplayed = false;
  $scope.dishes = [];
  let socket = io();

  // $('#btnUser').hide();
  // $('#btnMenu').hide();
  // $('#btnOrders').hide();

  $scope.openLoginPopup = function () {
    $('#loginPopup').modal();
    $('#loginPopup').modal('open');
    $scope.user = {};
  };

  $scope.logIn = function (user) {
    $('#loginPopup').modal('close');
    // $('#btnLogin').hide();
    // $('#btnOrders').show();
    // $('#btnMenu').show();
    // $('#btnUser').show();
    $scope.userLoggedIn = true;
    $scope.dishesDisplayed = true

    $scope.user = user;

    UserService.getUserInfo($scope.user).then(function (data) {

      if (data.data.length == 0) {
        $scope.user.balance = 100;

        UserService.createNewUser($scope.user).then(function (data) {
          $scope.user = data.data;
          // console.log('new user created');
        });
      } else {
        $scope.user = data.data[0];

        UserService.getUserOrders($scope.user._id).then(function (data) {
          if (data.data.length !== undefined) {
            $scope.userOrderedDishes = data.data;
          };
        });
      }
    });
  };

  $scope.addFunds = function () {
    $scope.user.balance = $scope.user.balance + 100;

    UserService.updateUserBalance($scope.user._id, $scope.user.balance).then(function (data) {
      // console.log(data.data);
    });
  };

  $scope.showDishes = function () {
    $scope.dishesDisplayed = true;
    UserService.getDishesList().then(function (data) {
      // console.log(data.data);

      $scope.dishes = data.data;
    });
  };

  $scope.showOrders = function (user) {
    $scope.dishesDisplayed = false;
    // console.log($scope.user._id)
    UserService.getUserOrders($scope.user._id).then(function (data) {
      if (data.data.length !== undefined) {
        // console.log(data.data);
        $scope.userOrderedDishes = data.data;
      };
    });
  }


  $scope.addDishToOrder = function (dishid, dishtitle, dishprice) {
    $scope.user.balance = $scope.user.balance - dishprice;

    UserService.updateUserBalance($scope.user._id, $scope.user.balance).then(function (data) {
      // console.log(data.data);
    });

    UserService.createNewOrder($scope.user._id, dishid).then(function (data) {
      // console.log(data.data);
    });
  };

  $scope.makeIngredientsList = function (ingredientsArray) {
    let ingredientsList = ingredientsArray.join(', ');

    ingredientsList = ingredientsList[0].toUpperCase() + ingredientsList.substr(1, ingredientsList.length - 3) + ".";

    return ingredientsList;
  };

  $scope.orderAgain = function (order) {
    order.status = 'Ordered';

    var dish = $scope.dishes.filter(data => data._id == order.dishId)

    $scope.user.balance = $scope.user.balance + (dish[0].price * 0.05)
    
    // console.log(dish[0].price)
    // console.log(order.dishId);
    // console.log(dish)

    UserService.updateUserBalance($scope.user._id, $scope.user.balance.toFixed(2)).then(function (data) {
      // console.log(data.data);
    });

    UserService.updateOrderStatus(order._id, 'Ordered').then(function (data) {
      // console.log(data.data);
    });
  };

  $scope.cancelOrder = function (order, orderIndex) {
    $scope.userOrderedDishes.splice(orderIndex, 1);

    var dish = $scope.dishes.filter(data => data._id == order.dishId)

    $scope.user.balance = $scope.user.balance + dish[0].price;

    UserService.deleteOrder(order._id).then(function (data) {
      // console.log(data.data);
    });
  };

  socket.on('new order created', function () {
    // console.log(order);

    UserService.getUserOrders($scope.user._id).then(function (data) {
      if (data.data.length !== undefined) {
        $scope.userOrderedDishes = data.data;
      };
    });
  });

  socket.on('order status changed', function (order) {
    // console.log(order);

    for (let i = 0; i < $scope.userOrderedDishes.length; i++) {
      if ($scope.userOrderedDishes[i]._id == order._id) {
        $scope.userOrderedDishes[i].status = order.status;
        $scope.$apply();
        break;
      }
    };
  });

  socket.on('connect_error', function () {
    console.log('Disconnected from server');
    socket.disconnect();
  });
  $scope.showDishes()
});