import { options } from "../api/auth/[...nextauth]/options"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

export default async function Campground() {
    const session = await getServerSession(options)

    if (!session) {
        redirect('/login')
    }

    return (
        <div>
          <h1>salat</h1>
        </div>
    )

}
