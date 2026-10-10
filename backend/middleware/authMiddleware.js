import jwt from "jsonwebtoken";

const protect = (req,res,next)=>{
    try{
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({
                message:"Please login first"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.SECRETE_KEY
        );

        req.user= decoded;
        next()

    }catch(error){
        return res.status(401).json({
            message: "Invalid or expired token"
        })
    }
}

export default protect;