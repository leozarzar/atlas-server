const { purchase_orders, messages, changes } = require('../models');
const { Op, col } = require('sequelize');
const loadPhoto = require('../photo');

module.exports = {

    async all(req,res){
        const allPurchaseOrders = await purchase_orders.findAll({
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
                    ],
                    include: {
                        association: 'photo_paths',
                        attributes: [
                            'path',
                        ],
                    }
                }
            ]
        });

        if(!allPurchaseOrders) return res.status(400).json({
            message: "Purchase orders not found.",
            status: "400"
        });

        const result = allPurchaseOrders.map((PurchaseOrder) => PurchaseOrder.toJSON());

        return res.json(
            await Promise.all(result.map( async (PurchaseOrder) => {
                
                const loadedItemPhoto = PurchaseOrder.order_item.photo_paths.length > 0 ? await loadPhoto(PurchaseOrder.order_item.photo_paths[0].path) : null;
            
                return ({
                id: PurchaseOrder.id,
                item_name: PurchaseOrder.order_item.name,
                item_photo: `data:image/png;base64,`,
                created_date: PurchaseOrder.createdAt,
                updated_date: PurchaseOrder.updatedAt,
                status: PurchaseOrder.status,
                changes: PurchaseOrder.order_changes.length,
                messages: PurchaseOrder.order_messages.length,
                colaborators: [],
            })}))
        );
    },
    async index(req,res){
        const { id } = req.params;

        const purchaseOrder = await purchase_orders.findByPk(id,{
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

        if(!purchaseOrder) return res.status(400).json({
            message: "Purchase order not found.",
            status: "400"
        });

        const result = purchaseOrder.toJSON();

        return res.json({

                id: result.id,
                item_name: result.order_item.name,
                created_date: result.createdAt,
                updated_date: result.updatedAt,
                status: result.status,
                changes: result.order_changes.length,
                messages: result.order_messages.length,
                colaborators: result.order_changes.filter((value,index) => result.order_changes.map((value) => value.change_user.id).indexOf(value.change_user.id) === index).map((value) => ({
                    name: value.change_user.name,
                    photo: value.change_user.photo_path
                })),
        });
    },
    async store(req,res){

        const { status, item } = req.body;
        
        const createdPurchaseOrder = await purchase_orders.create({
            status,
            item,
        })

        return res.json(createdPurchaseOrder);
    },
    async removeIndex(req,res){
        const { id } = req.params;

        const result = await purchase_orders.destroy({
            where: {
                id,
            }
        });

        if(result === 1) return res.json({
            message: "SUCCESS: User deleted."
        });
        else return res.json({
            message: "ERROR: User NOT deleted."
        });
    },
    async allChanges(req,res){
        const { id } = req.params;

        const purchaseOrderChanges = await purchase_orders.findByPk(id,{
            include: [
                {
                    association: 'order_changes',
                    attributes: [
                        'user',
                        'scope',
                        'createdAt'
                    ],
                    include: {
                        association: 'change_user',
                        attributes: [
                            'name',
                            'id'
                        ],
                    }
                },
            ]
        });

        const result = purchaseOrderChanges.toJSON();

        console.log(result);

        if(!purchaseOrderChanges) return res.status(400).json({
            message: "Purchase order not found.",
            status: "400"
        });

        return res.json({
            changes: result.order_changes.map((change) => ({
                user: change.change_user.name,
                date: change.createdAt,
                scope: change.scope,
            })),
        });
    },
    async storeChange(req,res){
        const { id, user } = req.params;
        const { scope } = req.body;

        const createdChange = await changes.create({
            scope,
            purchase_order: id,
            user
        });

        return res.json(createdChange);
    },
    async allMessages(req,res){
        const { id } = req.params;

        const purchaseOrderMessages = await purchase_orders.findByPk(id,{
            include: [
                {
                    association: 'order_messages',
                    attributes: [
                        'sender_user',
                        'content',
                        'createdAt'
                    ],
                    include: {
                        association: 'sender',
                        attributes: [
                            'name',
                            'photo_path',
                            'id',
                        ],
                    }
                },
            ]
        });

        const result = purchaseOrderMessages.toJSON();

        console.log(result);

        if(!purchaseOrderMessages) return res.status(400).json({
            message: "Purchase order not found.",
            status: "400"
        });

        return res.json({
            messages: await Promise.all(result.order_messages.map( async (message) => ({
                photo: `data:image/png;base64,${await loadPhoto(message.sender.photo_path)}`,
                sender_id: message.sender.id,
                sender: message.sender.name,
                date: message.createdAt,
                content: message.content,
            }))),
        });
    },
    async storeMessage(req,res){
        const { id, user } = req.params;
        const { content, } = req.body;

        const createdMessage = await messages.create({
            content,
            recipient_purchase_order: id,
            sender_user: user
        });

        return res.json(createdMessage);
    },
    async updateIndex(req,res){
        const { id } = req.params;

        return res.status(200).json(await purchase_orders.update(
            req.body,
            {
                where: {
                    id
                }
            }
        ));
    },
}