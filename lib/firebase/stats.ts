import { collection, query, where, getCountFromServer } from "firebase/firestore"
import { db, auth } from "./config"

export async function getUserStats() {
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  // Query for all posts
  const postsQuery = query(collection(db, "posts"), where("userId", "==", user.uid))
  const totalPostsSnapshot = await getCountFromServer(postsQuery)
  const totalPosts = totalPostsSnapshot.data().count

  // Query for scheduled posts
  const scheduledPostsQuery = query(
    collection(db, "posts"),
    where("userId", "==", user.uid),
    where("status", "==", "scheduled"),
  )
  const scheduledPostsSnapshot = await getCountFromServer(scheduledPostsQuery)
  const scheduledPosts = scheduledPostsSnapshot.data().count

  // Query for published posts
  const publishedPostsQuery = query(
    collection(db, "posts"),
    where("userId", "==", user.uid),
    where("status", "==", "published"),
  )
  const publishedPostsSnapshot = await getCountFromServer(publishedPostsQuery)
  const publishedPosts = publishedPostsSnapshot.data().count

  return {
    totalPosts,
    scheduledPosts,
    publishedPosts,
  }
}
