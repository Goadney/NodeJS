//imports
var jwt = require('jsonwebtoken'); 
//const pour signer
const JWT_SIGN_SECRET = 'Mhy1BozYdR9o92Vr5vTcgP7b0kegC85Dt851EBX2WzGZ7O2V3qrN7aD8sWVVf3JQbN1diCc6480cYKw38lbhy8LELxxF3c23s787uS6996hLZX';
//exporter les fonctions 
module.exports = {
    generateTokenForUser: function(userData){ 
        return jwt.sign({ 
            userId: userData.id,
            isAdmin: userData.isAdmin

        },
        JWT_SIGN_SECRET,
        {
            expiresIn: '1h'
        }
        )

    },
    parseAuthorization: function(authorization){
        return (authorization != null) ? authorization.replace('Bearer ','') : null;

    },
    getUserId: function(authorization) { 
        var userId = -1;
        var token = module.exports.parseAuthorization(authorization);
        if (token != null){ 
            try { 
                var jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
                if(jwtToken != null){
                    userId =jwtToken.userId;
                }
        } catch(err){}

        }
        return userId;  
    }
    
}