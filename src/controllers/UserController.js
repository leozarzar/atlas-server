const { users, messages } = require('../models');
const { Op, col } = require('sequelize');
const fs = require('fs');
const path = require('path');

module.exports = {

    async signIn(req,res){
        const { email, password } = req.query;

        if(!email || !password) return res.status(400).json({
            message: "User not found.",
            status: "400"
        });

        const result = await users.findOne({
            where: {
                email,
                password
            }
        });

        if(!result) return res.status(400).json({
            message: "User not found.",
            status: "400"
        });

        const user = result.toJSON();

        if(user.photo_path) try{
            const filePath = path.join(__dirname, '../../', user.photo_path);
            const data = await fs.promises.readFile(filePath);
            const imageBase64 = data.toString('base64');
            return res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                password: user.password,
                photo: `data:image/png;base64,${imageBase64}`,
            });
        }catch(error){
            console.log(error);
            return res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                password: user.password,
            });
        }
        else return res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
        });
    },
    async all(req,res){
        const allUsers = await users.findAll();

        if(!allUsers) return res.status(400).json({
            message: "Users not found.",
            status: "400"
        });

        const preparedUsers = await Promise.all(allUsers.map( async (user) => {
            
            const photo_path = user.toJSON().photo_path;

            if(photo_path){
                try{
                    const filePath = path.join(__dirname, '../../', photo_path);
                    const data = await fs.promises.readFile(filePath);
                    const imageBase64 = data.toString('base64');
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        password: user.password,
                        photo: `data:image/png;base64,${imageBase64}`,
                    };
                }catch(error){
                    console.log(error);
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        password: user.password,
                    };
                }
            }
            else return {
                id: user.id,
                name: user.name,
                email: user.email,
                password: user.password,
            };
        }));

        return res.json(preparedUsers);
    },
    async index(req,res){
        const { id } = req.params;

        const user = (await users.findByPk(id)).toJSON();

        if(!user) return res.status(400).json({
            message: "User not found.",
            status: "400"
        });

        if(user.photo_path) try{
            const filePath = path.join(__dirname, '../../', user.photo_path);
            const data = await fs.promises.readFile(filePath);
            const imageBase64 = data.toString('base64');
            return res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                password: user.password,
                photo: `data:image/png;base64,${imageBase64}`,
            });
        }catch(error){
            console.log(error);
            return res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                password: user.password,
            });
        }
        else return res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
        });
    },
    async store(req,res){

        const { name, email, password } = req.body;
        const photo_path = req.file.path;
        
        const createdUser = await users.create({
            name,
            email,
            password,
            photo_path
        })

        return res.json(createdUser);
    },
    async removeIndex(req,res){
        const { id } = req.params;
        
        const user = await users.findByPk(id);

        fs.unlink(path.join(__dirname,'../../',user.toJSON().photo_path), () => {});

        const result = await users.destroy({
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
    async allMessages(req,res){
        const { id } = req.params;

        const user = await users.findByPk(id,{
            include: [
                {
                    association: 'received_messages',
                    include:{
                        association: 'sender',
                        attributes: [
                            'name'
                        ]
                    },
                    attributes: [
                        'sender_user',
                        'content',
                        'createdAt'
                    ],
                },
                {
                    association: 'sent_messages',
                    include:{
                        association: 'receiver',
                        attributes: [
                            'name'
                        ]
                    },
                    attributes: [
                        'recipient_user',
                        'content',
                        'createdAt'
                    ]
                }
            ]
        });

        if(!user) return res.status(400).json({
            message: "User not found.",
            status: "400"
        });

        const { name, received_messages, sent_messages } = user.dataValues;

        const mappedReceivedMessages = received_messages.map((data) => {
            const message = data.dataValues;
            return {
                id: message.sender_user,
                name: message.sender.dataValues.name,
                content: message.content,
                createdAt: message.createdAt
            };
        });

        const mappedSentMessages = sent_messages.map((data) => {
            const message = data.dataValues;
            return {
                id: message.recipient_user,
                name: message.receiver.dataValues.name,
                content: message.content,
                createdAt: message.createdAt
            };
        });

        const unorderedMappedMessages = [...mappedReceivedMessages,...mappedSentMessages];
        const mappedMessages = unorderedMappedMessages.sort((A,B) => new Date(A.createdAt)- new Date(B.createdAt));
        const mappedMessagesIds = mappedMessages.map(({id}) => (id));
        const filteredUsers = mappedMessages.filter((value, index) => mappedMessagesIds.indexOf(value.id) === index);
        const filteredUsersFinal = filteredUsers.map((user) => {
            return {
                name: user.name,
                count: mappedMessagesIds.filter( value => value === user.id).length,
                last_message: mappedMessages[mappedMessagesIds.lastIndexOf(user.id)].content
            }
        });

        const formattedUser = {
            user: name,
            chats: [
                ...filteredUsersFinal
            ]
        }

        return res.json(formattedUser);
    },
    async allMessagesWith(req,res){
        const { id, someone_id } = req.params;

        const foundMessages = await messages.findAll({
            where: {
                [Op.or]: [
                    { 
                        [Op.and]: [
                            { sender_user: id },
                            { recipient_user: someone_id },
                        ]
                    },
                    { 
                        [Op.and]: [
                            { recipient_user: id },
                            { sender_user: someone_id },
                        ]
                    }
                ],
            },
            include: {
                association: 'sender',
                attributes: [
                    'name'
                ]
            },
            attributes: [
                'id',
                'content',
                'createdAt',
            ]
        });

        const formattedMessages = foundMessages.map(( { dataValues } ) => ({
            id: dataValues.id,
            from: dataValues.sender.name,
            date: dataValues.createdAt,
            message: dataValues.content
        }))

        const user = await users.findByPk(id, {
            attributes: [
                [col('name'), 'user'],
            ]
        });

        if(!user) return res.status(400).json({
            message: "User not found.",
            status: "400"
        });

        return res.json({
            ...user.dataValues,
            messages: formattedMessages,
        });
    },
    async storeMessageTo(req,res){
        const { id, recipient_id } = req.params;
        const { content } = req.body;

        const createdMessage = await messages.create({
            content,
            recipient_user: recipient_id,
            sender_user: id,
        });

        return res.json(createdMessage);
    }
}