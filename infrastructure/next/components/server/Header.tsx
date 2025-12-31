import Header from "../Header"
import { getCurrentUser } from "@/lib/users/server"

export default async function HeaderServer() {
    const currentUser = await getCurrentUser()

    return <Header initialUser={currentUser} />
}
