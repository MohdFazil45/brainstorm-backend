import express from 'express'
import z from "zod"
import bcrypt from 'bcrypt'
import { ContentModel, UserModel } from './db.js'
import  jwt  from 'jsonwebtoken'
import { auth } from './middleware.js'
import { JWT_SECRET } from './config.js'
const app = express()

app.use(express.json())

app.post("/api/v1/signup",async (req, res)=> {
  const requiredBody = z.object({
    username: z.string(),
    password: z.string().min(7).max(14)
  })

  const parseDataWithSuccess = requiredBody.safeParse(req.body)

  if (!parseDataWithSuccess.success) {
    return res.json({
      msg:"Incorrect format",
      error: parseDataWithSuccess.error
    })
  }

  const {username, password} = req.body

  const hashedPassword = await bcrypt.hash(password,5)

  const userAlreadySingeUp = await UserModel.findOne({
    username:username,
  })

  console.log(userAlreadySingeUp)

  if (userAlreadySingeUp) {
    return res.json({
      msg:"username already exist"
    })
  }  

  await UserModel.create({
    username:username,
    password:hashedPassword
  })

  res.json({
    msg:"user signedup "
  })

})

app.post("/api/v1/signin",async (req, res)=>{
  const {username, password} = req.body

  const response = await UserModel.findOne({
    username:username,
  })

  console.log(response)

  if(!response || !response.password){
    return res.json({
      msg:"user not exist"
    })
  }

  const passwordHashed = await bcrypt.compare(password, response.password )

  if (passwordHashed) {
    const token = jwt.sign({
      id:response._id
    },JWT_SECRET)
    res.json({
      msg:"token",
      token
    })
  } else {
    res.status(403).json({
      msg:"incorrect credential"
    })
  }

})

app.post("/api/v1/content",auth,async (req, res) => {
  const link = req.body.link
  const type = req.body.type

  ContentModel.create({
    link,
    type,
    //@ts-ignore
    userId:req.userId,
    tags: []
  })

  res.json({
    msg:"content added"
  })
})

app.get("/api/v1/content",auth,async (req, res) => {
  // @ts-ignore
  const userId = req.userId
  const content = await ContentModel.find({
    userId:userId
  }).populate("userId","username")

  res.json({
    content
  })
})

app.delete("/api/v1/content",auth,async (req, res) => {
  const contentId = req.body.contentId
  const content = await ContentModel.deleteMany({
    contentId,
    //@ts-ignore
    userId:req.userId
  })

  res.json({
    msg:"Deleted"
  })
})

app.post("/api/v1/brain/share",(req,res)=>{
  
})

app.get("/api/v1/brain/:shareLink",(req,res)=>{
  
})
app.listen(3000)