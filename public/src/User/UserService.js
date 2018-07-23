angular
.module('DroneCafeApp')
.factory('UserService', function($http) {

    return {

        getUserInfo: function(user) {
            let config = {
                params: {
                    name: user.name,
                    email: user.email
                }
            };
            return $http.get('/api/clients', config);
        },

        createNewUser: function(user) {
            let userData = {
                name: user.name,
                email: user.email
            };

            return $http({
                method: 'POST',
                url: '/api/clients',
                data: userData
            });
        },

        updateUserBalance: function(userid, newbalance) {
            let userData = {
                balance: newbalance
            };

            return $http({
                method: 'PUT',
                url: '/api/clients/' + userid,
                data: userData
            });
        },

        getUserOrders: function(userid) {
            let config = {
                params: {
                    userId: userid
                }
            };
            return $http.get('/api/orders', config);
        },

        getDishesList: function() {
            return $http.get('/api/dishes');
        },

        createNewOrder: function(userid, dishid){
            let orderData = {
                userId: userid,
                dishId: dishid
            };

            return $http({
                method: 'POST',
                url: '/api/orders',
                data: orderData
            });
        },

        updateOrderStatus: function(orderid, newStatus){
            let orderData = {
                status: newStatus
            };

            return $http({
                method: 'PUT',
                url: '/api/orders/' + orderid,
                data: orderData
            });
        },

        deleteOrder: function(orderid){
            let orderData = {
                orderId: orderid
            };

            return $http({
                method: 'DELETE',
                url: '/api/orders/' + orderid,
                data: orderData
            });
        }
    }

});