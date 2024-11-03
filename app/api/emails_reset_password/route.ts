/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import Imap from "node-imap"
import { simpleParser } from "mailparser"

const imapConfig = {
  user: process.env.IMAP_USER as string,
  password: process.env.IMAP_PASSWORD as string,
  host: "imap.gmail.com",
  port: 993,
  tls: true,
}

const fetchLatestEmails = (searchEmail: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const imap = new Imap(imapConfig)

    imap.once("ready", () => {
      imap.openBox("INBOX", true, (err, box) => {
        if (err) return reject(err)

        console.log(`Fetching emails for ${searchEmail}...`)

        const fetchRange = `${Math.max(box.messages.total - 149, 1)}:${
          box.messages.total
        }`
        const f = imap.seq.fetch(fetchRange, {
          bodies: "",
          struct: true,
        })

        const matchedEmails: any[] = []

        f.on("message", (msg) => {
          let buffer = ""
          let uid: string | null = null

          msg.on("attributes", (attrs) => {
            uid = attrs.uid ? String(attrs.uid) : null
          })

          msg.on("body", (stream) => {
            stream.on("data", (chunk) => {
              buffer += chunk.toString("utf8")
            })

            stream.once("end", async () => {
              const from = extractHeader(buffer, "From") || "Unknown"
              const to = extractHeader(buffer, "To") || "Unknown"
              const subject = extractHeader(buffer, "Subject") || "No Subject"

              try {
                const parsedEmail = await simpleParser(buffer)
                const htmlBody = parsedEmail.html || parsedEmail.text || ""

                if (
                  (to.includes(searchEmail) || from.includes(searchEmail)) &&
                  (htmlBody.includes("Reset your password") ||
                    htmlBody.includes("รีเซ็ตรหัสผ่านของคุณ"))
                ) {
                  matchedEmails.push({
                    uid,
                    from,
                    to,
                    subject,
                    date: parsedEmail.date || "Unknown",
                    body: htmlBody,
                  })
                  console.log(`Matched email with UID: ${uid}`)
                  console.log(`Subject: \n ${subject}`)
                }
              } catch (err) {
                console.error(`Error parsing email with UID ${uid}:`, err)
              }
            })
          })
        })

        f.once("end", () => {
          console.log("Fetch operation complete.")
          imap.end()
          resolve(matchedEmails)
        })
      })
    })

    imap.once("error", (err) => {
      console.error("IMAP error:", err)
      reject(err)
    })

    imap.once("end", () => {
      console.log("IMAP connection ended.")
    })

    imap.connect()
  })
}

// Function to extract email headers
const extractHeader = (emailData: string, headerName: string) => {
  const regex = new RegExp(`^${headerName}: (.+)$`, "mi")
  const match = emailData.match(regex)
  return match ? match[1].trim() : null
}

// API route handler
export async function GET(request: Request) {
  const { search } = Object.fromEntries(new URL(request.url).searchParams)

  try {
    const matchedEmails = await fetchLatestEmails(search || "")
    console.log(`Returning ${matchedEmails.length} MATCHED EMAILS!`)

    const response = new NextResponse(JSON.stringify(matchedEmails), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })

    return response
  } catch (error) {
    console.error("Error fetching emails:", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch emails" }),
      { status: 500 }
    )
  }
}
