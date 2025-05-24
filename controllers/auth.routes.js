const User = require("../models/User")
const Worker = require("../models/Worker")
const Company = require("../models/Company")

const router = require("express").Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const verifyToken = require("../middleware/verify-token")

router.post("/sign-up",async(req,res)=>{
    try{
        const foundUser = await User.findOne({username:req.body.username})
        
        if(foundUser){
            return res.status(409).json({err:"username already taken"})
        }

        if(!req.body.username || !req.body.password || !req.body.role){
            return res.status(400).json({err:"Please provide username, password and role"})
        }

        // validate the password
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/ // Example regex for password validation
        if (!passwordRegex.test(req.body.password)) {
            return res.status(400).json({ err: "Password must be at least 8 characters long and contain at least one letter and one number" })
        }

        // Check if the role is valid
        const validRoles = ["Worker", "Company"]
        if (!validRoles.includes(req.body.role)) {
            return res.status(400).json({ err: "Invalid role" })
        }


        // Check if detials based on the role are provided
        if (req.body.role === "Worker") {
            if (!req.body.name || !req.body.phone) {
                return res.status(400).json({ err: "Please provide name and phone number" })
            }
            // check if name is unique
            const foundWorker = await Worker.find({ name: req.body.name })
            if (foundWorker.length > 0) {
                return res.status(409).json({ err: "name already taken" })
            }

            // check if phone is valid
            const phoneRegex = /^[0-9]{8}$/ // Example regex for 10-digit phone number
            if (!phoneRegex.test(req.body.phone)) {
                return res.status(400).json({ err: "Invalid phone number" })
            }
        } else if (req.body.role === "Company") {
            if (!req.body.name || !req.body.phone) {
                return res.status(400).json({ err: "Please provide name, phone number" })
            }
             // check if name is unique
             const foundCompany = await Company.find({ name: req.body.name })
             if (foundCompany.length > 0) {
                 return res.status(409).json({ err: "name already taken" })
             }
 
             // check if phone is valid
             const phoneRegex = /^[0-9]{8}$/ // Example regex for 10-digit phone number
             if (!phoneRegex.test(req.body.phone)) {
                 return res.status(400).json({ err: "Invalid phone number" })
             }
        }
        const createdUser = await User.create({
            username:req.body.username,
            hashedPassword: bcrypt.hashSync(req.body.password,12),
            role: req.body.role,
        })
        console.log(createdUser)
        


        const convertedObject = createdUser.toObject()
        delete convertedObject.hashedPassword



        if (req.body.role === "Worker") {
            createdWorker = await Worker.create({
                userId: createdUser._id,
                name: req.body.name,
                phone: req.body.phone,
            })
        } else if (req.body.role === "Company") {
            createdCompany = await Company.create({
                userId: createdUser._id,
                name: req.body.name,
                phone: req.body.phone,
                profileImage: req.body.profileImage || "defaultProgileImage.png",
            })
        }
        res.json(convertedObject)

    }
    catch(error){
        res.status(500).json(error)
    }

})

router.post("/login", async(req,res)=>{
    // destructure the req.body
    const {username,password} = req.body
    try{
        // 1. check if the user already signed up
        const foundUser = await User.findOne({username})

        // if there isnt a user this means that the user hasnt signed up yet
        if(!foundUser){
            return res.status(401).json({err:"username not signed up. Please sign up"})
        }

        // 2. check if the password given in the req.body matches the passowrd in the DB
        const isPasswordMatch = bcrypt.compareSync(password,foundUser.hashedPassword)
        if(!isPasswordMatch){
            return res.status(401).json({err:"username or password incorrect"})
        }

        // 3. check if the user is active or not
        if(foundUser.status !== "Active"){
            return res.status(401).json({err:"user is not active"})
        }
        // 4. create the JWT token
        const payload = foundUser.toObject()
        delete payload.hashedPassword

         // If the user is a worker or a company, we need to populate the user with the worker or company details
        if (foundUser.role === "Worker") {
            const worker = await Worker.findOne({ userId: foundUser._id })
            payload.workerId = worker._id
        } else if (foundUser.role === "Company") {
            const company = await Company.findOne({ userId: foundUser._id })
            payload.companyId = company._id
        }
        

        // sign(payload, secret password, expirastion time)
        const token = jwt.sign({payload},process.env.JWT_SECRET,{expiresIn:"60m"})


       
        res.status(200).json({token})

    }catch(error){
        res.status(500).json(error)
    }
})

router.get("/verify",verifyToken,(req,res)=>{
    console.log(req.user)
    res.json(req.user)
})




module.exports = router