const { items, photo_paths, purchase_orders } = require('../models');
const { Op, col } = require('sequelize');

module.exports = {

    async all(req,res){
        const allItems = await items.findAll();

        if(!allItems) return res.status(400).json({
            message: "Items not found.",
            status: "400"
        });

        return res.json(allItems);
    },
    async index(req,res){
        const { id } = req.params;

        const item = await items.findByPk(id);

        if(!item) return res.status(400).json({
            message: "User not found.",
            status: "400"
        });

        return res.json(item);
    },
    async store(req,res){

        const { name } = req.body;
        
        const createdItem = await items.findOrCreate({
            where:{
                name
            },
        })

        return res.json(createdItem);
    },
    async removeIndex(req,res){
        const { id } = req.params;

        const result = await items.destroy({
            where: {
                id,
            }
        });

        if(result === 1) return res.json({
            message: "SUCCESS: Item deleted."
        });
        else return res.json({
            message: "ERROR: Item NOT deleted."
        });
    },
    async allPhotos(req,res){
        const { id } = req.params;

        const photos = await photo_paths.findAll({
            where: {
                item: id,
            }    
        });

        if(!photos) return res.status(400).json({
            message: "Photos not found.",
            status: "400"
        });

        return res.json(photos);
    },
    async storePhoto(req,res){
        const { id } = req.params;
        const photo_path = req.file.path;

        const createdPhoto = await photo_paths.create({
            path: photo_path,
            item: id,
        });

        return res.json(createdPhoto);
    },
    async allPurchaseOrders(req,res){
        const { id } = req.params;

        const purchaseOrders = await purchase_orders.findAll({
            where: {
                item: id,
            },
            include: [
                {
                    association: 'order_changes',
                    attributes: [
                        'id',
                    ],
                    include: {
                        association: 'change_user',
                        attributes: [
                            'id',
                            'name',
                            'photo_path',
                        ],
                    }
                },
                {
                    association: 'order_messages',
                    attributes: [
                        'id',
                    ],
                },
                {
                    association: 'order_item',
                    attributes: [
                        'name',
                    ]
                }
            ]
        });

        if(!purchaseOrders) return res.status(400).json({
            message: "Photos not found.",
            status: "400"
        });

        const result = purchaseOrders.map((PurchaseOrder) => PurchaseOrder.toJSON());

        return res.json([
            result.map((PurchaseOrder) => ({
                id: PurchaseOrder.id,
                item_name: PurchaseOrder.order_item.name,
                created_date: PurchaseOrder.createdAt,
                updated_date: PurchaseOrder.updatedAt,
                status: PurchaseOrder.status,
                changes: PurchaseOrder.order_changes.length,
                messages: PurchaseOrder.order_messages.length,
                colaborators: PurchaseOrder.order_changes.filter((value,index) => PurchaseOrder.order_changes.map((value) => value.change_user.id).indexOf(value.change_user.id) === index).map((value) => ({
                    name: value.change_user.name,
                    photo: value.change_user.photo_path
                })),
            }))
        ]);
    },
}