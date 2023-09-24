const {User} = require('./../models')
const jwt = require('jsonwebtoken')

const checkUsertoken = async (req, res, next) => {
  //receber token
  //verificar se o token é valido
  //se nao for valodi -> 401
  try {
    let token = req.headers.authorization
    if (!token) {
      throw new Error("Invalid token")
    }
  
    token = token.split(' ')[1]
  
    const decodeUser = jwt.verify(token, process.env.JWT_SECRET_KEY)
  
    if (!decodeUser) {
      throw new Error()
    }
  
    const user = await User.findOne({email: decodeUser.email})

    if (!user) {
      throw new Error()
    }
  
    req.user = user
    req.token = token
  
    next()

  } catch(error) {
    res.status(401).json("Unable to authenticate!")
  }
}

module.exports = checkUsertoken