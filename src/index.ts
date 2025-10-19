import express from 'express'
import z from "zod"
import bcrypt from 'bcrypt'
import { ContentModel, LinkModel, UserModel } from './db.js'
import  jwt  from 'jsonwebtoken'
import { auth } from './middleware.js'
import { JWT_SECRET } from './config.js'
import { random } from './hashing.js'
import cors from "cors"


const app = express()

app.use(express.json())
app.use(cors({
  origin: "https://your-frontend.netlify.app", // Replace with your Netlify URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

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
    title: req.body.title,
    userId:req.userId,
    tags: []
  })

  res.json({
    msg:"content added"
  })
})

app.get("/api/v1/content",auth,async (req, res) => {
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
  await ContentModel.deleteOne({
    contentId,
    userId:req.userId
  })

  res.json({
    msg:"Deleted"
  })
})

app.post("/api/v1/brain/share",auth,async (req,res)=>{
  const share = req.body.share
  if (share) {

    const existingLink = await LinkModel.findOne({
      userId: req.userId
    })

    if (existingLink) {
      res.json({
        hash: existingLink.hash
      })
    }

    const hash = random(10)
    await LinkModel.create({
      userId: req.userId,
      hash: hash
    })

    res.json({
      msg: hash
    })
  } else {
    await LinkModel.deleteOne({
      userId:req.userId
    })
  
    res.json({
      msg:" removed link"
    })

  }
})

app.get("/api/v1/brain/:shareLink",async (req,res)=>{
  const hash = req.params.shareLink

  const link = await LinkModel.findOne({
    hash
  })

  if (!link) {
    res.status(411).json({
      msg:"Sorry incorrect input"
    })
    return
  }

  const content = await ContentModel.find({
    userId:link.userId
  })

  const user = await UserModel.findOne({
    _id: link.userId
  })

  if (!user) {
    res.status(411).json({
      msg:"user not found, error should ideally not happen"
    })
    return
  }

  res.json({
    username: user.username,
    content: content
  })

})
app.listen(3000)