const express=require('express')
const router=express.Router();
const path = require('path');
const post=require('../../models/post')
const User=require('../../models/user')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken');
const user = require('../../models/user');
const multer=require('multer')
// const multer=require('multer')

const jwtSecret=process.env.JWT_SECRET; 
const adminLayout='../views/layouts/admin.ejs';
/*
MiddleWare to upload image
*/

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
}) 

const upload = multer({ storage: storage })



/*
MiddleWare to be stay login
*/


const authMiddleware=(req,res,next)=>{
    const token=req.cookies.token;

    if(!token){
        return res.redirect('/admin')
        // return res.status(401).json({message:'unathorised'})
    }

    try {
        const decoded=jwt.verify(token,jwtSecret);
        req.userId=decoded.userId;
       
        next();
    } catch (error) {
       return res.redirect('/admin')
    }
    

}




/*
->GET/
-->Admin-login Page

*/
router.get('/admin',async(req,res)=>{
    
    try {
        const local={
            title:"admin",
            description:" buy and sell something "
        
        }
        
        res.render('admin/signin.ejs',{local,layout:adminLayout});
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal server error');
    }
    
});
/*
->GET/
-->register-login Page

*/
router.get('/register',async(req,res)=>{
    
    try {
        const local={
            title:"Register",
            description:" buy and sell something "
        
        }
        
        res.render('admin/register.ejs',{local,layout:adminLayout});
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal server error');
    }
    
});

/*
->POST/
-->Admin-authentication login 

*/
router.post('/admin',async(req,res)=>{
    
    try {
       const {email,password}=req.body;
    //    console.log(req.body);
        const user=await User.findOne({email});
        // console.log(user);
        if(!user){
           
            return res.status(401).json({message:'Invalid credential'});
        }

        const isPasswordValid=await bcrypt.compare(password,user.password);
       if(!isPasswordValid){
        return res.status(401).json({message:'Invalid credential'});
       }
       
       const token=jwt.sign({userId:user._id},jwtSecret);
       res.cookie('token',token,{httpOnly:true});
       return res.redirect('/dashboard');

       
    } catch (error) {
        console.log(error)
    }
    
});

/*
->GET/
-->Admin-Dashboard  
*/
router.get('/dashboard',authMiddleware,async(req,res)=>{
    
    try {
      const local = {
          title: 'Dashboard',
          description:'dashboard of admin'
      }
      //const data=await post.aggregate([{$sort: {createdAt:-1}}]);
      const userId = req.userId;
      // console.log('userId: ',userId)
      const data= await post.find({userid:userId });
       
      // console.log(data);
      res.render('admin/dashboard',{
         local,
         data,
         layout:adminLayout
      });
         
      
    } catch (error) {
     console.log(error)
     res.status(500).send('Internal server error');
    }
 });

// router.get('/dashboard/:id',authMiddleware,async(req,res)=>{
//    const slug=req.params.id;
//    try {
//      const local = {
//          title: 'Dashboard',
//          description:'dashboard of admin'
//      }
//      const data= await post.find({userId:slug});
//      console.log(data);
//      res.render('admin/dashboard',{
//         local,
//         data
//      });
        
     
//    } catch (error) {
//     console.log(error)
//    }
// });

/*
->GET/
-->Admin-create new post 
*/

router.get('/add-post',authMiddleware,async(req,res)=>{
    
    try {
      const local = {
          title: 'add post',
          description:'dashboard of admin'
      }
      const data= await post.find();
    //   console.log(data);
      res.render('admin/add-post',{
         local,
        layout:adminLayout
      });
         
      
    } catch (error) {
     console.log(error)
     res.status(500).send('Internal server error');
    }
 });

/*
->POST/
-->Admin-create new post 
*/

router.post('/add-post',authMiddleware,upload.single('image'),async(req,res)=>{
    // 
    try {
        const data=req.body;
        // console.log(req.body);
        // console.log(req.file.filename);

        try {
            const newPost=new post({
               image:`images/${req.file.filename}`,
               title:data.title,
               price:data.price,
               number:data.number,
               upiId:data.upiId,
               college:data.college,
               userid:req.userId,
               description:data.description


            });
            // console.log(newPost);
            await post.create(newPost);
            return res.redirect('/dashboard')
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal server error');
        }
   
    } catch (error) {
     console.log(error)
     res.status(500).send('Internal server error');
    }
 });

 /**
 * GET /
 * Admin - Create New Post
*/
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
  
      const local = {
        title: "Edit Post",
        description: "edit the post",
      };
  
      const data = await post.findOne({ _id: req.params.id });
      // console.log('data-g',data);
      res.render('admin/edit-post', {
        local,
        data,
        layout: adminLayout
      })
  
    } catch (error) {
      console.log(error);
      res.status(500).send('Internal server error');
    }
  
  });
  
  
  /**
   * PUT /
   * Admin - Edit  Post
  */
  router.put('/edit-post/:id', authMiddleware, upload.single('image'),async (req, res) => {
    try {
      
      const updateData = {
        title: req.body.title,
        price: req.body.price,
        number: req.body.number,
        upiId: req.body.upiId,
        college: req.body.college,
        description: req.body.description,
        updatedAt: Date.now(),
      };

      if (req.file) {
        updateData.image = `images/${req.file.filename}`;
      }

      await post.findByIdAndUpdate(req.params.id,updateData );
      
      // console.log('data-e',req.body);
    return  res.redirect('/dashboard');
  
    } catch (error) {
      console.log(error);
      res.status(500).send('Internal server error');
    }
  
  });
  
  
  
  
 
  
  /**
   * DELETE /
   * Admin - Delete Post
  */
  router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  
    try {
      await post.deleteOne( { _id: req.params.id } );
      
      return res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
      res.status(500).send('Internal server error');
    }
  
  });
  


/*
->POST/
-->Admin-register  
*/


router.post('/register',async(req,res)=>{
    
    try {
        const { username,email,password} = req.body;
        
        if (!email) {
          return res.status(400).json({ message: 'Email is required' });
      }

      // Check if email already exists
      const existingUser = await User.findOne({ email });
        // console.log(existingUser);
      if (existingUser) { 
          return res.status(409).json({ message: 'Email already in use' });
      }
      // console.log(email);
        const hashedPassword=await bcrypt.hash(password,10);
        
        try {
          // console.log(email);
            const user=await User.create({username,email,password:hashedPassword});
            // console.log(user)
           
          //  return  res.status(201).json({message:'User Created',user});
              
         return res.redirect('/admin')
        } catch (error) {
          // console.log(email);
          console.log(error)
            if(error.code===11000){
               return res.status(409).json({message:'User already in use'});
            }

               return res.status(500).json({message:'internal server error',error});
        }

    } catch (error) {
        console.log(error)
    }
    
});

/*
->GET/
-->Admin-Logout  
*/

router.get('/logout',(req,res)=>{

    res.clearCookie('token');
    res.redirect('/');

})


module.exports=router;