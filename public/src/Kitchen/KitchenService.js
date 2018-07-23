angular
.module('DroneCafeApp')
.factory('KitchenService', function($http) {

    return {

        getDishes: function(dishStatus) {
            let config = {
                params: {
                    status: dishStatus
                }
            };
            return $http.get('/api/orders', config);
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
        }

    }

});