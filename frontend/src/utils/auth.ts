import {supabase} from "../supabaseClient.ts";

export default async function getCurrentUser(){
    const {data} = await supabase.auth.getUser()
    return data.user
}