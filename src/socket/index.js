const {user, profile, chat} = require('../../models')
const {Op} = require("sequelize")
const jwt = require('jsonwebtoken')

// init variable here
const connectedUser = {}

const socketIo = (io) => {

    // create middlewares before connection event
  // to prevent client access socket server without token
  io.use((socket, next) => {
    if (socket.handshake.auth && socket.handshake.auth.token) {
      next();
    } else {
      next(new Error("Not Authorized"));
    }
  });

    io.on('connection', (socket)=>{
        console.log('\x1b[33m%s\x1b[0m', 'client connected:', socket.id)

        const userId = socket.handshake.query.id //get id user login
        connectedUser[userId] = socket.id // to store connected user

        //define listener on event load admin contact
        socket.on("load-admin-contact", async(adminId)=>{
            try {
                const adminContact = await user.findAll({
                    where: {
                        id: adminId
                    },
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "password"]
                    },
                    include: [
                        {
                            model: profile,
                            as:"profile",
                            attributes: {
                                exclude: ["createdAt", "updatedAt"]
                            }
                        },
                        {
                            model: chat,
                            as:"recepientMessage",
                        },
                        {
                            model: chat,
                            as:"senderMessage"
                        }
                        
                    ]
                });

                socket.emit("admin-contact", adminContact)
                
            } catch (err) {
                console.log('\x1b[33m%s\x1b[0m', err);
            }
        })

        //define listener for other user except admin
        socket.on("load-not-admin-contact", async(userId)=>{
            try{
                const notAdminContact = await user.findAll({
                    where: {
                        id: {
                            [Op.ne]: userId,
                        }
                    },
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "password"]
                    },
                    include: [
                        {
                            model: profile,
                            as:"profile",
                            attributes: {
                                exclude: ["createdAt", "updatedAt"]
                            }
                        },
                        {
                            model: chat,
                            as:"recepientMessage",
                        },
                        {
                            model: chat,
                            as:"senderMessage"
                        }
                    ]
                });

                socket.emit("not-admin-contact", notAdminContact)

            }catch (err){
                console.log('\x1b[33m%s\x1b[0m', err);
            }
        })

        socket.on("load-message", async(payload) => {
            try {
                const token = socket.handshake.auth.token
                const tokenKey = process.env.TOKEN_SECRET

                const verifiedToken = jwt.verify(token, tokenKey);

                const idRecepient = payload
                const idSender = verifiedToken.id

                const data = await chat.findAll({
                    where: {
                        idSender: {
                            [Op.or]: [idRecepient, idSender]
                        },
                        idRecepient: {
                            [Op.or]: [idRecepient, idSender]
                        }
                    },
                    include: [
                        {
                            model: user,
                            as: "sender",
                            attributes: {
                                exclude: ["updatedAt","createdAt","password"]
                            }
                        },
                        {
                            model: user,
                            as: "recepient",
                            attributes: {
                                exclude: ["createdAt","updatedAt","password"]
                            }
                        }
                    ],
                    order: [["createdAt", "ASC"]],
                    exclude: ["updatedAt"]
                })

                socket.emit("messages", data)
            } catch (error) {
                console.log('\x1b[33m%s\x1b[0m', error);
            }
        });

        socket.on("send-message", async(payload)=>{
            try {
                const token = socket.handshake.auth.token
                const tokenKey = process.env.TOKEN_SECRET

                const verifiedToken = jwt.verify(token, tokenKey);

                //const idRecepient = payload
                const idSender = verifiedToken.id
                const {
                    message,
                    idRecepient
                } = payload //get id recepient from client

                await chat.create({
                    message,
                    idRecepient,
                    idSender
                })

                io.to(socket.id).to(connectedUser[idRecepient]).emit("new-message", idRecepient)
            } catch (error) {
                console.log('\x1b[33m%s\x1b[0m', error);
            }
        })

        socket.on('disconnect', ()=>{
            console.log('\x1b[33m%s\x1b[0m', 'client disconnect')
        })
    })
}

module.exports = socketIo