import {supabase} from "../supabaseClient.ts";

export default function getCurrentUser(){
    const {data} = await supabase.auth.getUser()
    return data.user
}