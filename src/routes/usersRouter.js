const express = require('express')
const router = express.Router()
const { User } = require('./../models')
const jwt = require('jsonwebtoken')
const { authMiddleware } = require('../middlewares')

router.post('/users', async (req, res) => {
  try {
    const user = new User(req.body)
    if (!user) {
      return res.status(400).json("Something went wrong!")
    }

    await user.save()
    res.status(202).json(user)
  } catch(error) {
    res.status(400).json(error)
  }
})

// router.get('/users', async (req,res) => {
//   //Lembrar que tem opcao dos cursores pra apps muito grandes. P nao carregar tudo de uma vez na memoria
//   // const users = await User.find()
//   try {
//     const users = await User.find()
//     if (!users) {
//       return res.status(400).json("Something went wrong")
//     }
//     res.status(200).json(users)

//   }catch (error) {
//     res.status(500).json(error)
//   }
// })

router.get('/users/me', authMiddleware, async (req, res) => {
  try {
    res.status(200).json(req.user)
  } catch(error) {
    res.status(500).json(error)
  }
})

router.delete('/users/me', authMiddleware, async (req,res) => {
  try {
    //usar o remove (do mongoose). Depois user um pre pra deletar todas as tarefas do usuario quando ele é apagado
    await User.findByIdAndDelete(req.user._id)
    
    res.status(204).json()
  } catch(error) {
    res.status(500).json(error)
  }
})

router.patch('/users/me', authMiddleware, async (req, res) => {
  const allowUpdates = ["name", "password", "email", "age"]
  const requestedUpdates = Object.keys(req.body)
  const isValidUpdate = requestedUpdates.every(update => allowUpdates.includes(update))
  try {
    if (!isValidUpdate) {
      return res.status(400).json("Not a valid update!")
    } 

    const user = req.user
    //ver a diferenca do foreach pro map
    requestedUpdates.map(update => {
      user[update] = req.body[update]
    })

    // isso nao funciona com o hash da senha e o pre
    // const updatedUser = await User.findByIdAndUpdate(req.params?.id, req.body, {new: true, runValidators: true})
    // if (!user) {
    //   return res.status(500).json()
    // }

    await user.save()

    res.status(200).json(user)

  } catch(error) {
    res.status(500).json(error)
  }
})

router.post('/users/login', async (req, res) => {
  //email e senha
  const {email, password} = req.body
  if (!email || !password) {
    return res.status(400).json("Something went wrong")
  }

  try {
    const user = await User.findByCredentials(email, password)
  
    if (!user) {
      return res.status(500).json("Something went wrong")
    }
    
    const token = jwt.sign({email: email}, process.env.JWT_SECRET_KEY, {expiresIn: "1 day"})

    if (!token) {
      console.log('problem')
    }

    //pode ser { token } tambem
    user.tokens = user.tokens.concat({token: token}) 

    await user.save()

    res.status(200).json(user)

  } catch(error) {
    res.status(500).json(error)
  }

})

router.post('/users/logout', authMiddleware, async (req, res) => {
  try {
    const user = req.user
    
    user.tokens = user.tokens.filter(token => {
      return token.token != req.token
    })

    await user.save()

    res.status(200).json(user)

  } catch(error) {
    res.status(500).json(error)
  }

})

router.post('/users/logout/all', authMiddleware, async (req, res) => {
  try {
    const user = req.user
    
    user.tokens = []

    await user.save()

    res.status(200).json(user)

  } catch(error) {
    res.status(500).json(error)
  }

})


module.exports = router