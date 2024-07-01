const express=require('express')
const router=express.Router();
const post=require('../../models/post')
const User=require('../../models/user')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken');
const user = require('../../models/user');

const jwtSecret=process.env.JWT_SECRET; 
const adminLayout='../views/layouts/admin.ejs';

/*
MiddleWare to be stay login

*/
const authMiddleware=(req,res,next)=>{
    const token=req.cookies.token;

    if(!token){
        res.redirect('/admin')
        // return res.status(401).json({message:'unathorised'})
    }

    try {
        const decoded=jwt.verify(token,jwtSecret);
        req.userId=decoded.userId;
        next();
    } catch (error) {
        res.redirect('/admin')
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
        
        res.render('admin/index.ejs',{local,layout:adminLayout});
    } catch (error) {
        console.log(error)
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
       res.redirect('/dashboard');

       
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
      const data= await post.find();
    //   console.log(data);
      res.render('admin/dashboard',{
         local,
         data,
         layout:adminLayout
      });
         
      
    } catch (error) {
     console.log(error)
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
    }
 });

/*
->POST/
-->Admin-create new post 
*/

router.post('/add-post',authMiddleware,async(req,res)=>{
    
    try {
        const data=req.body;
        try {
            const newPost=new post({
               title:data.title,
               price:data.price,
               number:data.number,
               upiId:data.title,
               description:data.description


            });
            await post.create(newPost);
            re.redirect('/dashboard')
        } catch (error) {
            console.log(error);
        }
      
      res.redirect('/dashboard');
      
    } catch (error) {
     console.log(error)
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
  
      res.render('admin/edit-post', {
        local,
        data,
        layout: adminLayout
      })
  
    } catch (error) {
      console.log(error);
    }
  
  });
  
  
  /**
   * PUT /
   * Admin - Create New Post
  */
  router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
      
      await post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
               price: req.body.price,
               number: req.body.number,
               upiId: req.body.title,
               description: req.body.description,
        updatedAt: Date.now()
      });
  
      res.redirect('/dashboard');
  
    } catch (error) {
      console.log(error);
    }
  
  });
  
  
  
  
 
  
  /**
   * DELETE /
   * Admin - Delete Post
  */
  router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  
    try {
      await post.deleteOne( { _id: req.params.id } );
      
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }
  
  });
  


/*
->POST/
-->Admin-register  
*/


router.post('/register',async(req,res)=>{
    
    try {
        const {username ,email, password} = req.body;
        
        const hashedPassword=await bcrypt.hash(password,10);
        
        try {
           
            const user=await User.create({username,email,password:hashedPassword});
           
            res.status(201).json({message:'User Created',user});
                
        } catch (error) {
            if(error.code===11000){
                res.status(409).json({message:'User already in use'});
            }

                res.status(500).json({message:'internal server error',error});
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

    res.clearCookie('tooken');
    res.redirect('/');

})


module.exports=router;