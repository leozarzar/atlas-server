const { Router } = require("express");
const UserController = require("../controllers/UserController");
const ItemController = require("../controllers/ItemController");
const PurchaseOrderController = require("../controllers/PurchaseOrderController");
const upload = require("../upload");

const routes = Router();

routes.get('/',(req,res) => {
    return res.json({
        "message": 'Welcome!'
    })
})

//Users

routes.get('/sign_in',UserController.signIn);
routes.get('/users',UserController.all);
routes.get('/users/:id',UserController.index);
routes.get('/users/:id/messages',UserController.allMessages);
routes.get('/users/:id/messages/:someone_id',UserController.allMessagesWith);
routes.post('/users', upload.single('photo'),UserController.store);
routes.post('/users/:id/messages/:recipient_id',UserController.storeMessageTo);
routes.delete('/users/:id',UserController.removeIndex);
routes.patch('/users/:id',UserController.updateIndex);

//Items

routes.get('/items',ItemController.all);
routes.get('/items/:id',ItemController.index);
routes.get('/items/:id/photos',ItemController.allPhotos);
routes.get('/items/:id/purchase_orders',ItemController.allPurchaseOrders);
routes.post('/items',ItemController.store);
routes.post('/items/:id/photos', upload.single('photo'),ItemController.storePhoto);
routes.delete('/items/:id',ItemController.removeIndex);

//Purchase Orders

routes.get('/purchase_orders',PurchaseOrderController.all);
routes.get('/purchase_orders/:id',PurchaseOrderController.index);
routes.get('/purchase_orders/:id/changes',PurchaseOrderController.allChanges);
routes.get('/purchase_orders/:id/messages',PurchaseOrderController.allMessages);
routes.post('/purchase_orders',PurchaseOrderController.store);
routes.post('/purchase_orders/:id/users/:user/changes',PurchaseOrderController.storeChange);
routes.post('/purchase_orders/:id/users/:user/messages',PurchaseOrderController.storeMessage);
routes.delete('/purchase_orders/:id',PurchaseOrderController.removeIndex);
routes.patch('/purchase_orders/:id',PurchaseOrderController.updateIndex);

module.exports = routes;