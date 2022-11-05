require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person.js')
const { request } = require('express')

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))


app.get('/', (request, response) => {
  response.send('index.html')
})

app.get('/info', (request, response) => {
  const time = new Date()
  Person.find({}).then(result => {
    const numPeople = result.length
    response.send(`<p>Phonebook has info for ${numPeople} people.</p> <br> ${time}`)
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
})

const generateId = () => {
  return Math.floor(Math.random() * 1000)
}

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  /*if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    } else if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }*/
  const person = new Person({
    id: generateId(),
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const id = request.params.id
  const person = {
    id: id,
    name: body.name,
    number: body.number
  }
  Person.findByIdAndUpdate(id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'bad request' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})