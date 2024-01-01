import returnFetch from "return-fetch"

export const http = returnFetch({
  baseUrl: "https://api.staircrusher.club/",
  headers: { "Content-Type": "application/json" },
})
