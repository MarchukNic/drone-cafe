const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const io = require('socket.io');

const mongoose = require('mongoose');

const drone = require('netology-fake-drone-api');

const app = express();
const server = http.createServer(app);
const socketIO = io(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));

const port = process.env.PORT || 1337;

var dbConfig = require('./config/db');
var dbConnectionOptions = {
  server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }
  
};

mongoose.Promise = global.Promise;

mongoose.connect(dbConfig.url, dbConnectionOptions, (error, database) => {
  if (error) {
    console.log('Unable to connect to MongoDB server. Error: ', error);
  } else {
    console.log('Connected to MongoDB server');
  }
});

const model = require('./app/model');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ "message": "Welcome to our Drone Cafe app!" });
});

router.route('/clients')
  .get((req, res) => {

    let searchQuery = {};

    if ((req.query.name !== null) && (req.query.name !== undefined)) {
      let name = req.query.name;
      searchQuery.name = name;
    };

    if ((req.query.email !== null) && (req.query.email !== undefined)) {
      let email = req.query.email;
      searchQuery.email = email;
    };

    model.Client.find(searchQuery, (err, clients) => {
      if (err) {
        res.send(err);
      } else {
        res.json(clients);
      };
    });
  })
  .post((req, res) => {
    const newClient = new model.Client();
    newClient.name = req.body.name;
    newClient.email = req.body.email;
    newClient.balance = 100;
    newClient.save((err) => {
      if (err) {
        res.send(err);
      } else {
        res.json(newClient);
      }
    });
  });

router.route('/clients/:client_id')
  .put((req, res) => {
    model.Client.findById(req.params.client_id, (err, client) => {
      if (err) {
        res.send(err);
      } else {
        client.balance = req.body.balance;
        client.save((err) => {
          if (err) {
            res.send(err);
          } else {
            res.json({ message: 'Client updated!' });
          };
        });
      };
    });
  });

router.route('/orders')
  .get((req, res) => {

    let matchQuery = {
      $match: {
      }
    };

    if ((req.query.userId !== null) && (req.query.userId !== undefined)) {
      let userId = req.query.userId;
      matchQuery.$match["userId"] = mongoose.Types.ObjectId(userId);
    };

    if ((req.query.status !== null) && (req.query.status !== undefined)) {
      let status = req.query.status;

      matchQuery.$match["status"] = status;
    };

    model.Order.aggregate({
      $lookup: {
        "from": "dishes",
        "localField": "dishId",
        "foreignField": "_id",
        "as": "dish"
      }
    },
      {
        $unwind: "$dish"
      },
      {
        $project: {
          "_id": 1,
          "userId": 1,
          "dishId": 1,
          "status": 1,
          "dishName": "$dish.title"
        }
      },
      {
        $sort: {
          _id: -1
        }
      },
      matchQuery)
      .exec((err, orders) => {
        if (err) {
          res.send(err);
        } else {
          console.log(orders)
          res.json(orders);
        };
      });
  })
  .post((req, res) => {
    const newOrder = new model.Order();
    newOrder.userId = mongoose.Types.ObjectId(req.body.userId);
    newOrder.dishId = mongoose.Types.ObjectId(req.body.dishId);
    newOrder.status = 'Ordered';
    newOrder.save((err) => {
      if (err) {
        res.send(err);
      } else {
        res.json({ message: 'Order created!' });

        socketIO.emit('new order created');
      }
    });
  });

router.route('/orders/:order_id')
  .put((req, res) => {
    model.Order.findById(req.params.order_id, (err, order) => {
      if (err) {
        res.send(err);
      } else {
        order.status = req.body.status;
        order.save((err) => {
          if (err) {
            res.send(err);
          } else {
            res.json({ message: 'Order updated!' });

            if (order.status == 'Ordered') {
              socketIO.emit('new order created');
              console.log('welcome back');
            };

            if (order.status == 'In delivery') {
              drone
                .deliver()
                .then(() => {
                  console.log('Доставлено');
                  order.status = 'Served';
                  order.save((err) => {
                    if (err) {
                      console.log(err);
                    } else {
                      socketIO.emit('order status changed', order);
                    }
                  });
                })
                .catch(() => {
                  console.log('Возникли сложности');
                  order.status = 'In trouble';
                  order.save((err) => {
                    if (err) {
                      console.log(err);
                    } else {
                      socketIO.emit('order status changed', order);
                    }
                  });
                });
            };
          };
        });
      };
    });
  })
  .delete((req, res) => {
    model.Order.remove({
      _id: req.params.orderId
    }, (err, order) => {
      if (err) {
        res.send(err);
      } else {
        res.json({ message: 'Order deleted' });
      };
    });
  });

router.route('/dishes')
  .get((req, res) => {
    model.Dish.find((err, dishes) => {
      if (err) {
        res.send(err);
      } else {
        res.json(dishes);
      };
    });
  });

// start app ===============================================

// add router
app.use('/api', router);

// start our app at localhost
server.listen(port, () => {
  console.log(`Application started on port ${port}!`);
});

// socket connection
socketIO.on('connection', (socket) => {
  console.log('User connected');

  socket.on('order status changed', (order) => {
    // console.log(order);
    socketIO.emit('order status changed', order);
  });
  socket.on('disconnect', (message) => {
    console.log('User left');
  });
});