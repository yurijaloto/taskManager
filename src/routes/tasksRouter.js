const express = require('express')
const router = express.Router()
const {Task} = require('./../models')
const {authMiddleware} = require('./../middlewares')

router.post('/tasks', authMiddleware, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      owner: req.user._id
    })

    await task.save()
    // console.log(teste._id.getTimestamp())
    // console.log(teste._id.valueOf())
    // console.log(teste._id.toString())
    res.status(202).json(task)
  } catch(error) {
    res.status(400).json(error)
  }
})

router.get('/tasks', authMiddleware, async (req,res) => {
  //Lembrar que tem opcao dos cursores pra apps muito grandes. P nao carregar tudo de uma vez na memoria
  const match = {}
  const sort = {}

  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
  }

  if (req.query.sort) {
    const sortType = [
      {
        type: 'des',
        exec: () => {
          return -1
        }
      },
      {
        type: 'ace',
        exec: () => {
          return 1
        }
      }
    ]

    sort.createdAt = sortType.find(option => option.type === req.query.sort).exec()
  }
  try {
    // {owner: req.user._id} - tinha usado no find
    //em baixo daria pra trazer req.user e popular o campo tasks dos users. E ai o reply seria req.user.task
    // const tasks = await Task.find(query).populate({
    //   path: 'owner',
    //   match: {
    //     owner: req.user_id
    //   },
    //   select: 'name age',
    //   options: {
    //     limit: 1
    //   }
    // })
    // //Ou pode user o populate
    // // await req.user.populate('tasks')
    // if (tasks?.length == 0) {
    //   return res.status(404).json([])
    // }

    // res.status(200).json(tasks)
    await req.user.populate({
      path: 'tasks',
      match: match,
      options: {
        limit: parseInt(req?.query?.limit),
        skip: parseInt(req?.query?.skip),
        sort
      }
    })

    res.status(200).json(req.user.tasks)

  } catch(error) {
    res.status(500).json(error)
  }
})

router.get('/tasks/:id', authMiddleware, async (req,res) => {
  try {
    const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
    if (!task) {
      return res.status(404).json()
    }
    res.json(task)

  } catch(error) {
    res.status(500).json(error)
  }
})

router.delete('/tasks/:id', authMiddleware, async (req,res) => {
  try {
    // const deletedTask = await Task.findByIdAndDelete(req.params.id)
    const deletedTask = await Task.deleteOne({_id: req.params.id, owner: req.user._id})
    if (!deletedTask) {
      return res.status(404).json()
    }
    res.status(204).json()
  } catch(error) {
    res.status(500).json(error)
  }
})

router.patch('/tasks/:id', authMiddleware, async (req,res) => {
  const allowUpdates = ['description', 'completed']
  const updates = Object.keys(req.body)
  const isValidOperation = updates.every(update => allowUpdates.includes(update))
  try {
    if (!isValidOperation) {
      return res.status(400).send("Invalid operation")
    }
    const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
    // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
    if (!task) {
      return res.status(404).json()
    }

    updates.map(update => {
      task[update] = req.body[update]
    })
    res.status(200).json(task)
  } catch(error) {
    res.status(400).json(error)
  }

})

module.exports = router
