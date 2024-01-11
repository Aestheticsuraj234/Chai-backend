import mongoose , {Schema} from 'mongoose';

const subscriptionSchema = new Schema({
subscriber:{
    type: Schema.Types.ObjectId, //one who is subscribing
    ref: 'User',
},
channel:{
    type: Schema.Types.ObjectId, //one who is whom we are subscribing
    ref: 'User',
}    

},{timestamp:true})

export const Subscription =  mongoose.model('Subscription', subscriptionSchema);